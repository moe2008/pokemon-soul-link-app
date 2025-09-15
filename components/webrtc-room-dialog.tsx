"use client";

import React, { useState, useEffect } from "react";
import { useWebRTCSoullink } from "@/hooks/use-webrtc-soullink";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Wifi,
  WifiOff,
  Copy,
  UserPlus,
  Crown,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Share2,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

type WebRTCRoomDialogProps = {
  children: React.ReactNode;
  webrtc: ReturnType<typeof useWebRTCSoullink>;
};
// WebRTC Room Dialog Component
export function WebRTCRoomDialog({ children, webrtc }: WebRTCRoomDialogProps) {
  const {
    isConnected,
    connectionStatus,
    roomInfo,
    peerId,
    createRoom,
    joinRoom,
    leaveRoom,
  } = webrtc;

  const [isOpen, setIsOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [hostName, setHostName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [shareableLink, setShareableLink] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showFullCode, setShowFullCode] = useState(false);
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>(
    {}
  );

  // Check for stored room data on component mount
  useEffect(() => {
    const storedRoom = localStorage.getItem("webrtc_room");
    const storedRole = localStorage.getItem("webrtc_role");
    const storedJoinCode = localStorage.getItem("webrtc_join_code");

    if (storedRoom && storedRole === "host") {
      try {
        const roomData = JSON.parse(storedRoom);
        setRoomName(roomData.name);
        setHostName(roomData.hostName);
        // Auto-create room if we're the host
        createRoom(roomData.name);
      } catch (error) {
        console.error("Failed to parse stored room data:", error);
      }
    } else if (storedJoinCode && storedRole === "guest") {
      setJoinCode(storedJoinCode);
      // Auto-join if we have a join code
      handleJoinRoom(storedJoinCode);
    }
  }, []);

  // Generate shareable link when room is created
  useEffect(() => {
    if (roomInfo && roomInfo.isHost && peerId) {
      const roomData = {
        roomId: peerId,
        hostPeerId: peerId,
        roomName: roomInfo.name,
        type: "soullink",
      };
      const encodedData = btoa(JSON.stringify(roomData));
      setShareableLink(encodedData);
    }
  }, [roomInfo, peerId]);

  const handleCreateRoom = async () => {
    if (!roomName.trim() || !hostName.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsCreating(true);
    try {
      const result = await createRoom(roomName);
      if (result) {
        // Store room data for persistence
        const roomData = {
          id: result.roomId,
          name: roomName,
          hostName: hostName,
          created: new Date(),
          offer: result.offer,
        };
        localStorage.setItem("webrtc_room", JSON.stringify(roomData));
        localStorage.setItem("webrtc_role", "host");
        localStorage.setItem("webrtc_host_name", hostName);

        toast.success("Room created successfully!");
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Failed to create room:", error);
      toast.error("Failed to create room");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (code?: string) => {
    const codeToUse = code || joinCode;
    if (!codeToUse.trim()) {
      toast.error("Please enter a room code");
      return;
    }

    setIsJoining(true);
    try {
      let hostPeerId: string;
      let roomId: string;

      // Try to parse as JSON (new format)
      try {
        const roomData = JSON.parse(atob(codeToUse));
        hostPeerId = roomData.hostPeerId;
        roomId = roomData.roomId;
      } catch {
        // Fallback: treat as direct peer ID
        hostPeerId = codeToUse;
        roomId = codeToUse;
      }

      const result = await joinRoom(roomId, hostPeerId);
      if (result) {
        localStorage.setItem("webrtc_join_code", codeToUse);
        localStorage.setItem("webrtc_role", "guest");

        toast.success("Connecting to room...");
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Failed to join room:", error);
      toast.error("Failed to join room");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    localStorage.removeItem("webrtc_room");
    localStorage.removeItem("webrtc_role");
    localStorage.removeItem("webrtc_join_code");
    localStorage.removeItem("webrtc_host_name");
    setShareableLink("");
    toast.success("Left room");
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);

      // Set copied state for this specific item
      setCopiedStates((prev) => ({ ...prev, [key]: true }));

      toast.success("Copied to clipboard!");

      // Reset after 2 seconds
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy");
    }
  };

  const truncateCode = (code: string, maxLength: number = 20) => {
    if (code.length <= maxLength) return code;
    return `${code.slice(0, maxLength)}...`;
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-500";
      case "connecting":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <CheckCircle className="h-4 w-4" />;
      case "connecting":
        return <Clock className="h-4 w-4 animate-spin" />;
      default:
        return <WifiOff className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            WebRTC Connection
          </DialogTitle>
          <DialogDescription>
            Connect with your Soullink partner in real-time
          </DialogDescription>
        </DialogHeader>

        {roomInfo ? (
          <RoomManagement
            roomInfo={roomInfo}
            peerId={peerId}
            connectionStatus={connectionStatus}
            shareableLink={shareableLink}
            onLeaveRoom={handleLeaveRoom}
            onCopyLink={copyToClipboard}
            copiedStates={copiedStates}
          />
        ) : (
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Create
              </TabsTrigger>
              <TabsTrigger value="join" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Join
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="room-name">Room Name</Label>
                  <Input
                    id="room-name"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Enter room name..."
                    maxLength={50}
                  />
                </div>
                <div>
                  <Label htmlFor="host-name">Your Name</Label>
                  <Input
                    id="host-name"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="Enter your name..."
                    maxLength={30}
                  />
                </div>
                <Button
                  onClick={handleCreateRoom}
                  disabled={isCreating || !roomName.trim() || !hostName.trim()}
                  className="w-full"
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
              </div>
            </TabsContent>

            <TabsContent value="join" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="join-code">Room Code</Label>
                  <div className="relative">
                    <Textarea
                      id="join-code"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      placeholder="Paste the room code here..."
                      rows={4}
                      className="font-mono text-xs resize-none w-full overflow-hidden break-all whitespace-pre-wrap"
                      style={{
                        wordBreak: "break-all",
                        overflowWrap: "break-word",
                        whiteSpace: "pre-wrap",
                      }}
                    />
                    {joinCode.length > 50 && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="text-xs">
                          {joinCode.length} chars
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Paste the invite code from your partner
                    </p>
                    {joinCode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setJoinCode("")}
                        className="text-xs h-6 px-2"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => handleJoinRoom()}
                  disabled={isJoining || !joinCode.trim()}
                  className="w-full"
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
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Connection Status */}
        <div className="flex items-center justify-center gap-2 pt-4 border-t">
          <span className={`${getStatusColor()}`}>{getStatusIcon()}</span>
          <span className="text-sm text-muted-foreground">
            {connectionStatus === "connected" && "Connected"}
            {connectionStatus === "connecting" && "Connecting..."}
            {connectionStatus === "disconnected" && "Disconnected"}
          </span>
          {peerId && (
            <Badge variant="outline" className="text-xs font-mono">
              {peerId.slice(0, 8)}...
            </Badge>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Room Management Component
function RoomManagement({
  roomInfo,
  peerId,
  connectionStatus,
  shareableLink,
  onLeaveRoom,
  onCopyLink,
  copiedStates,
}: {
  roomInfo: any;
  peerId: string;
  connectionStatus: string;
  shareableLink: string;
  onLeaveRoom: () => void;
  onCopyLink: (text: string, key: string) => void;
  copiedStates: { [key: string]: boolean };
}) {
  const [showFullRoomId, setShowFullRoomId] = useState(false);
  const [showFullInvite, setShowFullInvite] = useState(false);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            {roomInfo.isHost ? (
              <Crown className="h-4 w-4 text-yellow-500" />
            ) : (
              <Users className="h-4 w-4 text-blue-500" />
            )}
            {roomInfo.isHost ? "Hosting Room" : "Joined Room"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Room Name</p>
            <p className="font-medium break-words">{roomInfo.name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Room ID</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <code className="text-xs font-mono bg-muted px-2 py-1 rounded block truncate">
                    {showFullRoomId
                      ? roomInfo.id
                      : `${roomInfo.id.slice(0, 16)}...`}
                  </code>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFullRoomId(!showFullRoomId)}
                  className="shrink-0"
                >
                  {showFullRoomId ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCopyLink(roomInfo.id, "roomId")}
                  className="shrink-0"
                >
                  {copiedStates.roomId ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {roomInfo.isHost && shareableLink && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Invite Code</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded block break-all">
                      {showFullInvite
                        ? shareableLink
                        : `${shareableLink.slice(0, 24)}...`}
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFullInvite(!showFullInvite)}
                    className="shrink-0"
                  >
                    {showFullInvite ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCopyLink(shareableLink, "invite")}
                  className="w-full"
                >
                  {copiedStates.invite ? (
                    <>
                      <Check className="h-3 w-3 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3 w-3 mr-2" />
                      Copy Invite Code
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Share this code with your partner to join
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-500"
                    : connectionStatus === "connecting"
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-red-500"
                }`}
              />
              <span className="text-sm text-muted-foreground">
                {connectionStatus === "connected" && "Connected"}
                {connectionStatus === "connecting" && "Connecting..."}
                {connectionStatus === "disconnected" && "Disconnected"}
              </span>
            </div>
            <Button variant="destructive" size="sm" onClick={onLeaveRoom}>
              Leave Room
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// WebRTC Status Indicator Component
export function WebRTCStatusIndicator() {
  const { isConnected, connectionStatus, roomInfo, peerId } =
    useWebRTCSoullink();

  if (!roomInfo) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      <div
        className={`w-2 h-2 rounded-full ${
          isConnected
            ? "bg-green-500"
            : connectionStatus === "connecting"
            ? "bg-yellow-500 animate-pulse"
            : "bg-red-500"
        }`}
      />
      <span className="text-muted-foreground">
        {isConnected ? "Real-time sync active" : "Connecting..."}
      </span>
      {roomInfo.isHost && <Crown className="h-3 w-3 text-yellow-500" />}
    </div>
  );
}

// WebRTC Sync Button Component
export function WebRTCSyncButton({
  webrtc,
}: {
  webrtc: ReturnType<typeof useWebRTCSoullink>;
}) {
  const { isConnected, syncData, lastSyncTime } = webrtc;
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (!isConnected) return;

    setIsSyncing(true);
    try {
      const success = syncData();
      if (success) {
        toast.success("Data synced successfully!");
      } else {
        toast.error("Sync failed - not connected");
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isConnected) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={isSyncing}
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
      {isSyncing ? "Syncing..." : "Sync Now"}
    </Button>
  );
}
