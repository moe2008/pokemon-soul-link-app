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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, Info } from "lucide-react"
import type { Pokemon } from "@/hooks/use-soullink-data"

interface RevivePokemonDialogProps {
  pokemon: Pokemon
  onRevive: (pokemonId: string) => void
  trigger?: React.ReactNode
}

export function RevivePokemonDialog({ pokemon, onRevive, trigger }: RevivePokemonDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleConfirm = () => {
    onRevive(pokemon.id)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700 bg-transparent">
            <Heart className="h-4 w-4 mr-2" />
            Revive
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <Heart className="h-5 w-5" />
            Revive Pokemon
          </DialogTitle>
          <DialogDescription>
            Bring back <strong>{pokemon.nickname || pokemon.name}</strong> (Lv. {pokemon.level}) to your active team
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
          <Info className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            This Pokemon will be moved back to your active team and removed from the graveyard.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button variant="default" onClick={handleConfirm} className="flex-1 bg-green-600 hover:bg-green-700">
            Confirm Revival
          </Button>
          <Button variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
