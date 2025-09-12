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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Zap } from "lucide-react"
import type { Pokemon } from "@/hooks/use-soullink-data"

interface AddEncounterDialogProps {
  location: string
  onAddPokemon: (pokemon: Omit<Pokemon, "id">) => void
  existingPokemon?: Pokemon | null
}

const pokemonSpecies = [
  "Pidgey",
  "Rattata",
  "Spearow",
  "Ekans",
  "Pikachu",
  "Sandshrew",
  "Nidoran♀",
  "Nidoran♂",
  "Clefairy",
  "Vulpix",
  "Jigglypuff",
  "Zubat",
  "Oddish",
  "Paras",
  "Venonat",
  "Diglett",
  "Meowth",
  "Psyduck",
  "Mankey",
  "Growlithe",
  "Poliwag",
  "Abra",
  "Machop",
  "Bellsprout",
  "Tentacool",
  "Geodude",
  "Ponyta",
  "Slowpoke",
  "Magnemite",
  "Farfetch'd",
  "Doduo",
  "Seel",
  "Grimer",
  "Shellder",
  "Gastly",
  "Onix",
  "Drowzee",
  "Krabby",
  "Voltorb",
  "Exeggcute",
  "Cubone",
  "Hitmonlee",
  "Hitmonchan",
  "Lickitung",
  "Koffing",
  "Rhyhorn",
  "Chansey",
  "Tangela",
  "Kangaskhan",
  "Horsea",
  "Goldeen",
  "Staryu",
  "Mr. Mime",
  "Scyther",
  "Jynx",
  "Electabuzz",
  "Magmar",
  "Pinsir",
  "Tauros",
  "Magikarp",
  "Lapras",
  "Ditto",
  "Eevee",
  "Porygon",
  "Omanyte",
  "Kabuto",
  "Aerodactyl",
  "Snorlax",
  "Articuno",
  "Zapdos",
  "Moltres",
  "Dratini",
  "Mewtwo",
  "Mew",
]

export function AddEncounterDialog({ location, onAddPokemon, existingPokemon }: AddEncounterDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: existingPokemon?.name || "",
    species: existingPokemon?.species || "",
    level: existingPokemon?.level || 5,
    nickname: existingPokemon?.nickname || "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.species) return

    const pokemon: Omit<Pokemon, "id"> = {
      name: formData.species,
      species: formData.species,
      level: formData.level,
      location,
      status: "alive",
      nickname: formData.nickname || undefined,
      caughtAt: new Date().toISOString(),
    }

    onAddPokemon(pokemon)
    setIsOpen(false)
    setFormData({
      name: "",
      species: "",
      level: 5,
      nickname: "",
      notes: "",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
          <Plus className="h-4 w-4" />
          {existingPokemon ? "Edit" : "Add"} Encounter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {existingPokemon ? "Edit" : "Add"} Pokemon Encounter
          </DialogTitle>
          <DialogDescription>
            Record your Pokemon encounter for <Badge variant="secondary">{location}</Badge>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="species">Pokemon Species *</Label>
            <Select value={formData.species} onValueChange={(value) => setFormData({ ...formData, species: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a Pokemon species" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {pokemonSpecies.map((species) => (
                  <SelectItem key={species} value={species}>
                    {species}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickname">Nickname (Optional)</Label>
            <Input
              id="nickname"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              placeholder="Give your Pokemon a nickname"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Input
              id="level"
              type="number"
              min="1"
              max="100"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: Number.parseInt(e.target.value) || 5 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about this encounter..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={!formData.species}>
              {existingPokemon ? "Update" : "Add"} Pokemon
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
