import { useState, useEffect, useRef, useCallback } from "react";
import { useSoullinkData } from "./use-soullink-data";
import Peer, { DataConnection } from "peerjs";
import type { SoullinkData } from "./use-soullink-data";

interface WebRTCMessage {
  type: "data-update" | "player-update" | "badge-update" | "pokemon-action";
  payload: any;
  timestamp: number;
  senderId: string;
}

interface RoomInfo {
  id: string;
  name: string;
  hostId: string;
  isHost: boolean;
}

export function useWebRTCSoullink(onImportData: (d: SoullinkData) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [peerId, setPeerId] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const peer = useRef<Peer | null>(null);
  const connection = useRef<DataConnection | null>(null);
  const isInitialized = useRef(false);

  // Hilfsfunktion um aktuelle Daten zu holen
  const getCurrentData = useCallback(() => {
    const saved = localStorage.getItem("pokemon-soullink-data");
    return saved ? JSON.parse(saved) : {};
  }, []);

  // Clean up function
  const cleanupConnection = useCallback(() => {
    if (connection.current) {
      connection.current.removeAllListeners();
      connection.current.close();
      connection.current = null;
    }

    if (peer.current && !peer.current.destroyed) {
      peer.current.removeAllListeners();
      peer.current.destroy();
    }

    peer.current = null;
    setIsConnected(false);
    setConnectionStatus("disconnected");
    setPeerId("");
  }, []);

  // Initialize PeerJS
  useEffect(() => {
    if (isInitialized.current) return;

    const initPeer = () => {
      cleanupConnection(); // Clean up any existing connections

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
        setupConnection(conn);
      });

      peerInstance.on("error", (err) => {
        console.error("Peer error:", err);
        setConnectionStatus("disconnected");

        // Handle specific error cases
        if (err.type === "peer-unavailable") {
          console.log("Peer unavailable, cleaning up stored data");
          // Don't auto-clear data, let user decide
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

  // Setup data connection
  const setupConnection = useCallback((conn: DataConnection) => {
    // Clean up existing connection
    if (connection.current && connection.current !== conn) {
      connection.current.removeAllListeners();
      connection.current.close();
    }

    connection.current = conn;
    setConnectionStatus("connecting");

    conn.on("open", () => {
      console.log("Data connection opened");
      setIsConnected(true);
      setConnectionStatus("connected");
    });

    conn.on("data", (receivedData) => {
      try {
        const message = receivedData as WebRTCMessage;
        console.log("Received message:", message.type, message.payload);
        handleIncomingMessage(message);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    conn.on("close", () => {
      console.log("Connection closed");
      setIsConnected(false);
      setConnectionStatus("disconnected");
      if (connection.current === conn) {
        connection.current = null;
      }
    });

    conn.on("error", (err) => {
      console.error("Connection error:", err);
      setConnectionStatus("disconnected");
      if (connection.current === conn) {
        connection.current = null;
      }
    });
  }, []);

  // Handle incoming messages
  const handleIncomingMessage = useCallback(
    (message: WebRTCMessage) => {
      console.log("Processing received message:", message.type);

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

  // Send message
  const sendMessage = useCallback((message: WebRTCMessage) => {
    if (connection.current && connection.current.open) {
      console.log("Sending message:", message.type, message.payload);
      connection.current.send(message);
      return true;
    } else {
      console.warn("Cannot send message - connection not open");
      return false;
    }
  }, []);

  // Create room (Host) - Simple room creation without persistence
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
      };

      setRoomInfo(roomData);

      console.log(`Room created with ID: ${peerId}`);

      return {
        roomId: peerId,
        offer: peerId,
        isHost: true,
      };
    },
    [peerId]
  );

  // Join room (Guest) - Fixed error handling
  const joinRoom = useCallback(
    async (roomId: string, hostPeerId: string) => {
      if (!peer.current || peer.current.destroyed) {
        console.error("Peer not ready for connection");
        return null;
      }

      // Clear any existing connection first
      if (connection.current) {
        connection.current.close();
        connection.current = null;
      }

      setConnectionStatus("connecting");

      try {
        console.log("Attempting to connect to:", hostPeerId);

        const conn = peer.current.connect(hostPeerId, {
          reliable: true,
          serialization: "json",
        });

        // Set up connection handlers
        setupConnection(conn);

        setRoomInfo({
          id: hostPeerId,
          name: "Joined Room",
          hostId: hostPeerId,
          isHost: false,
        });

        return "connecting";
      } catch (error) {
        console.error("Failed to connect:", error);
        setConnectionStatus("disconnected");
        throw error;
      }
    },
    [setupConnection]
  );

  // Leave room - Simple cleanup
  const leaveRoom = useCallback(() => {
    console.log("Leaving room...");

    if (connection.current) {
      connection.current.close();
      connection.current = null;
    }

    setIsConnected(false);
    setRoomInfo(null);
    setConnectionStatus("disconnected");

    console.log("Room left");
  }, []);

  // Manual reconnect function
  const reconnect = useCallback(async () => {
    const storedRole = localStorage.getItem("webrtc_role");
    const storedRoom = localStorage.getItem("webrtc_room");
    const storedJoinCode = localStorage.getItem("webrtc_join_code");

    if (!peer.current || !peerId) {
      console.error("Peer not ready for reconnection");
      return false;
    }

    if (storedRole === "host" && storedRoom) {
      try {
        const roomData = JSON.parse(storedRoom);
        const result = await createRoom(roomData.name);
        return !!result;
      } catch (error) {
        console.error("Failed to reconnect as host:", error);
        return false;
      }
    } else if (storedRole === "guest" && storedJoinCode) {
      try {
        let hostPeerId: string;
        let roomId: string;

        try {
          const roomData = JSON.parse(atob(storedJoinCode));
          hostPeerId = roomData.hostPeerId;
          roomId = roomData.roomId;
        } catch {
          hostPeerId = storedJoinCode;
          roomId = storedJoinCode;
        }

        const result = await joinRoom(roomId, hostPeerId);
        return !!result;
      } catch (error) {
        console.error("Failed to reconnect as guest:", error);
        return false;
      }
    }

    return false;
  }, [peerId, createRoom, joinRoom]);

  // Sync functions
  const syncData = useCallback(() => {
    const currentData = getCurrentData();

    const message: WebRTCMessage = {
      type: "data-update",
      payload: currentData,
      timestamp: Date.now(),
      senderId: peerId,
    };

    const success = sendMessage(message);
    if (success) {
      setLastSyncTime(new Date());
    }
    return success;
  }, [peerId, sendMessage, getCurrentData]);

  const syncPlayerUpdate = useCallback(
    (playerKey: "player1" | "player2", playerData?: any) => {
      const freshData = playerData || getCurrentData()[playerKey];

      const message: WebRTCMessage = {
        type: "player-update",
        payload: { playerKey, playerData: freshData },
        timestamp: Date.now(),
        senderId: peerId,
      };

      return sendMessage(message);
    },
    [peerId, sendMessage, getCurrentData]
  );

  const syncBadgeUpdate = useCallback(
    (playerKey: "player1" | "player2", badgeId: string, earned: boolean) => {
      const message: WebRTCMessage = {
        type: "badge-update",
        payload: { playerKey, badgeId, earned },
        timestamp: Date.now(),
        senderId: peerId,
      };

      return sendMessage(message);
    },
    [peerId, sendMessage]
  );

  const syncPokemonAction = useCallback(
    (
      action: string,
      playerKey: "player1" | "player2",
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

      return sendMessage(message);
    },
    [peerId, sendMessage]
  );

  return {
    // Connection State
    isConnected,
    connectionStatus,
    roomInfo,
    peerId,
    lastSyncTime,

    // Room Management
    createRoom,
    joinRoom,
    leaveRoom,

    // Data Sync
    syncData,
    syncPlayerUpdate,
    syncBadgeUpdate,
    syncPokemonAction,
  };
}
