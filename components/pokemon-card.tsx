"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, Skull, Zap, Calendar, MapPin, Edit, Trash2, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { KillPokemonDialog } from "./kill-pokemon-dialog"
import { RevivePokemonDialog } from "./revive-pokemon-dialog"
import type { Pokemon } from "@/hooks/use-soullink-data"

interface PokemonCardProps {
  pokemon: Pokemon
  onEdit?: () => void
  onDelete?: () => void
  onKill?: (pokemonId: string, cause?: string) => void
  onRevive?: (pokemonId: string) => void
  showActions?: boolean
}

export function PokemonCard({ pokemon, onEdit, onDelete, onKill, onRevive, showActions = true }: PokemonCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status: Pokemon["status"]) => {
    switch (status) {
      case "alive":
        return "text-green-600"
      case "dead":
        return "text-red-600"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusIcon = (status: Pokemon["status"]) => {
    switch (status) {
      case "alive":
        return <Heart className="h-4 w-4" />
      case "dead":
        return <Skull className="h-4 w-4" />
      default:
        return <Zap className="h-4 w-4" />
    }
  }

  return (
    <Card className={`transition-all hover:shadow-md ${pokemon.status === "dead" ? "bg-muted/50" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-bold">{pokemon.species[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">
                  {pokemon.nickname || pokemon.name}
                  {pokemon.nickname && <span className="text-sm text-muted-foreground ml-1">({pokemon.species})</span>}
                </h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Lv. {pokemon.level}</span>
                  <div className={`flex items-center gap-1 ${getStatusColor(pokemon.status)}`}>
                    {getStatusIcon(pokemon.status)}
                    <span className="capitalize">{pokemon.status}</span>
                  </div>
                </div>
              </div>

              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={onEdit}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}

                    {pokemon.status === "alive" && onKill && (
                      <KillPokemonDialog
                        pokemon={pokemon}
                        onKill={onKill}
                        trigger={
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="text-destructive focus:text-destructive"
                          >
                            <Skull className="h-4 w-4 mr-2" />
                            Mark as Fainted
                          </DropdownMenuItem>
                        }
                      />
                    )}

                    {pokemon.status === "dead" && onRevive && (
                      <RevivePokemonDialog
                        pokemon={pokemon}
                        onRevive={onRevive}
                        trigger={
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="text-green-600 focus:text-green-600"
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            Revive Pokemon
                          </DropdownMenuItem>
                        }
                      />
                    )}

                    {onDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Forever
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{pokemon.location}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Caught {formatDate(pokemon.caughtAt)}</span>
              </div>
              {pokemon.status === "dead" && pokemon.diedAt && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <Skull className="h-3 w-3" />
                  <span>Died {formatDate(pokemon.diedAt)}</span>
                  {pokemon.cause && <span>- {pokemon.cause}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
