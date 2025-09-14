"use client";
import { Pokeball } from "@/components/pokeball";
import { useMemo, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Trophy,
  Users,
  Zap,
  Crown,
  Heart,
  ChevronRight,
  Skull,
  MapPin,
  RotateCcw,
  Search,
} from "lucide-react";
import { PlayerSetupDialog } from "@/components/player-setup-dialog";
import { AddEncounterDialog } from "@/components/add-encounter-dialog";
import { PokemonCard } from "@/components/pokemon-card";
import { BadgeCard } from "@/components/badge-card";
import { SyncDialog } from "@/components/sync-dialog";
import { SoullinkRulesDialog } from "@/components/soullink-rules-dialog";
import {
  useSoullinkData,
  type Player,
  type Pokemon,
} from "@/hooks/use-soullink-data";

// --- EXISTIERENDE DATEN ---
import { soulSilverLocations } from "@/data/soul-silver-locations";
import { soulSilverBadges, kantoBadges } from "@/data/soul-silver-badges";
import { fireRedBadges } from "@/data/fr-badges";
import { hoennBadges } from "@/data/rb-badges";
import { diamondBadges } from "@/data/dp-bages";
import { blackBadges } from "@/data/bw-badges";
import { fireRedLocations } from "@/data/fr-locations";
import { hoennLocations } from "@/data/rb-locations";
import { diamondLocations } from "@/data/dp-locations";
import { blackLocations } from "@/data/bw-locations";
import SoullinkTutorialDialog from "@/components/soullink-tutorial-dialog";

export interface Badge {
  id: string;
  name: string;
  city: string;
  leader: string;
  type: string;
  description: string;
  order: number;
}

type GameKey = "soulsilver" | "firered" | "ruby" | "diamond" | "black";

const GAME_CATALOG: Record<
  GameKey,
  {
    title: string;
    subtitle: string;
    cover: string; // Bild-URL (lokal in /public/images/games/... oder extern)
    locations: string[];
    badgeSections: { title: string; badges: Badge[] }[];
  }
> = {
  soulsilver: {
    title: "Pokémon SoulSilver",
    subtitle: "Johto + Kanto (16 Orden)",
    cover: "/images/games/soulsilver.jpg",
    locations: soulSilverLocations,
    badgeSections: [
      { title: "Johto Gym Badges", badges: soulSilverBadges },
      { title: "Kanto Gym Badges", badges: kantoBadges },
    ],
  },
  firered: {
    title: "Pokémon FireRed",
    subtitle: "Kanto (8 Orden)",
    cover: "/images/games/firered.jpg",
    locations: fireRedLocations,
    badgeSections: [
      { title: "Kanto Gym Badges", badges: fireRedBadges as Badge[] },
    ],
  },
  ruby: {
    title: "Pokémon Ruby",
    subtitle: "Hoenn (8 Orden)",
    cover: "/images/games/ruby.jpg",
    locations: hoennLocations,
    badgeSections: [
      { title: "Hoenn Gym Badges", badges: hoennBadges as Badge[] },
    ],
  },
  diamond: {
    title: "Pokémon Diamond",
    subtitle: "Sinnoh (8 Orden)",
    cover: "/images/games/diamond.jpg",
    locations: diamondLocations,
    badgeSections: [
      { title: "Sinnoh Gym Badges", badges: diamondBadges as Badge[] },
    ],
  },
  black: {
    title: "Pokémon Black",
    subtitle: "Unova (8 Orden)",
    cover: "/images/games/black.jpg",
    locations: blackLocations,
    badgeSections: [
      { title: "Unova Gym Badges", badges: blackBadges as Badge[] },
    ],
  },
};

function GameCard({
  selected,
  onClick,
  title,
  subtitle,
  cover,
}: {
  selected?: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  cover: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl ring-offset-2 transition-all duration-300 w-full text-left shadow-sm hover:shadow-xl focus:outline-none ${
        selected ? "ring-2 ring-primary" : "ring-1 ring-border"
      }`}
    >
      <div className="relative h-44 w-full">
        {/* Cover */}
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${cover})` }}
        />
        {/* Glow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {/* Accent Blur */}
        <div className="absolute -inset-10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 bg-[radial-gradient(ellipse_at_center,theme(colors.primary/30),transparent_60%)]" />
        {/* Content */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <p className="text-xs text-white/80">Soullink Ready</p>
          </div>
          <h3 className="mt-1 text-lg font-semibold text-white drop-shadow">
            {title}
          </h3>
          <p className="text-xs text-white/80">{subtitle}</p>
        </div>
      </div>
    </button>
  );
}

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
    toggleParty,
  } = useSoullinkData();

  const [activePlayer, setActivePlayer] = useState<"player1" | "player2">(
    "player1"
  );

  const handleToggleParty = (pokemonId: string) => {
    toggleParty(activePlayer, pokemonId);
  };

  // Berechne Party Count
  const partyCount = useMemo(() => {
    return data[activePlayer].team.filter((p) => p.isInParty).length;
  }, [data, activePlayer]);

  const [searchTerm, setSearchTerm] = useState("");
  const [game, setGame] = useState<GameKey>("soulsilver");

  const catalog = GAME_CATALOG[game];

  const filteredLocations = useMemo(() => {
    return catalog.locations.filter((loc) =>
      loc.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [catalog.locations, searchTerm]);

  const totalBadges = useMemo(
    () => catalog.badgeSections.reduce((sum, s) => sum + s.badges.length, 0),
    [catalog.badgeSections]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-full animate-pokeball mx-auto"></div>
          <p className="text-muted-foreground">Loading your Soullink data...</p>
        </div>
      </div>
    );
  }

  const handlePlayerUpdate = (
    playerKey: "player1" | "player2",
    player: Player
  ) => {
    updatePlayer(playerKey, player);
  };

  const handleAddPokemon = (pokemon: Omit<Pokemon, "id">) => {
    addPokemon(activePlayer, pokemon);
  };

  const handleKillPokemon = (pokemonId: string, cause?: string) => {
    killPokemon(activePlayer, pokemonId, cause);
  };

  const handleRevivePokemon = (pokemonId: string) => {
    revivePokemon(activePlayer, pokemonId);
  };

  const handleDeletePokemon = (pokemonId: string) => {
    deletePokemon(activePlayer, pokemonId);
  };

  const handleToggleBadge = (
    badgeId: string,
    playerKey: "player1" | "player2"
  ) => {
    toggleBadge(playerKey, badgeId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center justify-center gap-2">
              <Pokeball size={36} className="animate-bounce" />
              <h1 className="text-4xl font-bold text-balance bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Pokemon Soullink Dashboard
              </h1>
              <Pokeball size={36} className="animate-bounce" delay={300} />
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <p className="text-muted-foreground text-lg">
              Track your epic Soullink challenge with your friend
            </p>
            <div className="flex items-center gap-2">
              <SoullinkRulesDialog />
              <SoullinkTutorialDialog />
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

        {/* Spielauswahl */}
        <Card className="border-none shadow-none bg-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Wähle dein Spiel</CardTitle>
            <CardDescription>
              Basierend auf dem Spiel werden Locations und Orden geladen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {(Object.keys(GAME_CATALOG) as GameKey[]).map((key) => (
                <GameCard
                  key={key}
                  selected={game === key}
                  onClick={() => setGame(key)}
                  title={GAME_CATALOG[key].title}
                  subtitle={GAME_CATALOG[key].subtitle}
                  cover={GAME_CATALOG[key].cover}
                />
              ))}
            </div>
          </CardContent>
        </Card>

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
                      <AvatarImage
                        src={player.avatar || "/placeholder.svg"}
                        alt={player.name}
                      />
                      <AvatarFallback>{player.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-xl">
                        {player.name || `Player ${key.slice(-1)}`}
                      </CardTitle>
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
                        onClick={() =>
                          setActivePlayer(key as "player1" | "player2")
                        }
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
                        <span className="text-2xl font-bold">
                          {player.badges}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Badges</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Heart className="h-4 w-4 text-green-500" />
                        <span className="text-2xl font-bold text-green-600">
                          {player.alive}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Alive</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Skull className="h-4 w-4 text-red-500" />
                        <span className="text-2xl font-bold text-red-600">
                          {player.dead}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Lost</p>
                    </div>
                  </div>

                  <Progress
                    value={(player.badges / totalBadges) * 100}
                    className="h-2"
                  />

                  {/* STARTER TEAM ANZEIGE */}
                  <StarterTeamDisplay
                    starterTeam={player.team.filter((p) => p.isInParty)}
                    playerName={player.name || `Player ${key.slice(-1)}`}
                  />
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Sync Status */}
        {data.lastSync && (
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Last synced: {new Date(data.lastSync).toLocaleString()}
                </span>
                <SyncDialog data={data} onImportData={importData} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="encounters" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            {" "}
            {/* Von 4 auf 5 ändern */}
            <TabsTrigger value="encounters" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Encounters
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="soullinks" className="flex items-center gap-2">
              {" "}
              {/* NEU */}
              <ChevronRight className="h-4 w-4" />
              Soullinks
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

          <TabsContent value="soullinks" className="space-y-4">
            {/* NEU */}
            <SoullinkConnections data={data} />
          </TabsContent>

          {/* Encounters */}
          <TabsContent value="encounters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Route Encounters – {catalog.title} –{" "}
                  {data[activePlayer].name ||
                    `Player ${activePlayer.slice(-1)}`}
                </CardTitle>
                <CardDescription>
                  Track your encounters for each route and area in{" "}
                  {catalog.title}
                </CardDescription>
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
                    const encounter = data[activePlayer].encounters[location];
                    return (
                      <div
                        key={location}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <h4 className="font-medium">{location}</h4>
                            <p className="text-sm text-muted-foreground">
                              {encounter ? (
                                <span className="text-primary">
                                  {encounter.nickname || encounter.name} (Lv.{" "}
                                  {encounter.level})
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
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team */}
          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  Current Team –{" "}
                  {data[activePlayer].name ||
                    `Player ${activePlayer.slice(-1)}`}
                </CardTitle>
                <CardDescription>
                  Your active Pokemon team (max 6 Pokemon)
                </CardDescription>
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
                        onToggleParty={handleToggleParty} // <- Diese Zeile hinzufügen
                        partyCount={partyCount} // <- Diese Zeile hinzufügen
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No Pokemon in your team yet
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Add encounters to build your team
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges" className="space-y-4">
            <div className="space-y-6">
              {catalog.badgeSections.map((section) => (
                <Card key={section.title}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      {section.title}
                    </CardTitle>
                    <CardDescription>
                      Complete your journey by defeating all Gym Leaders
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {section.badges.length > 0 ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {section.badges.map((badge) => (
                          <BadgeCard
                            key={badge.id}
                            badge={badge}
                            player1Earned={
                              data.player1.earnedBadges[badge.id] || false
                            }
                            player2Earned={
                              data.player2.earnedBadges[badge.id] || false
                            }
                            player1Name={data.player1.name || "Player 1"}
                            player2Name={data.player2.name || "Player 2"}
                            onToggleBadge={handleToggleBadge}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Keine Badge-Daten hinterlegt. Lege die Datei für dieses
                        Spiel an (siehe Kommentare oben) oder füge hier Daten
                        ein.
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Graveyard */}
          <TabsContent value="graveyard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Skull className="h-5 w-5" />
                  Pokemon Graveyard –{" "}
                  {data[activePlayer].name ||
                    `Player ${activePlayer.slice(-1)}`}
                </CardTitle>
                <CardDescription>
                  Remember the fallen heroes of your journey
                </CardDescription>
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
                    <p className="text-muted-foreground">
                      No Pokemon have fallen yet
                    </p>
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
  );
}

interface PokeApiResponse {
  sprites: {
    front_default: string;
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
}

function StarterPokemonSprite({ pokemon }: { pokemon: Pokemon }) {
  const [sprite, setSprite] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSprite = async () => {
      try {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${pokemon.species.toLowerCase()}`
        );
        if (response.ok) {
          const data: PokeApiResponse = await response.json();
          setSprite(
            data.sprites?.other?.["official-artwork"]?.front_default ||
              data.sprites?.front_default
          );
        }
      } catch (error) {
        console.error("Failed to fetch sprite:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSprite();
  }, [pokemon.species]);

  if (loading) {
    return (
      <div className="w-12 h-12 bg-slate-200 rounded-full animate-pulse"></div>
    );
  }

  return sprite ? (
    <div className="relative group">
      <img
        src={sprite}
        alt={pokemon.species}
        className={`w-12 h-12 object-contain rounded-full bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-green-300 shadow-sm
          ${pokemon.status === "dead" ? "grayscale opacity-60" : ""}
        `}
      />
      {pokemon.status === "dead" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-red-500 rounded-full border border-white"></div>
        </div>
      )}
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border border-white flex items-center justify-center">
        <Crown className="w-2 h-2 text-white" />
      </div>
    </div>
  ) : (
    <div className="w-12 h-12 border-2 border-green-300 bg-gradient-to-br from-green-100 to-blue-100 text-green-700 font-bold text-lg rounded-full flex items-center justify-center">
      {pokemon.species[0]}
    </div>
  );
}

function StarterTeamDisplay({
  starterTeam,
  playerName,
}: {
  starterTeam: Pokemon[];
  playerName: string;
}) {
  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-4 w-4 text-green-600" />
        <h4 className="font-semibold text-sm text-green-700">
          Starter Team ({starterTeam.length}/6)
        </h4>
      </div>

      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 6 }).map((_, index) => {
          const pokemon = starterTeam[index];

          if (pokemon) {
            return (
              <div key={pokemon.id} className="relative group">
                <StarterPokemonSprite pokemon={pokemon} />
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {pokemon.nickname || pokemon.name} (Lv. {pokemon.level})
                </div>
              </div>
            );
          }

          return (
            <div
              key={index}
              className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-400"
            >
              <span className="text-xs">{index + 1}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SoullinkConnections({ data }: { data: any }) {
  const [connections, setConnections] = useState<
    Array<{
      location: string;
      player1Pokemon: Pokemon | null;
      player2Pokemon: Pokemon | null;
      isComplete: boolean;
    }>
  >([]);

  useEffect(() => {
    const findLocationConnections = () => {
      const locationMap = new Map<
        string,
        {
          location: string;
          player1Pokemon: Pokemon | null;
          player2Pokemon: Pokemon | null;
        }
      >();

      // Sammle alle Pokemon beider Spieler
      const allPlayer1Pokemon = [
        ...data.player1.team,
        ...data.player1.graveyard,
        ...Object.values(data.player1.encounters).filter(Boolean),
      ];

      const allPlayer2Pokemon = [
        ...data.player2.team,
        ...data.player2.graveyard,
        ...Object.values(data.player2.encounters).filter(Boolean),
      ];

      // Gruppiere nach Location
      allPlayer1Pokemon.forEach((pokemon: Pokemon) => {
        if (!locationMap.has(pokemon.location)) {
          locationMap.set(pokemon.location, {
            location: pokemon.location,
            player1Pokemon: null,
            player2Pokemon: null,
          });
        }
        locationMap.get(pokemon.location)!.player1Pokemon = pokemon;
      });

      allPlayer2Pokemon.forEach((pokemon: Pokemon) => {
        if (!locationMap.has(pokemon.location)) {
          locationMap.set(pokemon.location, {
            location: pokemon.location,
            player1Pokemon: null,
            player2Pokemon: null,
          });
        }
        locationMap.get(pokemon.location)!.player2Pokemon = pokemon;
      });

      // Konvertiere zu Array mit isComplete Flag
      const newConnections = Array.from(locationMap.values())
        .filter((conn) => conn.player1Pokemon || conn.player2Pokemon)
        .map((conn) => ({
          ...conn,
          isComplete: !!(conn.player1Pokemon && conn.player2Pokemon),
        }))
        .sort((a, b) => {
          // Komplette Links zuerst, dann alphabetisch
          if (a.isComplete && !b.isComplete) return -1;
          if (!a.isComplete && b.isComplete) return 1;
          return a.location.localeCompare(b.location);
        });

      setConnections(newConnections);
    };

    findLocationConnections();
  }, [data]);

  const completeConnections = connections.filter((c) => c.isComplete);
  const incompleteConnections = connections.filter((c) => !c.isComplete);

  return (
    <div className="space-y-6">
      {/* Active Soullinks */}
      {completeConnections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChevronRight className="h-5 w-5 text-purple-500" />
              Active Soullinks ({completeConnections.length})
            </CardTitle>
            <CardDescription>
              Pokemon linked by shared encounter locations - if one falls, both
              are affected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completeConnections.map((connection) => (
                <LocationSoullinkCard
                  key={connection.location}
                  connection={connection}
                  player1Name={data.player1.name || "Player 1"}
                  player2Name={data.player2.name || "Player 2"}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Potential Links */}
      {incompleteConnections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              Potential Soullinks ({incompleteConnections.length})
            </CardTitle>
            <CardDescription>
              Locations where only one player has caught a Pokemon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {incompleteConnections.map((connection) => (
                <PotentialSoullinkCard
                  key={connection.location}
                  connection={connection}
                  player1Name={data.player1.name || "Player 1"}
                  player2Name={data.player2.name || "Player 2"}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {connections.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChevronRight className="h-5 w-5 text-purple-500" />
              Location-Based Soullinks
            </CardTitle>
            <CardDescription>
              Pokemon from the same location are automatically linked
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-purple-400" />
              </div>
              <p className="text-muted-foreground">
                No encounters yet - start catching Pokemon to create Soullinks
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LocationSoullinkCard({
  connection,
  player1Name,
  player2Name,
}: {
  connection: {
    location: string;
    player1Pokemon: Pokemon | null;
    player2Pokemon: Pokemon | null;
    isComplete: boolean;
  };
  player1Name: string;
  player2Name: string;
}) {
  const p1 = connection.player1Pokemon!;
  const p2 = connection.player2Pokemon!;

  const bothAlive = p1.status === "alive" && p2.status === "alive";
  const bothDead = p1.status === "dead" && p2.status === "dead";
  const onlyOneDead = (p1.status === "dead") !== (p2.status === "dead");

  return (
    <div
      className={`
      relative overflow-hidden rounded-xl border-2 p-6 transition-all duration-300
      ${
        bothAlive
          ? "border-green-300 bg-gradient-to-r from-green-50 to-blue-50"
          : ""
      }
      ${
        bothDead ? "border-red-300 bg-gradient-to-r from-red-50 to-gray-50" : ""
      }
      ${
        onlyOneDead
          ? "border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50"
          : ""
      }
    `}
    >
      {/* Location Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-sm">{connection.location}</span>
        </div>
        <div>
          {bothAlive && (
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              ACTIVE LINK
            </div>
          )}
          {bothDead && (
            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              BOTH FALLEN
            </div>
          )}
          {onlyOneDead && (
            <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              DANGER!
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 items-center gap-4">
        {/* Player 1 Pokemon */}
        <div className="text-center space-y-2">
          <StarterPokemonSprite pokemon={p1} />
          <div>
            <p className="font-semibold text-sm">{p1.nickname || p1.name}</p>
            <p className="text-xs text-muted-foreground">
              {player1Name} • Lv. {p1.level}
            </p>
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
              ${
                p1.status === "alive"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }
            `}
            >
              {p1.status === "alive" ? "ALIVE" : "FAINTED"}
            </div>
          </div>
        </div>

        {/* Connection Indicator */}
        <div className="text-center">
          <div className="flex items-center justify-center">
            <div
              className={`w-8 h-0.5 ${
                bothAlive ? "bg-green-400" : "bg-red-400"
              }`}
            ></div>
            <div
              className={`w-6 h-6 rounded-full border-2 mx-2 flex items-center justify-center
              ${
                bothAlive
                  ? "border-green-400 bg-green-100"
                  : "border-red-400 bg-red-100"
              }
            `}
            >
              <MapPin
                className={`w-3 h-3 ${
                  bothAlive ? "text-green-600" : "text-red-600"
                }`}
              />
            </div>
            <div
              className={`w-8 h-0.5 ${
                bothAlive ? "bg-green-400" : "bg-red-400"
              }`}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Same Location</p>
        </div>

        {/* Player 2 Pokemon */}
        <div className="text-center space-y-2">
          <StarterPokemonSprite pokemon={p2} />
          <div>
            <p className="font-semibold text-sm">{p2.nickname || p2.name}</p>
            <p className="text-xs text-muted-foreground">
              {player2Name} • Lv. {p2.level}
            </p>
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
              ${
                p2.status === "alive"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }
            `}
            >
              {p2.status === "alive" ? "ALIVE" : "FAINTED"}
            </div>
          </div>
        </div>
      </div>

      {/* Warning Message */}
      {onlyOneDead && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
          <p className="text-sm font-medium text-yellow-800">
            ⚠️ Soullink Broken! One Pokemon from {connection.location} has
            fallen. Handle the partner according to your Soullink rules.
          </p>
        </div>
      )}
    </div>
  );
}

// 5. KOMPONENTE: Potential Soullink Card
function PotentialSoullinkCard({
  connection,
  player1Name,
  player2Name,
}: {
  connection: {
    location: string;
    player1Pokemon: Pokemon | null;
    player2Pokemon: Pokemon | null;
  };
  player1Name: string;
  player2Name: string;
}) {
  const existingPokemon =
    connection.player1Pokemon || connection.player2Pokemon!;
  const missingPlayer = connection.player1Pokemon ? player2Name : player1Name;

  return (
    <div className="flex items-center justify-between p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        <div>
          <h4 className="font-medium text-sm">{connection.location}</h4>
          <p className="text-xs text-muted-foreground">
            {existingPokemon.nickname || existingPokemon.name} (
            {existingPokemon.status}) • Waiting for {missingPlayer} encounter
          </p>
        </div>
      </div>
      <div className="text-right">
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          Incomplete Link
        </div>
      </div>
    </div>
  );
}

function findSoullinkPartner(pokemon: Pokemon, data: any): Pokemon | null {
  const otherPlayer = pokemon.id.includes("player1") ? "player2" : "player1";

  // Suche Pokemon mit gleicher Location beim anderen Spieler
  const allOtherPlayerPokemon = [
    ...data[otherPlayer].team,
    ...data[otherPlayer].graveyard,
    ...Object.values(data[otherPlayer].encounters).filter(Boolean),
  ];

  return (
    allOtherPlayerPokemon.find(
      (p: Pokemon) => p && p.location === pokemon.location
    ) || null
  );
}
