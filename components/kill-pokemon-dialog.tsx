"use client"

import type React from "react"

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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skull, AlertTriangle } from "lucide-react"
import type { Pokemon } from "@/hooks/use-soullink-data"

interface KillPokemonDialogProps {
  pokemon: Pokemon
  onKill: (pokemonId: string, cause?: string) => void
  trigger?: React.ReactNode
}

const deathCauses = [
  "Fainted in battle",
  "Gym Leader battle",
  "Elite Four battle",
  "Champion battle",
  "Wild Pokemon encounter",
  "Trainer battle",
  "Team Rocket battle",
  "Legendary Pokemon battle",
  "Critical hit",
  "Status condition (poison/burn)",
  "Self-destruct/Explosion",
  "Overleveled opponent",
  "Bad luck",
  "Misplay",
  "Other",
]

export function KillPokemonDialog({ pokemon, onKill, trigger }: KillPokemonDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCause, setSelectedCause] = useState("")
  const [customCause, setCustomCause] = useState("")

  const handleConfirm = () => {
    const cause = selectedCause === "Other" ? customCause : selectedCause
    onKill(pokemon.id, cause || "Unknown cause")
    setIsOpen(false)
    setSelectedCause("")
    setCustomCause("")
  }

  const handleCancel = () => {
    setIsOpen(false)
    setSelectedCause("")
    setCustomCause("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
            <Skull className="h-3 w-3" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Skull className="h-5 w-5" />
            Mark Pokemon as Fainted
          </DialogTitle>
          <DialogDescription>
            Record the loss of <strong>{pokemon.nickname || pokemon.name}</strong> (Lv. {pokemon.level})
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-destructive/50 bg-destructive/5">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            This action cannot be undone. The Pokemon will be moved to the graveyard.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cause">Cause of Death</Label>
            <Select value={selectedCause} onValueChange={setSelectedCause}>
              <SelectTrigger>
                <SelectValue placeholder="Select what happened..." />
              </SelectTrigger>
              <SelectContent>
                {deathCauses.map((cause) => (
                  <SelectItem key={cause} value={cause}>
                    {cause}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCause === "Other" && (
            <div className="space-y-2">
              <Label htmlFor="custom-cause">Custom Cause</Label>
              <Textarea
                id="custom-cause"
                value={customCause}
                onChange={(e) => setCustomCause(e.target.value)}
                placeholder="Describe what happened..."
                rows={3}
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="destructive" onClick={handleConfirm} className="flex-1">
              Confirm Death
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
