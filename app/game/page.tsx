"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Crown,
  UserPlus,
  User,
  RefreshCw,
  Trash2,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

interface MousePosition {
  x: number;
  y: number;
}

interface WebRTCRoom {
  id: string;
  name: string;
  hostName: string;
  created: Date;
  peerId: string;
}

interface StoredConnectionData {
  role: "host" | "guest";
  roomData?: any;
  joinCode?: string;
  hostName?: string;
}

export default function PokemonSoullinkLanding() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const [showJoinDialog, setShowJoinDialog] = useState<boolean>(false);
  const [roomName, setRoomName] = useState<string>("");
  const [hostName, setHostName] = useState<string>("");
  const [joinCode, setJoinCode] = useState<string>("");
  const [createdRoom, setCreatedRoom] = useState<WebRTCRoom | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [storedConnectionData, setStoredConnectionData] =
    useState<StoredConnectionData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Floating orbs für visuelle Effekte
  const floatingOrbs = [
    {
      id: 1,
      width: 100,
      height: 100,
      color1: "#10B981",
      color2: "#059669",
      left: 10,
      top: 20,
      duration: 6,
      delay: 0,
    },
    {
      id: 2,
      width: 150,
      height: 150,
      color1: "#14B8A6",
      color2: "#0D9488",
      left: 80,
      top: 10,
      duration: 8,
      delay: 2,
    },
    {
      id: 3,
      width: 80,
      height: 80,
      color1: "#22C55E",
      color2: "#16A34A",
      left: 20,
      top: 70,
      duration: 7,
      delay: 1,
    },
    {
      id: 4,
      width: 120,
      height: 120,
      color1: "#10B981",
      color2: "#14B8A6",
      left: 70,
      top: 60,
      duration: 9,
      delay: 3,
    },
    {
      id: 5,
      width: 90,
      height: 90,
      color1: "#059669",
      color2: "#047857",
      left: 5,
      top: 50,
      duration: 5,
      delay: 1.5,
    },
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Check for stored connection data on mount
  useEffect(() => {
    const storedRole = localStorage.getItem("webrtc_role");
    const storedRoom = localStorage.getItem("webrtc_room");
    const storedJoinCode = localStorage.getItem("webrtc_join_code");
    const storedHostName = localStorage.getItem("webrtc_host_name");

    if (storedRole && (storedRoom || storedJoinCode)) {
      let connectionData: StoredConnectionData = {
        role: storedRole as "host" | "guest",
      };

      if (storedRole === "host" && storedRoom) {
        try {
          connectionData.roomData = JSON.parse(storedRoom);
          connectionData.hostName = storedHostName || "";
          setHostName(storedHostName || "");
        } catch (error) {
          console.error("Failed to parse stored room data:", error);
          // Clear invalid data
          handleClearStoredData();
          return;
        }
      } else if (storedRole === "guest" && storedJoinCode) {
        connectionData.joinCode = storedJoinCode;
        setJoinCode(storedJoinCode);
      }

      setStoredConnectionData(connectionData);
    }
  }, []);

  const handleCreateRoom = async (): Promise<void> => {
    if (!roomName.trim() || !hostName.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setIsCreating(true);

    try {
      // Generate unique room ID
      const roomId = `room_${Math.random().toString(36).substr(2, 9)}`;

      // Create room data
      const room: WebRTCRoom = {
        id: roomId,
        name: roomName,
        hostName: hostName,
        created: new Date(),
        peerId: "", // Will be set when PeerJS connects
      };

      // Store room data for persistence
      localStorage.setItem("webrtc_room", JSON.stringify(room));
      localStorage.setItem("webrtc_role", "host");
      localStorage.setItem("webrtc_host_name", hostName);

      setCreatedRoom(room);
      console.log("Room created:", room);

      // Short delay for UI feedback, then redirect
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      console.error("Failed to create room:", error);
      alert("Failed to create room. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (): Promise<void> => {
    if (!joinCode.trim()) {
      alert("Please enter a room code");
      return;
    }

    setIsJoining(true);

    try {
      let roomData;

      // Try to parse join code as base64 encoded room data
      try {
        roomData = JSON.parse(atob(joinCode));
        console.log("Parsed room data:", roomData);
      } catch {
        // Fallback: treat as simple peer ID
        roomData = {
          roomId: joinCode,
          hostPeerId: joinCode,
          roomName: "Joined Room",
          type: "soullink",
        };
      }

      // Store join information
      localStorage.setItem("webrtc_join_data", JSON.stringify(roomData));
      localStorage.setItem("webrtc_role", "guest");
      localStorage.setItem("webrtc_join_code", joinCode);

      console.log("Joining room with data:", roomData);

      // Redirect to dashboard
      router.push("/");
    } catch (error) {
      console.error("Failed to join room:", error);
      alert("Invalid room code. Please check and try again.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleReconnect = async (): Promise<void> => {
    if (!storedConnectionData) return;

    setIsReconnecting(true);

    try {
      // Redirect to dashboard where the WebRTC hook will handle reconnection
      router.push("/");
    } catch (error) {
      console.error("Reconnection failed:", error);
      alert("Reconnection failed");
    } finally {
      setIsReconnecting(false);
    }
  };

  const handleClearStoredData = (): void => {
    localStorage.removeItem("webrtc_room");
    localStorage.removeItem("webrtc_role");
    localStorage.removeItem("webrtc_join_code");
    localStorage.removeItem("webrtc_host_name");
    localStorage.removeItem("webrtc_join_data");

    // Reset local state
    setStoredConnectionData(null);
    setRoomName("");
    setHostName("");
    setJoinCode("");
    setCreatedRoom(null);

    alert("Stored connection data cleared");
  };

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Code copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Failed to copy to clipboard");
    }
  };

  const goToDashboard = () => {
    router.push("/");
  };

  const getStoredDataDescription = () => {
    if (!storedConnectionData) return "";

    if (storedConnectionData.role === "host" && storedConnectionData.roomData) {
      return `Host room: "${storedConnectionData.roomData.name}"`;
    } else if (
      storedConnectionData.role === "guest" &&
      storedConnectionData.joinCode
    ) {
      return `Guest connection with code: ${storedConnectionData.joinCode.slice(
        0,
        20
      )}...`;
    }

    return "Previous connection data";
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 overflow-hidden relative"
      style={{
        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(52, 211, 153, 0.3) 0%, transparent 50%), linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #0f172a 100%)`,
      }}
    >
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
            animation: "gridMove 20s linear infinite",
          }}
        />
      </div>

      {/* Floating orbs */}
      {floatingOrbs.map((orb) => (
        <div
          key={orb.id}
          className="absolute rounded-full opacity-30"
          style={{
            width: `${orb.width}px`,
            height: `${orb.height}px`,
            background: `linear-gradient(45deg, ${orb.color1}, ${orb.color2})`,
            left: `${orb.left}%`,
            top: `${orb.top}%`,
            animation: `float ${orb.duration}s ease-in-out infinite`,
            animationDelay: `${orb.delay}s`,
            filter: "blur(2px)",
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 text-center">
        {/* Logo/Title */}
        <div className="mb-16 relative">
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 mb-4 tracking-wider">
            POKEMON
          </h1>
          <div className="relative">
            <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-mint-400 via-emerald-400 to-green-400 tracking-[0.2em]">
              SOULLINK
            </h2>
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 animate-pulse" />
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-pulse" />
        </div>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-300 mb-16 font-light tracking-wide opacity-80">
          Connect your destinies • Real-time collaboration
        </p>

        {/* Stored Connection Data Alert */}
        {storedConnectionData && !createdRoom && (
          <div className="mb-8 max-w-md w-full">
            <Alert className="bg-emerald-900/40 border-emerald-500/30">
              <AlertCircle className="h-4 w-4 text-emerald-400" />
              <AlertDescription>
                <div className="space-y-3">
                  <p className="text-emerald-100 font-medium">
                    Previous connection found
                  </p>
                  <p className="text-sm text-emerald-200/80">
                    {getStoredDataDescription()}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleReconnect}
                      disabled={isReconnecting}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      size="sm"
                    >
                      {isReconnecting ? (
                        <>
                          <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                          Reconnecting...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-3 w-3 mr-2" />
                          Reconnect
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleClearStoredData}
                      variant="outline"
                      size="sm"
                      className="border-red-500/50 text-red-400 hover:bg-red-900/20 hover:border-red-500"
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Create Game Button */}
          <button
            onClick={() => setShowCreateDialog(true)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={isCreating}
            className="group relative px-12 py-6 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl font-bold text-xl text-white tracking-wider overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              boxShadow: isHovered
                ? "0 25px 50px -12px rgba(16, 185, 129, 0.6), 0 0 0 1px rgba(255,255,255,0.1)"
                : "0 10px 25px -3px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255,255,255,0.05)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            </div>
            <span className="relative z-10 flex items-center gap-3">
              {isCreating ? "CREATING..." : "CREATE ROOM"}
              <Crown
                className={`w-6 h-6 transition-transform duration-300 group-hover:translate-x-1 ${
                  isCreating ? "animate-spin" : ""
                }`}
              />
            </span>
          </button>

          {/* Join Game Button */}
          <button
            onClick={() => setShowJoinDialog(true)}
            disabled={isJoining}
            className="group relative px-12 py-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-bold text-xl text-white tracking-wider overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10 flex items-center gap-3">
              {isJoining ? "JOINING..." : "JOIN ROOM"}
              <UserPlus
                className={`w-6 h-6 transition-transform duration-300 group-hover:translate-x-1 ${
                  isJoining ? "animate-spin" : ""
                }`}
              />
            </span>
          </button>

          {/* Direct Dashboard Access */}
          <button
            onClick={goToDashboard}
            className="group relative px-12 py-6 bg-gradient-to-r from-gray-600 to-slate-600 rounded-2xl font-bold text-xl text-white tracking-wider overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500 via-slate-500 to-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10 flex items-center gap-3">
              SOLO MODE
              <User className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </button>
        </div>

        {/* Created Room Display */}
        {createdRoom && (
          <div className="mb-8 p-6 bg-emerald-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-xl max-w-md">
            <h3 className="text-xl font-bold text-emerald-300 mb-4">
              Room Created!
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-300">Room Name:</p>
                <p className="font-medium text-white">{createdRoom.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-300">Host:</p>
                <p className="font-medium text-white">{createdRoom.hostName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-300">Room ID:</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 px-3 py-2 bg-slate-800 rounded text-green-400 text-xs font-mono">
                    {createdRoom.id}
                  </code>
                  <button
                    onClick={() => copyToClipboard(createdRoom.id)}
                    className="px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center mt-4">
                Redirecting to dashboard...
              </p>
            </div>
          </div>
        )}

        {/* Connection visualization */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex items-center gap-8 opacity-60">
          <div className="w-4 h-4 rounded-full bg-emerald-400 animate-pulse" />
          <div className="w-20 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" />
          </div>
          <div
            className="w-4 h-4 rounded-full bg-teal-400 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
        </div>
      </div>

      {/* Create Room Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-emerald-500/30 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-white mb-4">
              Create New Room
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-gray-300 mb-2">
                  Room Name
                </Label>
                <Input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Enter room name..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name
                </Label>
                <Input
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreateRoom}
                  disabled={!roomName.trim() || !hostName.trim() || isCreating}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Crown className="h-4 w-4 mr-2" />
                      Create Room
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowCreateDialog(false)}
                  disabled={isCreating}
                  variant="outline"
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Room Dialog */}
      {showJoinDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-purple-500/30 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-white mb-4">Join Room</h3>
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-gray-300 mb-2">
                  Room Code
                </Label>
                <Textarea
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Paste the room code here..."
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none font-mono text-xs"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Paste the invite code or peer ID from your partner
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleJoinRoom}
                  disabled={!joinCode.trim() || isJoining}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isJoining ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join Room
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowJoinDialog(false)}
                  disabled={isJoining}
                  variant="outline"
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
      `}</style>
    </div>
  );
}
