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
  Filter,
  Wifi,
  Crown,
  Heart,
  ChevronRight,
  Skull,
  MapPin,
  RotateCcw,
  Search,
  Plus,
  UserPlus,
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
import {
  WebRTCRoomDialog,
  WebRTCStatusIndicator,
  WebRTCSyncButton,
} from "@/components/webrtc-room-dialog";
import { useWebRTCSoullink } from "@/hooks/use-webrtc-soullink";
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
type PlayerKey = "player1" | "player2" | "player3";

const GAME_CATALOG: Record<
  GameKey,
  {
    title: string;
    subtitle: string;
    cover: string;
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
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${cover})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute -inset-10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 bg-[radial-gradient(ellipse_at_center,theme(colors.primary/30),transparent_60%)]" />
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

// NEW: Add Player Card Component
function AddPlayerCard({ onAddPlayer }: { onAddPlayer: () => void }) {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg border-2 border-dashed border-gray-300 hover:border-primary">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
          <UserPlus className="h-8 w-8 text-gray-400" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-700">Add Player</h3>
          <p className="text-sm text-gray-500 mt-1">
            Add a third player to your Soullink challenge
          </p>
        </div>
        <Button
          onClick={onAddPlayer}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Player 3
        </Button>
      </CardContent>
    </Card>
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
    addPlayer, // NEW: Assume this function exists in the hook
    removePlayer, // NEW: Assume this function exists in the hook
  } = useSoullinkData();

  const webrtc = useWebRTCSoullink(importData);

  const {
    isConnected,
    connectionStatus,
    roomInfo,
    syncPlayerUpdate,
    syncBadgeUpdate,
    syncPokemonAction,
  } = webrtc;

  const [activePlayer, setActivePlayer] = useState<PlayerKey>("player1");

  // NEW: Track active players
  const activePlayers = useMemo(() => {
    return (Object.keys(data) as PlayerKey[]).filter(
      (key) => key.startsWith("player") && data[key]
    );
  }, [data]);

  // Berechne Party Count
  const partyCount = useMemo(() => {
    return data[activePlayer]?.team?.filter((p) => p.isInParty).length || 0;
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

  // NEW: Handle adding player 3
  const handleAddPlayer = () => {
    if (activePlayers.length < 3) {
      addPlayer("player3", {
        name: "",
        avatar: "",
        badges: 0,
        alive: 0,
        dead: 0,
        team: [],
        graveyard: [],
        encounters: {},
        earnedBadges: {},
      });
    }
  };

  const handlePlayerUpdate = (playerKey: PlayerKey, player: Player) => {
    updatePlayer(playerKey, player);

    setTimeout(() => {
      if (isConnected) {
        syncPlayerUpdate(playerKey);
      }
    }, 100);
  };

  const handleAddPokemon = (pokemon: Omit<Pokemon, "id">) => {
    const newPokemon = addPokemon(activePlayer, pokemon);

    setTimeout(() => {
      if (isConnected) {
        syncPokemonAction("add", activePlayer, pokemon);
      }
    }, 100);
  };

  const handleKillPokemon = (pokemonId: string, cause?: string) => {
    killPokemon(activePlayer, pokemonId, cause);

    setTimeout(() => {
      if (isConnected) {
        syncPokemonAction("kill", activePlayer, undefined, pokemonId, cause);
      }
    }, 100);
  };

  const handleRevivePokemon = (pokemonId: string) => {
    revivePokemon(activePlayer, pokemonId);

    setTimeout(() => {
      if (isConnected) {
        syncPokemonAction("revive", activePlayer, undefined, pokemonId);
      }
    }, 100);
  };

  const handleDeletePokemon = (pokemonId: string) => {
    deletePokemon(activePlayer, pokemonId);

    setTimeout(() => {
      if (isConnected) {
        syncPokemonAction("delete", activePlayer, undefined, pokemonId);
      }
    }, 100);
  };

  const handleToggleBadge = (badgeId: string, playerKey: PlayerKey) => {
    const wasEarned = data[playerKey]?.earnedBadges[badgeId] || false;
    toggleBadge(playerKey, badgeId);

    setTimeout(() => {
      if (isConnected) {
        syncBadgeUpdate(playerKey, badgeId, !wasEarned);
      }
    }, 100);
  };

  const handleToggleParty = (pokemonId: string) => {
    toggleParty(activePlayer, pokemonId);

    setTimeout(() => {
      if (isConnected) {
        syncPlayerUpdate(activePlayer);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center justify-center gap-2">
              <Pokeball size={36} className="animate-bounce" />
              <h1 className="text-3xl md:text-4xl font-bold text-balance bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Pokemon Soullink Dashboard
              </h1>
              <Pokeball size={36} className="animate-bounce" delay={300} />
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 flex-wrap">
            <p className="text-muted-foreground text-lg">
              Track your epic Soullink challenge with your friends
            </p>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <SoullinkRulesDialog />
              <SoullinkTutorialDialog />
              <SyncDialog data={data} onImportData={importData} />

              <WebRTCRoomDialog webrtc={webrtc}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Wifi className="h-4 w-4" />
                  {isConnected ? "Room Settings" : "Connect"}
                </Button>
              </WebRTCRoomDialog>

              <WebRTCSyncButton webrtc={webrtc} />
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
          {roomInfo && (
            <div className="mx-auto max-w-md">
              <div
                className={`p-3 rounded-lg border ${
                  isConnected
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-yellow-50 border-yellow-200 text-yellow-800"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Wifi
                    className={`h-4 w-4 ${
                      isConnected ? "text-green-600" : "text-yellow-600"
                    }`}
                  />
                  <span className="text-sm font-medium">
                    {isConnected
                      ? "Real-time collaboration active"
                      : "Connecting to partner..."}
                  </span>
                </div>
                <p className="text-xs text-center mt-1">
                  Room: {roomInfo.name} • {roomInfo.isHost ? "Host" : "Guest"}
                </p>
              </div>
            </div>
          )}
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

        {/* UPDATED: Player Stats Overview with 3-player support */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {activePlayers.map((key) => {
            const player = data[key];
            return (
              <Card
                key={key}
                className={`transition-all duration-300 hover:shadow-lg ${
                  activePlayer === key ? "ring-2 ring-primary" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 md:h-12 md:w-12">
                      <AvatarImage
                        src={player.avatar || "/placeholder.svg"}
                        alt={player.name}
                      />
                      <AvatarFallback>
                        {player.name?.[0] || key.slice(-1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg md:text-xl truncate">
                        {player.name || `Player ${key.slice(-1)}`}
                      </CardTitle>
                      <CardDescription>Trainer</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PlayerSetupDialog
                        player={player}
                        playerKey={key}
                        onPlayerUpdate={handlePlayerUpdate}
                      />
                      <Button
                        variant={activePlayer === key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActivePlayer(key)}
                      >
                        {activePlayer === key ? "Active" : "Switch"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Trophy className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
                        <span className="text-xl md:text-2xl font-bold">
                          {player.badges}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Badges</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Heart className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                        <span className="text-xl md:text-2xl font-bold text-green-600">
                          {player.alive}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Alive</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Skull className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                        <span className="text-xl md:text-2xl font-bold text-red-600">
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

                  <StarterTeamDisplay
                    starterTeam={player.team.filter((p) => p.isInParty)}
                    playerName={player.name || `Player ${key.slice(-1)}`}
                  />
                </CardContent>
              </Card>
            );
          })}

          {/* NEW: Add Player Card (only show if less than 3 players) */}
          {activePlayers.length < 3 && (
            <AddPlayerCard onAddPlayer={handleAddPlayer} />
          )}
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

        {/* UPDATED: Mobile-optimized Main Content Tabs */}
        <Tabs defaultValue="encounters" className="space-y-4 md:space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-5 min-w-[500px] md:min-w-0">
              <TabsTrigger
                value="encounters"
                className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3"
              >
                <Zap className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Encounters</span>
                <span className="sm:hidden">Enc</span>
              </TabsTrigger>
              <TabsTrigger
                value="team"
                className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3"
              >
                <Users className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Team</span>
                <span className="sm:hidden">Team</span>
              </TabsTrigger>
              <TabsTrigger
                value="soullinks"
                className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3"
              >
                <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Soullinks</span>
                <span className="sm:hidden">Links</span>
              </TabsTrigger>
              <TabsTrigger
                value="badges"
                className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3"
              >
                <Trophy className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Badges</span>
                <span className="sm:hidden">Badge</span>
              </TabsTrigger>
              <TabsTrigger
                value="graveyard"
                className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3"
              >
                <Skull className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Graveyard</span>
                <span className="sm:hidden">Grave</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="soullinks" className="space-y-4">
            <SoullinkManager data={data} />
          </TabsContent>

          {/* Encounters */}
          <TabsContent value="encounters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <MapPin className="h-4 w-4 md:h-5 md:w-5" />
                  Route Encounters – {catalog.title} –{" "}
                  {data[activePlayer]?.name ||
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
                    const encounter = data[activePlayer]?.encounters[location];
                    return (
                      <div
                        key={location}
                        className="flex items-center justify-between p-3 md:p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-muted rounded-lg flex items-center justify-center">
                            <MapPin className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium truncate">{location}</h4>
                            <p className="text-sm text-muted-foreground truncate">
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
                <CardTitle className="text-lg md:text-xl">
                  Current Team –{" "}
                  {data[activePlayer]?.name ||
                    `Player ${activePlayer.slice(-1)}`}
                </CardTitle>
                <CardDescription>
                  Your active Pokemon team (max 6 Pokemon)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data[activePlayer]?.team?.length > 0 ? (
                  <div className="grid gap-4">
                    {data[activePlayer].team.map((pokemon) => (
                      <PokemonCard
                        key={pokemon.id}
                        pokemon={pokemon}
                        onKill={handleKillPokemon}
                        onDelete={handleDeletePokemon}
                        onToggleParty={handleToggleParty}
                        partyCount={partyCount}
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
                    <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                      <Trophy className="h-4 w-4 md:h-5 md:w-5" />
                      {section.title}
                    </CardTitle>
                    <CardDescription>
                      Complete your journey by defeating all Gym Leaders
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {section.badges.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {section.badges.map((badge) => (
                          <BadgeCard
                            key={badge.id}
                            badge={badge}
                            players={activePlayers.reduce((acc, playerKey) => {
                              acc[playerKey] = {
                                earned:
                                  data[playerKey]?.earnedBadges[badge.id] ||
                                  false,
                                name:
                                  data[playerKey]?.name ||
                                  `Player ${playerKey.slice(-1)}`,
                              };
                              return acc;
                            }, {})}
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
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Skull className="h-4 w-4 md:h-5 md:w-5" />
                  Pokemon Graveyard –{" "}
                  {data[activePlayer]?.name ||
                    `Player ${activePlayer.slice(-1)}`}
                </CardTitle>
                <CardDescription>
                  Remember the fallen heroes of your journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data[activePlayer]?.graveyard?.length > 0 ? (
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
      <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-200 rounded-full animate-pulse"></div>
    );
  }

  return sprite ? (
    <div className="relative group">
      <img
        src={sprite}
        alt={pokemon.species}
        className={`w-10 h-10 md:w-12 md:h-12 object-contain rounded-full bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-green-300 shadow-sm
          ${pokemon.status === "dead" ? "grayscale opacity-60" : ""}
        `}
      />
      {pokemon.status === "dead" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full border border-white"></div>
        </div>
      )}
      <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-yellow-500 rounded-full border border-white flex items-center justify-center">
        <Crown className="w-1.5 h-1.5 md:w-2 md:h-2 text-white" />
      </div>
    </div>
  ) : (
    <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-green-300 bg-gradient-to-br from-green-100 to-blue-100 text-green-700 font-bold text-sm md:text-lg rounded-full flex items-center justify-center">
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
        <Users className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
        <h4 className="font-semibold text-xs md:text-sm text-green-700">
          Starter Team ({starterTeam.length}/6)
        </h4>
      </div>

      <div className="flex gap-1.5 md:gap-2 flex-wrap">
        {Array.from({ length: 6 }).map((_, index) => {
          const pokemon = starterTeam[index];

          if (pokemon) {
            return (
              <div key={pokemon.id} className="relative group">
                <StarterPokemonSprite pokemon={pokemon} />
                <div className="absolute bottom-10 md:bottom-12 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {pokemon.nickname || pokemon.name} (Lv. {pokemon.level})
                </div>
              </div>
            );
          }

          return (
            <div
              key={index}
              className="w-10 h-10 md:w-12 md:h-12 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-400"
            >
              <span className="text-xs">{index + 1}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// UPDATED: Enhanced Soullink Manager for 3+ players
function SoullinkManager({ data }: { data: any }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortFilter, setSortFilter] = useState("all");

  const activePlayers = useMemo(() => {
    return (Object.keys(data) as PlayerKey[]).filter(
      (key) => key.startsWith("player") && data[key]
    );
  }, [data]);

  const connections = useMemo(() => {
    const locationMap = new Map<
      string,
      {
        location: string;
        playerPokemon: Record<PlayerKey, Pokemon | null>;
      }
    >();

    // Collect all Pokemon for all active players
    activePlayers.forEach((playerKey) => {
      const allPlayerPokemon = [
        ...data[playerKey].team,
        ...data[playerKey].graveyard,
        ...Object.values(data[playerKey].encounters).filter(Boolean),
      ];

      allPlayerPokemon.forEach((pokemon: Pokemon) => {
        if (!locationMap.has(pokemon.location)) {
          locationMap.set(pokemon.location, {
            location: pokemon.location,
            playerPokemon: activePlayers.reduce((acc, key) => {
              acc[key] = null;
              return acc;
            }, {} as Record<PlayerKey, Pokemon | null>),
          });
        }

        const current = locationMap.get(pokemon.location)!;
        if (
          !current.playerPokemon[playerKey] ||
          new Date(pokemon.caughtAt) >
            new Date(current.playerPokemon[playerKey]!.caughtAt)
        ) {
          current.playerPokemon[playerKey] = pokemon;
        }
      });
    });

    // Convert to array with completion status
    const result = Array.from(locationMap.values())
      .filter((conn) =>
        Object.values(conn.playerPokemon).some((p) => p !== null)
      )
      .map((conn) => {
        const pokemonCount = Object.values(conn.playerPokemon).filter(
          (p) => p !== null
        ).length;
        return {
          ...conn,
          isComplete: pokemonCount >= 2, // At least 2 players have Pokemon here
          pokemonCount,
        };
      })
      .sort((a, b) => {
        // Sort by completion and danger level
        if (a.isComplete && !b.isComplete) return -1;
        if (!a.isComplete && b.isComplete) return 1;

        if (a.isComplete && b.isComplete) {
          const getDangerLevel = (conn) => {
            const pokemon = Object.values(conn.playerPokemon).filter(
              (p) => p !== null
            );
            const aliveCount = pokemon.filter(
              (p) => p!.status === "alive"
            ).length;
            const deadCount = pokemon.filter(
              (p) => p!.status === "dead"
            ).length;

            if (aliveCount > 0 && deadCount > 0) return 0; // Mixed - highest danger
            if (aliveCount === pokemon.length) return 1; // All alive
            if (deadCount === pokemon.length) return 2; // All dead
            return 3;
          };

          const dangerDiff = getDangerLevel(a) - getDangerLevel(b);
          if (dangerDiff !== 0) return dangerDiff;
        }

        return a.location.localeCompare(b.location);
      });

    return result;
  }, [data, activePlayers]);

  const filteredConnections = useMemo(() => {
    let filtered = connections.filter((connection) => {
      const searchLower = searchTerm.toLowerCase();
      const location = connection.location.toLowerCase();

      const pokemonNames = Object.values(connection.playerPokemon)
        .filter((p) => p !== null)
        .map((p) => (p!.nickname || p!.name).toLowerCase());

      const matchesSearch =
        location.includes(searchLower) ||
        pokemonNames.some((name) => name.includes(searchLower));

      if (!matchesSearch) return false;

      if (!connection.isComplete) {
        return sortFilter === "all";
      }

      const pokemon = Object.values(connection.playerPokemon).filter(
        (p) => p !== null
      );
      const aliveCount = pokemon.filter((p) => p!.status === "alive").length;
      const deadCount = pokemon.filter((p) => p!.status === "dead").length;

      const allAlive = aliveCount === pokemon.length;
      const allDead = deadCount === pokemon.length;
      const mixed = aliveCount > 0 && deadCount > 0;

      switch (sortFilter) {
        case "alive":
          return allAlive;
        case "dead":
          return allDead;
        case "danger":
          return mixed;
        default:
          return true;
      }
    });

    return filtered;
  }, [connections, searchTerm, sortFilter]);

  const getFilterCounts = () => {
    let alive = 0,
      dead = 0,
      danger = 0,
      incomplete = 0;

    connections.forEach((conn) => {
      if (!conn.isComplete) {
        incomplete++;
        return;
      }

      const pokemon = Object.values(conn.playerPokemon).filter(
        (p) => p !== null
      );
      const aliveCount = pokemon.filter((p) => p!.status === "alive").length;
      const deadCount = pokemon.filter((p) => p!.status === "dead").length;

      const allAlive = aliveCount === pokemon.length;
      const allDead = deadCount === pokemon.length;
      const mixed = aliveCount > 0 && deadCount > 0;

      if (mixed) danger++;
      else if (allAlive) alive++;
      else if (allDead) dead++;
    });

    return { alive, dead, danger, incomplete, total: connections.length };
  };

  const counts = getFilterCounts();

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
            Soullink Manager ({activePlayers.length} Players)
          </CardTitle>
          <CardDescription>
            Manage your Pokemon Soullink connections - automatically based on
            shared locations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search Pokemon names, nicknames, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Buttons - Mobile optimized */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={sortFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortFilter("all")}
              className="text-xs md:text-sm"
            >
              <Filter className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              All ({counts.total})
            </Button>

            {counts.danger > 0 && (
              <Button
                variant={sortFilter === "danger" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortFilter("danger")}
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 text-xs md:text-sm"
              >
                ⚠️ Danger ({counts.danger})
              </Button>
            )}

            <Button
              variant={sortFilter === "alive" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortFilter("alive")}
              className="border-green-300 text-green-700 hover:bg-green-50 text-xs md:text-sm"
            >
              💚 Active ({counts.alive})
            </Button>

            <Button
              variant={sortFilter === "dead" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortFilter("dead")}
              className="border-red-300 text-red-700 hover:bg-red-50 text-xs md:text-sm"
            >
              💀 Dead ({counts.dead})
            </Button>

            {counts.incomplete > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs md:text-sm"
              >
                📍 Incomplete ({counts.incomplete})
              </Button>
            )}
          </div>

          {searchTerm && (
            <div className="text-sm text-muted-foreground">
              {filteredConnections.length} results for "{searchTerm}"
            </div>
          )}
        </CardContent>
      </Card>

      {/* Soullink Cards */}
      <div className="space-y-4">
        {filteredConnections.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-muted-foreground">
                {connections.length === 0
                  ? "No Soullinks found"
                  : "No connections match your search"}
              </p>
              <p className="text-sm text-muted-foreground">
                {connections.length === 0
                  ? "Start catching Pokemon to create Soullinks"
                  : "Try a different search term or filter"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredConnections.map((connection, index) => (
            <MultiPlayerSoullinkCard
              key={`${connection.location}-${index}`}
              connection={connection}
              players={activePlayers.reduce((acc, playerKey) => {
                acc[playerKey] =
                  data[playerKey]?.name || `Player ${playerKey.slice(-1)}`;
                return acc;
              }, {} as Record<PlayerKey, string>)}
            />
          ))
        )}
      </div>

      {/* Statistics */}
      {connections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-3 md:p-4 bg-green-50 rounded-lg">
                <div className="text-xl md:text-2xl font-bold text-green-600">
                  {counts.alive}
                </div>
                <div className="text-xs md:text-sm text-green-700">
                  Active Links
                </div>
              </div>
              <div className="text-center p-3 md:p-4 bg-red-50 rounded-lg">
                <div className="text-xl md:text-2xl font-bold text-red-600">
                  {counts.dead}
                </div>
                <div className="text-xs md:text-sm text-red-700">
                  Dead Links
                </div>
              </div>
              {counts.danger > 0 && (
                <div className="text-center p-3 md:p-4 bg-yellow-50 rounded-lg">
                  <div className="text-xl md:text-2xl font-bold text-yellow-600">
                    {counts.danger}
                  </div>
                  <div className="text-xs md:text-sm text-yellow-700">
                    In Danger
                  </div>
                </div>
              )}
              <div className="text-center p-3 md:p-4 bg-gray-50 rounded-lg">
                <div className="text-xl md:text-2xl font-bold text-gray-600">
                  {counts.incomplete}
                </div>
                <div className="text-xs md:text-sm text-gray-700">
                  Incomplete
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// NEW: Multi-player Soullink Card Component
function MultiPlayerSoullinkCard({
  connection,
  players,
}: {
  connection: {
    location: string;
    playerPokemon: Record<PlayerKey, Pokemon | null>;
    isComplete: boolean;
    pokemonCount: number;
  };
  players: Record<PlayerKey, string>;
}) {
  const activePokemon = Object.entries(connection.playerPokemon)
    .filter(([_, pokemon]) => pokemon !== null)
    .map(([playerKey, pokemon]) => ({
      playerKey: playerKey as PlayerKey,
      pokemon: pokemon!,
    }));

  if (!connection.isComplete) {
    return (
      <div className="flex items-center justify-between p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-lg flex items-center justify-center">
            <MapPin className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-sm md:text-base">
              {connection.location}
            </h4>
            <p className="text-xs md:text-sm text-muted-foreground">
              {activePokemon.length} of {Object.keys(players).length} players
              have Pokemon here
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            Incomplete
          </div>
        </div>
      </div>
    );
  }

  const aliveCount = activePokemon.filter(
    ({ pokemon }) => pokemon.status === "alive"
  ).length;
  const deadCount = activePokemon.filter(
    ({ pokemon }) => pokemon.status === "dead"
  ).length;

  const allAlive = aliveCount === activePokemon.length;
  const allDead = deadCount === activePokemon.length;
  const mixed = aliveCount > 0 && deadCount > 0;

  let bgClass = "border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100";
  let statusText = "MIXED";
  let statusColor = "bg-gray-500";

  if (allAlive) {
    bgClass = "border-green-300 bg-gradient-to-r from-green-50 to-blue-50";
    statusText = "ACTIVE LINK";
    statusColor = "bg-green-500";
  } else if (allDead) {
    bgClass = "border-red-300 bg-gradient-to-r from-red-50 to-gray-50";
    statusText = "DEAD LINK";
    statusColor = "bg-red-500";
  } else if (mixed) {
    bgClass = "border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50";
    statusText = "DANGER!";
    statusColor = "bg-yellow-500";
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl border-2 p-4 md:p-6 transition-all duration-300 ${bgClass}`}
    >
      {/* Location Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          <span className="font-semibold text-sm md:text-base">
            {connection.location}
          </span>
        </div>
        <div
          className={`${statusColor} text-white px-2 py-1 rounded-full text-xs font-bold`}
        >
          {statusText}
        </div>
      </div>

      {/* Pokemon Grid */}
      <div
        className={`grid gap-4 ${
          activePokemon.length === 2
            ? "grid-cols-2"
            : activePokemon.length === 3
            ? "grid-cols-3"
            : "grid-cols-2 md:grid-cols-4"
        }`}
      >
        {activePokemon.map(({ playerKey, pokemon }) => (
          <div key={playerKey} className="text-center space-y-2">
            <StarterPokemonSprite pokemon={pokemon} />
            <div>
              <p className="font-semibold text-xs md:text-sm truncate">
                {pokemon.nickname || pokemon.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {players[playerKey]} • Lv. {pokemon.level}
              </p>
              <div
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                ${
                  pokemon.status === "alive"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }
              `}
              >
                {pokemon.status === "alive" ? "ALIVE" : "K.O."}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Message for Mixed Status */}
      {mixed && (
        <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-lg">
          <p className="text-xs md:text-sm font-medium text-gray-800">
            ℹ️ Some Pokemon from {connection.location} have fallen while others
            still live.
          </p>
        </div>
      )}
    </div>
  );
}
