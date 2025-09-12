"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Trophy, Users, Zap, Heart, Skull, MapPin, RotateCcw, Search } from "lucide-react"
import { PlayerSetupDialog } from "@/components/player-setup-dialog"
import { AddEncounterDialog } from "@/components/add-encounter-dialog"
import { PokemonCard } from "@/components/pokemon-card"
import { BadgeCard } from "@/components/badge-card"
import { SyncDialog } from "@/components/sync-dialog"
import { SoullinkRulesDialog } from "@/components/soullink-rules-dialog"
import { useSoullinkData, type Player, type Pokemon } from "@/hooks/use-soullink-data"
import { soulSilverLocations } from "@/data/soul-silver-locations"
import { soulSilverBadges, kantoBadges } from "@/data/soul-silver-badges"

export default function PokemonSoullink() {
  const {
    data,
    isLoading,
    updatePlayer,
    addPokemon,
    killPokemon,
    revivePokemon,
    deletePokemon,
    toggleBadge,
    importData,
    resetData,
  } = useSoullinkData()
  const [activePlayer, setActivePlayer] = useState<"player1" | "player2">("player1")
  const [searchTerm, setSearchTerm] = useState("")

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-full animate-pokeball mx-auto"></div>
          <p className="text-muted-foreground">Loading your Soullink data...</p>
        </div>
      </div>
    )
  }

  const handlePlayerUpdate = (playerKey: "player1" | "player2", player: Player) => {
    updatePlayer(playerKey, player)
  }

  const handleAddPokemon = (pokemon: Omit<Pokemon, "id">) => {
    addPokemon(activePlayer, pokemon)
  }

  const handleKillPokemon = (pokemonId: string, cause?: string) => {
    killPokemon(activePlayer, pokemonId, cause)
  }

  const handleRevivePokemon = (pokemonId: string) => {
    revivePokemon(activePlayer, pokemonId)
  }

  const handleDeletePokemon = (pokemonId: string) => {
    deletePokemon(activePlayer, pokemonId)
  }

  const handleToggleBadge = (badgeId: string, playerKey: "player1" | "player2") => {
    toggleBadge(playerKey, badgeId)
  }

  // Filter locations based on search term
  const filteredLocations = soulSilverLocations.filter((location) =>
    location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate total badges for progress
  const totalBadges = soulSilverBadges.length + kantoBadges.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full animate-pokeball"></div>
            <h1 className="text-4xl font-bold text-balance bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Pokemon Soul Silver Soullink
            </h1>
            <div className="w-8 h-8 bg-accent rounded-full animate-pokeball"></div>
          </div>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <p className="text-muted-foreground text-lg">Track your epic Soullink challenge with your friend</p>
            <div className="flex items-center gap-2">
              <SoullinkRulesDialog />
              <SyncDialog data={data} onImportData={importData} />
              <Button
                variant="outline"
                size="sm"
                onClick={resetData}
                className="flex items-center gap-2 bg-transparent"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Data
              </Button>
            </div>
          </div>
        </div>

        {/* Player Stats Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(data)
            .filter(([key]) => key.startsWith("player"))
            .map(([key, player]) => (
              <Card
                key={key}
                className={`transition-all duration-300 hover:shadow-lg ${
                  activePlayer === key ? "ring-2 ring-primary" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={player.avatar || "/placeholder.svg"} alt={player.name} />
                      <AvatarFallback>{player.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{player.name || `Player ${key.slice(-1)}`}</CardTitle>
                      <CardDescription>Trainer</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <PlayerSetupDialog
                        player={player}
                        playerKey={key as "player1" | "player2"}
                        onPlayerUpdate={handlePlayerUpdate}
                      />
                      <Button
                        variant={activePlayer === key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActivePlayer(key as "player1" | "player2")}
                      >
                        {activePlayer === key ? "Active" : "Switch"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="text-2xl font-bold">{player.badges}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Badges</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Heart className="h-4 w-4 text-green-500" />
                        <span className="text-2xl font-bold text-green-600">{player.alive}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Alive</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Skull className="h-4 w-4 text-red-500" />
                        <span className="text-2xl font-bold text-red-600">{player.dead}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Lost</p>
                    </div>
                  </div>
                  <Progress value={(player.badges / totalBadges) * 100} className="h-2" />
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Sync Status */}
        {data.lastSync && (
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last synced: {new Date(data.lastSync).toLocaleString()}</span>
                <SyncDialog data={data} onImportData={importData} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="encounters" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="encounters" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Encounters
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="graveyard" className="flex items-center gap-2">
              <Skull className="h-4 w-4" />
              Graveyard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="encounters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Route Encounters - {data[activePlayer].name || `Player ${activePlayer.slice(-1)}`}
                </CardTitle>
                <CardDescription>Track your encounters for each route and area in Pokemon Soul Silver</CardDescription>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search locations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 max-h-96 overflow-y-auto">
                  {filteredLocations.map((location) => {
                    const encounter = data[activePlayer].encounters[location]
                    return (
                      <div key={location} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <h4 className="font-medium">{location}</h4>
                            <p className="text-sm text-muted-foreground">
                              {encounter ? (
                                <span className="text-primary">
                                  {encounter.nickname || encounter.name} (Lv. {encounter.level})
                                </span>
                              ) : (
                                "No encounter yet"
                              )}
                            </p>
                          </div>
                        </div>
                        <AddEncounterDialog
                          location={location}
                          onAddPokemon={handleAddPokemon}
                          existingPokemon={encounter}
                        />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Team - {data[activePlayer].name || `Player ${activePlayer.slice(-1)}`}</CardTitle>
                <CardDescription>Your active Pokemon team (max 6 Pokemon)</CardDescription>
              </CardHeader>
              <CardContent>
                {data[activePlayer].team.length > 0 ? (
                  <div className="grid gap-4">
                    {data[activePlayer].team.map((pokemon) => (
                      <PokemonCard
                        key={pokemon.id}
                        pokemon={pokemon}
                        onKill={handleKillPokemon}
                        onDelete={handleDeletePokemon}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No Pokemon in your team yet</p>
                    <p className="text-sm text-muted-foreground mt-2">Add encounters to build your team</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges" className="space-y-4">
            <div className="space-y-6">
              {/* Johto Badges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Johto Gym Badges
                  </CardTitle>
                  <CardDescription>
                    Complete your journey through the Johto region by defeating all 8 Gym Leaders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {soulSilverBadges.map((badge) => (
                      <BadgeCard
                        key={badge.id}
                        badge={badge}
                        player1Earned={data.player1.earnedBadges[badge.id] || false}
                        player2Earned={data.player2.earnedBadges[badge.id] || false}
                        player1Name={data.player1.name || "Player 1"}
                        player2Name={data.player2.name || "Player 2"}
                        onToggleBadge={handleToggleBadge}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Kanto Badges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Kanto Gym Badges
                  </CardTitle>
                  <CardDescription>Take on the Kanto Gym Leaders in the post-game content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {kantoBadges.map((badge) => (
                      <BadgeCard
                        key={badge.id}
                        badge={badge}
                        player1Earned={data.player1.earnedBadges[badge.id] || false}
                        player2Earned={data.player2.earnedBadges[badge.id] || false}
                        player1Name={data.player1.name || "Player 1"}
                        player2Name={data.player2.name || "Player 2"}
                        onToggleBadge={handleToggleBadge}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="graveyard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Skull className="h-5 w-5" />
                  Pokemon Graveyard - {data[activePlayer].name || `Player ${activePlayer.slice(-1)}`}
                </CardTitle>
                <CardDescription>Remember the fallen heroes of your journey</CardDescription>
              </CardHeader>
              <CardContent>
                {data[activePlayer].graveyard.length > 0 ? (
                  <div className="grid gap-4">
                    {data[activePlayer].graveyard.map((pokemon) => (
                      <PokemonCard
                        key={pokemon.id}
                        pokemon={pokemon}
                        onRevive={handleRevivePokemon}
                        onDelete={handleDeletePokemon}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Skull className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No Pokemon have fallen yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      May your journey be safe and your Pokemon strong
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
