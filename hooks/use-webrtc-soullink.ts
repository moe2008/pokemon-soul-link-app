import { useState, useEffect, useRef, useCallback } from "react";
import { useSoullinkData } from "./use-soullink-data";
import Peer, { DataConnection } from "peerjs";
import type { SoullinkData } from "./use-soullink-data";

interface WebRTCMessage {
  type:
    | "data-update"
    | "player-update"
    | "badge-update"
    | "pokemon-action"
    | "player-join"
    | "player-leave";
  payload: any;
  timestamp: number;
  senderId: string;
}

interface ConnectedPlayer {
  id: string;
  connection: DataConnection;
  playerKey: "player1" | "player2" | "player3";
  name?: string;
}

interface RoomInfo {
  id: string;
  name: string;
  hostId: string;
  isHost: boolean;
  maxPlayers: number;
  currentPlayers: number;
  connectedPlayers: string[];
}

export function useWebRTCSoullink(onImportData: (d: SoullinkData) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [peerId, setPeerId] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [myPlayerKey, setMyPlayerKey] = useState<
    "player1" | "player2" | "player3" | null
  >(null);

  const peer = useRef<Peer | null>(null);
  // Für Host: Multiple Connections zu Guests
  const hostConnections = useRef<Map<string, ConnectedPlayer>>(new Map());
  // Für Guest: Eine Connection zum Host
  const guestConnection = useRef<DataConnection | null>(null);
  const isInitialized = useRef(false);

  // Hilfsfunktion um aktuelle Daten zu holen
  const getCurrentData = useCallback(() => {
    const saved = localStorage.getItem("pokemon-soullink-data");
    return saved ? JSON.parse(saved) : {};
  }, []);

  // Clean up function
  const cleanupConnection = useCallback(() => {
    // Clean up host connections
    hostConnections.current.forEach((player) => {
      player.connection.removeAllListeners();
      player.connection.close();
    });
    hostConnections.current.clear();

    // Clean up guest connection
    if (guestConnection.current) {
      guestConnection.current.removeAllListeners();
      guestConnection.current.close();
      guestConnection.current = null;
    }

    if (peer.current && !peer.current.destroyed) {
      peer.current.removeAllListeners();
      peer.current.destroy();
    }

    peer.current = null;
    setIsConnected(false);
    setConnectionStatus("disconnected");
    setPeerId("");
    setMyPlayerKey(null);
  }, []);

  // Initialize PeerJS
  useEffect(() => {
    if (isInitialized.current) return;

    const initPeer = () => {
      cleanupConnection();

      const peerInstance = new Peer({
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun.relay.metered.ca:80" },
            {
              urls: "turn:a.relay.metered.ca:80",
              username: "82b86fb7ac9e006dd5831543",
              credential: "uK5+zxQoJSaDmhzk",
            },
            {
              urls: "turn:a.relay.metered.ca:80?transport=tcp",
              username: "82b86fb7ac9e006dd5831543",
              credential: "uK5+zxQoJSaDmhzk",
            },
            {
              urls: "turn:a.relay.metered.ca:443",
              username: "82b86fb7ac9e006dd5831543",
              credential: "uK5+zxQoJSaDmhzk",
            },
            {
              urls: "turn:a.relay.metered.ca:443?transport=tcp",
              username: "82b86fb7ac9e006dd5831543",
              credential: "uK5+zxQoJSaDmhzk",
            },
          ],
        },
      });

      peerInstance.on("open", (id) => {
        console.log("Peer connected with ID:", id);
        setPeerId(id);
      });

      peerInstance.on("connection", (conn) => {
        console.log("Incoming connection from:", conn.peer);
        setupHostConnection(conn);
      });

      peerInstance.on("error", (err) => {
        console.error("Peer error:", err);
        setConnectionStatus("disconnected");

        if (err.type === "peer-unavailable") {
          console.log("Peer unavailable, cleaning up stored data");
        }
      });

      peerInstance.on("disconnected", () => {
        console.log("Peer disconnected, attempting reconnect...");
        if (!peerInstance.destroyed) {
          peerInstance.reconnect();
        }
      });

      peer.current = peerInstance;
    };

    initPeer();
    isInitialized.current = true;

    return () => {
      cleanupConnection();
      isInitialized.current = false;
    };
  }, [cleanupConnection]);

  // Setup connection as HOST (accepting incoming connections)
  const setupHostConnection = useCallback(
    (conn: DataConnection) => {
      // Check if room is full
      if (hostConnections.current.size >= 2) {
        console.log("Room is full, rejecting connection");
        conn.close();
        return;
      }

      console.log(`Setting up host connection for: ${conn.peer}`);

      conn.on("open", () => {
        console.log(`Guest ${conn.peer} connected`);

        // Assign player key based on connection order
        const playerKey =
          hostConnections.current.size === 0 ? "player2" : "player3";

        const connectedPlayer: ConnectedPlayer = {
          id: conn.peer,
          connection: conn,
          playerKey,
        };

        hostConnections.current.set(conn.peer, connectedPlayer);

        // Update room info
        setRoomInfo((prev) =>
          prev
            ? {
                ...prev,
                currentPlayers: hostConnections.current.size + 1, // +1 for host
                connectedPlayers: Array.from(hostConnections.current.keys()),
              }
            : null
        );

        // Send player assignment and current data to new player
        sendToSpecificPlayer(conn, {
          type: "player-join",
          payload: {
            assignedPlayerKey: playerKey,
            currentData: getCurrentData(),
            roomInfo: {
              connectedPlayers: Array.from(
                hostConnections.current.values()
              ).map((p) => ({
                id: p.id,
                playerKey: p.playerKey,
              })),
            },
          },
          timestamp: Date.now(),
          senderId: peerId,
        });

        // Notify other players about new connection
        broadcastToGuests(
          {
            type: "player-join",
            payload: {
              newPlayerId: conn.peer,
              newPlayerKey: playerKey,
            },
            timestamp: Date.now(),
            senderId: peerId,
          },
          conn.peer
        ); // Exclude the new player from broadcast

        updateConnectionStatus();
      });

      conn.on("data", (receivedData) => {
        try {
          const message = receivedData as WebRTCMessage;
          console.log("Host received message:", message.type, message.payload);
          handleHostMessage(message, conn);
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      });

      conn.on("close", () => {
        console.log(`Guest ${conn.peer} disconnected`);
        const player = hostConnections.current.get(conn.peer);
        if (player) {
          hostConnections.current.delete(conn.peer);

          // Notify remaining players
          broadcastToGuests({
            type: "player-leave",
            payload: {
              leftPlayerId: conn.peer,
              leftPlayerKey: player.playerKey,
            },
            timestamp: Date.now(),
            senderId: peerId,
          });

          updateRoomInfo();
          updateConnectionStatus();
        }
      });

      conn.on("error", (err) => {
        console.error(`Connection error with ${conn.peer}:`, err);
        const player = hostConnections.current.get(conn.peer);
        if (player) {
          hostConnections.current.delete(conn.peer);
          updateRoomInfo();
          updateConnectionStatus();
        }
      });
    },
    [peerId, getCurrentData]
  );

  // Setup connection as GUEST (connecting to host)
  const setupGuestConnection = useCallback((conn: DataConnection) => {
    guestConnection.current = conn;
    setConnectionStatus("connecting");

    conn.on("open", () => {
      console.log("Connected to host");
      setIsConnected(true);
      setConnectionStatus("connected");
    });

    conn.on("data", (receivedData) => {
      try {
        const message = receivedData as WebRTCMessage;
        console.log("Guest received message:", message.type, message.payload);
        handleGuestMessage(message);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    conn.on("close", () => {
      console.log("Connection to host closed");
      setIsConnected(false);
      setConnectionStatus("disconnected");
      guestConnection.current = null;
      setMyPlayerKey(null);
    });

    conn.on("error", (err) => {
      console.error("Connection error:", err);
      setConnectionStatus("disconnected");
      guestConnection.current = null;
      setMyPlayerKey(null);
    });
  }, []);

  // Handle messages as HOST
  const handleHostMessage = useCallback(
    (message: WebRTCMessage, senderConn: DataConnection) => {
      console.log(
        `Host processing message from ${message.senderId}:`,
        message.type
      );

      // Apply the change locally
      handleIncomingMessage(message);

      // Broadcast to all OTHER guests (not the sender)
      broadcastToGuests(message, message.senderId);
    },
    []
  );

  // Handle messages as GUEST
  const handleGuestMessage = useCallback(
    (message: WebRTCMessage) => {
      console.log("Guest processing message:", message.type);

      switch (message.type) {
        case "player-join":
          if (message.payload.assignedPlayerKey) {
            // This is our player assignment
            setMyPlayerKey(message.payload.assignedPlayerKey);
            if (message.payload.currentData) {
              onImportData(message.payload.currentData);
            }
          }
          break;

        default:
          handleIncomingMessage(message);
          break;
      }
    },
    [onImportData]
  );

  // Handle incoming messages (common for both host and guest)
  const handleIncomingMessage = useCallback(
    (message: WebRTCMessage) => {
      switch (message.type) {
        case "data-update":
          console.log("Importing full data update:", message.payload);
          onImportData(message.payload);
          setLastSyncTime(new Date());
          break;

        case "player-update":
          const { playerKey, playerData } = message.payload;
          console.log(`Updating ${playerKey} with:`, playerData);
          const currentData = getCurrentData();
          const updatedData = {
            ...currentData,
            [playerKey]: playerData,
          };
          onImportData(updatedData);
          break;

        case "badge-update":
          const {
            badgeId,
            playerKey: badgePlayerKey,
            earned,
          } = message.payload;
          console.log(`Badge update: ${badgePlayerKey} ${badgeId} = ${earned}`);
          const currentBadgeData = getCurrentData();
          const updatedBadgeData = { ...currentBadgeData };

          if (!updatedBadgeData[badgePlayerKey]) {
            console.error(`Player ${badgePlayerKey} not found in data`);
            return;
          }

          updatedBadgeData[badgePlayerKey].earnedBadges[badgeId] = earned;
          if (earned) {
            updatedBadgeData[badgePlayerKey].badges++;
          } else {
            updatedBadgeData[badgePlayerKey].badges--;
          }
          onImportData(updatedBadgeData);
          break;

        case "pokemon-action":
          handlePokemonAction(message.payload);
          break;
      }
    },
    [onImportData, getCurrentData]
  );

  // Handle Pokemon actions
  const handlePokemonAction = useCallback(
    (payload: any) => {
      const { action, playerKey, pokemonData, pokemonId, cause } = payload;
      console.log(`Pokemon action: ${action} for ${playerKey}`, {
        pokemonData,
        pokemonId,
        cause,
      });

      const currentData = getCurrentData();
      const updatedData = { ...currentData };

      if (!updatedData[playerKey]) {
        console.error(`Player ${playerKey} not found in data`);
        return;
      }

      switch (action) {
        case "add":
          const newPokemon = {
            ...pokemonData,
            id: `${playerKey}_${Date.now()}`,
          };
          updatedData[playerKey].team.push(newPokemon);
          updatedData[playerKey].encounters[newPokemon.location] = newPokemon;
          updatedData[playerKey].alive++;
          break;

        case "kill":
          const pokemonIndex = updatedData[playerKey].team.findIndex(
            (p: any) => p.id === pokemonId
          );
          if (pokemonIndex !== -1) {
            const pokemon = updatedData[playerKey].team[pokemonIndex];
            pokemon.status = "dead";
            if (cause) pokemon.cause = cause;

            updatedData[playerKey].team.splice(pokemonIndex, 1);
            updatedData[playerKey].graveyard.push(pokemon);
            updatedData[playerKey].alive--;
            updatedData[playerKey].dead++;
          }
          break;

        case "revive":
          const graveyardIndex = updatedData[playerKey].graveyard.findIndex(
            (p: any) => p.id === pokemonId
          );
          if (graveyardIndex !== -1) {
            const pokemon = updatedData[playerKey].graveyard[graveyardIndex];
            pokemon.status = "alive";
            delete pokemon.cause;

            updatedData[playerKey].graveyard.splice(graveyardIndex, 1);
            updatedData[playerKey].team.push(pokemon);
            updatedData[playerKey].alive++;
            updatedData[playerKey].dead--;
          }
          break;
      }

      onImportData(updatedData);
    },
    [onImportData, getCurrentData]
  );

  // Broadcast message to all guests (as host)
  const broadcastToGuests = useCallback(
    (message: WebRTCMessage, excludeId?: string) => {
      hostConnections.current.forEach((player) => {
        if (excludeId && player.id === excludeId) return;

        if (player.connection.open) {
          console.log(`Broadcasting to ${player.id}:`, message.type);
          player.connection.send(message);
        }
      });
    },
    []
  );

  // Send message to specific player (as host)
  const sendToSpecificPlayer = useCallback(
    (conn: DataConnection, message: WebRTCMessage) => {
      if (conn.open) {
        console.log(`Sending to ${conn.peer}:`, message.type);
        conn.send(message);
      }
    },
    []
  );

  // Send message to host (as guest)
  const sendToHost = useCallback((message: WebRTCMessage) => {
    if (guestConnection.current && guestConnection.current.open) {
      console.log("Sending to host:", message.type, message.payload);
      guestConnection.current.send(message);
      return true;
    } else {
      console.warn("Cannot send message - not connected to host");
      return false;
    }
  }, []);

  // Update connection status
  const updateConnectionStatus = useCallback(() => {
    const isHost = roomInfo?.isHost ?? false;

    if (isHost) {
      // Host is "connected" when room is created and ready for guests
      setIsConnected(true);
      setConnectionStatus("connected");
    }
    // Guest connection status is handled in setupGuestConnection
  }, [roomInfo]);

  // Update room info
  const updateRoomInfo = useCallback(() => {
    setRoomInfo((prev) =>
      prev
        ? {
            ...prev,
            currentPlayers: hostConnections.current.size + 1,
            connectedPlayers: Array.from(hostConnections.current.keys()),
          }
        : null
    );
  }, []);

  // Create room (Host)
  const createRoom = useCallback(
    async (roomName: string) => {
      if (!peer.current || !peerId) {
        console.error("Peer not ready");
        return null;
      }

      const roomData = {
        id: peerId,
        name: roomName,
        hostId: peerId,
        isHost: true,
        maxPlayers: 3,
        currentPlayers: 1,
        connectedPlayers: [],
      };

      setRoomInfo(roomData);
      setMyPlayerKey("player1"); // Host is always player1

      // Host is immediately ready for connections
      setIsConnected(true);
      setConnectionStatus("connected");

      console.log(`3-Player room created with ID: ${peerId}`);

      return {
        roomId: peerId,
        offer: peerId,
        isHost: true,
      };
    },
    [peerId]
  );

  // Join room (Guest)
  const joinRoom = useCallback(
    async (roomId: string, hostPeerId: string) => {
      if (!peer.current || peer.current.destroyed) {
        console.error("Peer not ready for connection");
        return null;
      }

      // Clear any existing connection first
      if (guestConnection.current) {
        guestConnection.current.close();
        guestConnection.current = null;
      }

      setConnectionStatus("connecting");

      try {
        console.log("Attempting to connect to:", hostPeerId);

        const conn = peer.current.connect(hostPeerId, {
          reliable: true,
          serialization: "json",
        });

        setupGuestConnection(conn);

        setRoomInfo({
          id: hostPeerId,
          name: "Joined Room",
          hostId: hostPeerId,
          isHost: false,
          maxPlayers: 3,
          currentPlayers: 0, // Will be updated when we receive player-join
          connectedPlayers: [],
        });

        return "connecting";
      } catch (error) {
        console.error("Failed to connect:", error);
        setConnectionStatus("disconnected");
        throw error;
      }
    },
    [setupGuestConnection]
  );

  // Leave room
  const leaveRoom = useCallback(() => {
    console.log("Leaving room...");

    if (roomInfo?.isHost) {
      // Host leaving - notify all guests and close connections
      broadcastToGuests({
        type: "player-leave",
        payload: { hostLeaving: true },
        timestamp: Date.now(),
        senderId: peerId,
      });

      hostConnections.current.forEach((player) => {
        player.connection.close();
      });
      hostConnections.current.clear();
    } else {
      // Guest leaving - close connection to host
      if (guestConnection.current) {
        guestConnection.current.close();
        guestConnection.current = null;
      }
    }

    setIsConnected(false);
    setRoomInfo(null);
    setConnectionStatus("disconnected");
    setMyPlayerKey(null);

    console.log("Room left");
  }, [roomInfo, peerId, broadcastToGuests]);

  // Sync functions
  const syncData = useCallback(() => {
    const currentData = getCurrentData();

    const message: WebRTCMessage = {
      type: "data-update",
      payload: currentData,
      timestamp: Date.now(),
      senderId: peerId,
    };

    let success = false;

    if (roomInfo?.isHost) {
      broadcastToGuests(message);
      success = true;
    } else {
      success = sendToHost(message);
    }

    if (success) {
      setLastSyncTime(new Date());
    }
    return success;
  }, [peerId, getCurrentData, roomInfo, broadcastToGuests, sendToHost]);

  const syncPlayerUpdate = useCallback(
    (playerKey: "player1" | "player2" | "player3", playerData?: any) => {
      const freshData = playerData || getCurrentData()[playerKey];

      const message: WebRTCMessage = {
        type: "player-update",
        payload: { playerKey, playerData: freshData },
        timestamp: Date.now(),
        senderId: peerId,
      };

      if (roomInfo?.isHost) {
        broadcastToGuests(message);
        return true;
      } else {
        return sendToHost(message);
      }
    },
    [peerId, getCurrentData, roomInfo, broadcastToGuests, sendToHost]
  );

  const syncBadgeUpdate = useCallback(
    (
      playerKey: "player1" | "player2" | "player3",
      badgeId: string,
      earned: boolean
    ) => {
      const message: WebRTCMessage = {
        type: "badge-update",
        payload: { playerKey, badgeId, earned },
        timestamp: Date.now(),
        senderId: peerId,
      };

      if (roomInfo?.isHost) {
        broadcastToGuests(message);
        return true;
      } else {
        return sendToHost(message);
      }
    },
    [peerId, roomInfo, broadcastToGuests, sendToHost]
  );

  const syncPokemonAction = useCallback(
    (
      action: string,
      playerKey: "player1" | "player2" | "player3",
      pokemonData?: any,
      pokemonId?: string,
      cause?: string
    ) => {
      const message: WebRTCMessage = {
        type: "pokemon-action",
        payload: { action, playerKey, pokemonData, pokemonId, cause },
        timestamp: Date.now(),
        senderId: peerId,
      };

      if (roomInfo?.isHost) {
        broadcastToGuests(message);
        return true;
      } else {
        return sendToHost(message);
      }
    },
    [peerId, roomInfo, broadcastToGuests, sendToHost]
  );

  return {
    // Connection State
    isConnected,
    connectionStatus,
    roomInfo,
    peerId,
    lastSyncTime,
    myPlayerKey, // NEW: Which player am I?

    // Room Management
    createRoom,
    joinRoom,
    leaveRoom,

    // Data Sync (now supports player3)
    syncData,
    syncPlayerUpdate,
    syncBadgeUpdate,
    syncPokemonAction,

    // NEW: Connection info
    connectedPlayersCount: roomInfo?.currentPlayers || 0,
    maxPlayers: 3,
  };
}
