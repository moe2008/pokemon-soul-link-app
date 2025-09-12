"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Settings, User } from "lucide-react"

interface Player {
  name: string
  avatar: string
  badges: number
  alive: number
  dead: number
}

interface PlayerSetupDialogProps {
  player: Player
  playerKey: "player1" | "player2"
  onPlayerUpdate: (playerKey: "player1" | "player2", player: Player) => void
}

const avatarOptions = [
  { name: "Ash", url: "/pokemon-trainer-ash.jpg" },
  { name: "Gary", url: "/pokemon-trainer-gary.jpg" },
  { name: "Misty", url: "/pokemon-trainer-misty.jpg" },
  { name: "Brock", url: "/pokemon-trainer-brock.jpg" },
  { name: "Red", url: "/pokemon-trainer-red.jpg" },
  { name: "Blue", url: "/pokemon-trainer-blue.jpg" },
]

export function PlayerSetupDialog({ player, playerKey, onPlayerUpdate }: PlayerSetupDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempPlayer, setTempPlayer] = useState<Player>(player)

  const handleSave = () => {
    onPlayerUpdate(playerKey, tempPlayer)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setTempPlayer(player)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Setup {playerKey === "player1" ? "Player 1" : "Player 2"}
          </DialogTitle>
          <DialogDescription>Customize your trainer profile for the Soullink challenge</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Trainer Name</Label>
            <Input
              id="name"
              value={tempPlayer.name}
              onChange={(e) => setTempPlayer({ ...tempPlayer, name: e.target.value })}
              placeholder="Enter trainer name"
            />
          </div>

          <div className="space-y-3">
            <Label>Choose Avatar</Label>
            <div className="grid grid-cols-3 gap-3">
              {avatarOptions.map((avatar) => (
                <Card
                  key={avatar.name}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    tempPlayer.avatar === avatar.url ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setTempPlayer({ ...tempPlayer, avatar: avatar.url })}
                >
                  <CardContent className="p-3 text-center">
                    <Avatar className="h-12 w-12 mx-auto mb-2">
                      <AvatarImage src={avatar.url || "/placeholder.svg"} alt={avatar.name} />
                      <AvatarFallback>{avatar.name[0]}</AvatarFallback>
                    </Avatar>
                    <p className="text-xs font-medium">{avatar.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
