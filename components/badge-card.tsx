"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge as BadgeComponent } from "@/components/ui/badge"
import { Trophy, Check, X } from "lucide-react"
import type { Badge } from "@/data/soul-silver-badges"

interface BadgeCardProps {
  badge: Badge
  player1Earned: boolean
  player2Earned: boolean
  player1Name: string
  player2Name: string
  onToggleBadge: (badgeId: string, playerKey: "player1" | "player2") => void
}

const typeColors: Record<string, string> = {
  Flying: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Bug: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Normal: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  Ghost: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  Fighting: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  Steel: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
  Ice: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  Dragon: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  Rock: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  Water: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Electric: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Grass: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Poison: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  Psychic: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  Fire: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  Various:
    "bg-gradient-to-r from-red-100 to-blue-100 text-gray-800 dark:from-red-900 dark:to-blue-900 dark:text-gray-200",
}

export function BadgeCard({
  badge,
  player1Earned,
  player2Earned,
  player1Name,
  player2Name,
  onToggleBadge,
}: BadgeCardProps) {
  const bothEarned = player1Earned && player2Earned
  const anyEarned = player1Earned || player2Earned

  return (
    <Card className={`transition-all duration-300 hover:shadow-md ${anyEarned ? "ring-1 ring-primary/20" : ""}`}>
      <CardContent className="p-4 space-y-3">
        <div className="text-center space-y-2">
          <div
            className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
              bothEarned
                ? "bg-primary text-primary-foreground animate-badge-shine"
                : anyEarned
                  ? "bg-primary/70 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            <Trophy className="h-8 w-8" />
          </div>

          <div>
            <h3 className="font-semibold text-sm">{badge.name}</h3>
            <p className="text-xs text-muted-foreground">{badge.city}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Leader:</span>
            <span className="font-medium">{badge.leader}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Type:</span>
            <BadgeComponent className={`text-xs ${typeColors[badge.type] || typeColors.Normal}`}>
              {badge.type}
            </BadgeComponent>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">{player1Name}</span>
            <Button
              variant={player1Earned ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleBadge(badge.id, "player1")}
              className="h-6 w-6 p-0"
            >
              {player1Earned ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">{player2Name}</span>
            <Button
              variant={player2Earned ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleBadge(badge.id, "player2")}
              className="h-6 w-6 p-0"
            >
              {player2Earned ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
