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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Skull, Heart, Trophy, Zap } from "lucide-react"

export function SoullinkRulesDialog() {
  const [isOpen, setIsOpen] = useState(false)

  const coreRules = [
    {
      icon: <Skull className="h-5 w-5 text-red-500" />,
      title: "Death Rule",
      description: "If a Pokemon faints, it's considered dead and must be released or permanently boxed",
    },
    {
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
      title: "First Encounter Only",
      description: "You may only catch the first Pokemon encountered in each area/route",
    },
    {
      icon: <Heart className="h-5 w-5 text-pink-500" />,
      title: "Nickname All Pokemon",
      description: "All caught Pokemon must be given nicknames to create emotional bonds",
    },
    {
      icon: <Users className="h-5 w-5 text-blue-500" />,
      title: "Linked Fate",
      description: "Both players must coordinate their catches and releases throughout the journey",
    },
  ]

  const soullinkRules = [
    "Both players must play the same generation of Pokemon games",
    "When one player catches a Pokemon, the other must catch a Pokemon in the same area",
    "If one player's Pokemon dies, the other player must release the Pokemon caught in the same area",
    "Players should coordinate gym battles and major story events",
    "Both players must use the same encounter rules and restrictions",
    "Communication is key - discuss strategies and coordinate your progress",
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
          <BookOpen className="h-4 w-4" />
          Soullink Rules
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Pokemon Soullink Challenge Rules
          </DialogTitle>
          <DialogDescription>Understanding the rules and spirit of the Pokemon Soullink challenge</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Core Nuzlocke Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Core Nuzlocke Rules</CardTitle>
              <CardDescription>The foundation rules that make the challenge difficult and engaging</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {coreRules.map((rule, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="mt-0.5">{rule.icon}</div>
                  <div>
                    <h4 className="font-medium">{rule.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Soullink Specific Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Soullink Multiplayer Rules
              </CardTitle>
              <CardDescription>Additional rules that connect both players' journeys</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {soullinkRules.map((rule, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5 text-xs">
                      {index + 1}
                    </Badge>
                    <p className="text-sm">{rule}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Optional Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Optional Challenge Rules
              </CardTitle>
              <CardDescription>Additional restrictions to increase difficulty</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  • <strong>Set Battle Mode:</strong> Switch to "Set" in options (no free switches)
                </p>
                <p>
                  • <strong>Level Caps:</strong> Don't exceed the next gym leader's highest level Pokemon
                </p>
                <p>
                  • <strong>Limited Pokemon Center:</strong> Only heal at Pokemon Centers a set number of times
                </p>
                <p>
                  • <strong>No Items in Battle:</strong> Don't use healing items during trainer battles
                </p>
                <p>
                  • <strong>Species Clause:</strong> Only catch one Pokemon of each species
                </p>
                <p>
                  • <strong>Shiny Clause:</strong> Shiny Pokemon can be caught regardless of other rules
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => setIsOpen(false)}>Got it!</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
