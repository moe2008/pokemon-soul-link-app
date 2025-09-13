"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Heart,
  Skull,
  Zap,
  Calendar,
  MapPin,
  Edit,
  Trash2,
  MoreHorizontal,
  Star,
  Crown,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock dialogs - you would replace these with your actual components
const KillPokemonDialog = ({ pokemon, onKill, trigger }) => {
  return <div onClick={() => onKill(pokemon.id, "Battle")}>{trigger}</div>;
};

const RevivePokemonDialog = ({ pokemon, onRevive, trigger }) => {
  return <div onClick={() => onRevive(pokemon.id)}>{trigger}</div>;
};

// Type definitions
interface Pokemon {
  id: string;
  name: string;
  nickname?: string;
  species: string;
  level: number;
  status: "alive" | "dead";
  location: string;
  caughtAt: string;
  diedAt?: string;
  cause?: string;
}

interface PokemonCardProps {
  pokemon: Pokemon;
  onEdit?: () => void;
  onDelete?: () => void;
  onKill?: (pokemonId: string, cause?: string) => void;
  onRevive?: (pokemonId: string) => void;
  showActions?: boolean;
}

interface PokeApiPokemon {
  sprites: {
    front_default: string;
    other: {
      "official-artwork": {
        front_default: string;
      };
      dream_world: {
        front_default: string;
      };
    };
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
  height: number;
  weight: number;
}

export function PokemonCard({
  pokemon,
  onEdit,
  onDelete,
  onKill,
  onRevive,
  showActions = true,
}: PokemonCardProps) {
  const [pokeData, setPokeData] = useState<PokeApiPokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchPokemonData = async () => {
      try {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${pokemon.species.toLowerCase()}`
        );
        if (response.ok) {
          const data = await response.json();
          setPokeData(data);
        }
      } catch (error) {
        console.error("Failed to fetch Pokemon data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonData();
  }, [pokemon.species]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: Pokemon["status"]) => {
    switch (status) {
      case "alive":
        return "text-emerald-500";
      case "dead":
        return "text-red-500";
      default:
        return "text-slate-500";
    }
  };

  const getStatusIcon = (status: Pokemon["status"]) => {
    switch (status) {
      case "alive":
        return <Heart className="h-4 w-4 fill-current" />;
      case "dead":
        return <Skull className="h-4 w-4 fill-current" />;
      default:
        return <Zap className="h-4 w-4 fill-current" />;
    }
  };

  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      normal: "bg-gray-400",
      fire: "bg-red-500",
      water: "bg-blue-500",
      electric: "bg-yellow-400",
      grass: "bg-green-500",
      ice: "bg-blue-200",
      fighting: "bg-red-700",
      poison: "bg-purple-500",
      ground: "bg-yellow-600",
      flying: "bg-indigo-400",
      psychic: "bg-pink-500",
      bug: "bg-green-400",
      rock: "bg-yellow-800",
      ghost: "bg-purple-700",
      dragon: "bg-indigo-700",
      dark: "bg-gray-800",
      steel: "bg-gray-500",
      fairy: "bg-pink-300",
    };
    return typeColors[type] || "bg-gray-400";
  };

  const getPokemonImage = () => {
    if (!pokeData || imageError) return null;

    // Try different image sources in order of preference
    const imageUrls = [
      pokeData.sprites?.other?.["official-artwork"]?.front_default,
      pokeData.sprites?.other?.dream_world?.front_default,
      pokeData.sprites?.front_default,
    ].filter(Boolean);

    return imageUrls[0] || null;
  };

  const isShiny = Math.random() < 0.1; // 10% chance for demo purposes
  const isLegendary = pokemon.level > 50 && Math.random() < 0.2; // Mock legendary status

  return (
    <Card
      className={`
      relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group
      ${
        pokemon.status === "dead"
          ? "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300"
          : "bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border-blue-200/50"
      }
      ${isShiny ? "ring-2 ring-yellow-400/50 shadow-yellow-200/50" : ""}
    `}
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-2xl -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-200/20 to-yellow-200/20 rounded-full blur-xl translate-y-12 -translate-x-12" />

      {/* Shiny sparkle effect */}
      {isShiny && (
        <div className="absolute top-2 right-2 animate-pulse">
          <Sparkles className="h-5 w-5 text-yellow-500 fill-yellow-400" />
        </div>
      )}

      {/* Legendary crown */}
      {isLegendary && (
        <div className="absolute top-2 left-2">
          <Crown className="h-5 w-5 text-yellow-600 fill-yellow-500" />
        </div>
      )}

      <CardContent className="p-5 relative">
        <div className="flex items-start gap-4">
          {/* Pokemon Image/Avatar */}
          <div className="relative">
            {loading ? (
              <Avatar className="h-16 w-16 animate-pulse">
                <AvatarFallback className="bg-slate-200"></AvatarFallback>
              </Avatar>
            ) : getPokemonImage() ? (
              <div
                className={`
                relative h-16 w-16 rounded-xl overflow-hidden border-2 
                ${
                  pokemon.status === "alive"
                    ? "border-blue-200 shadow-lg"
                    : "border-slate-300"
                }
                ${isShiny ? "border-yellow-300 shadow-yellow-200/50" : ""}
              `}
              >
                <img
                  src={getPokemonImage()!}
                  alt={pokemon.species}
                  className={`w-full h-full object-contain bg-gradient-to-br from-slate-50 to-blue-50 
                    ${pokemon.status === "dead" ? "grayscale opacity-60" : ""}
                  `}
                  onError={() => setImageError(true)}
                />
                {pokemon.status === "dead" && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Skull className="h-6 w-6 text-white drop-shadow" />
                  </div>
                )}
              </div>
            ) : (
              <Avatar className="h-16 w-16 border-2 border-blue-200">
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 font-bold text-lg">
                  {pokemon.species[0]}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          <div className="flex-1 space-y-3">
            {/* Header with name and actions */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-lg leading-tight">
                  {pokemon.nickname || pokemon.name}
                  {pokemon.nickname && (
                    <span className="text-sm text-slate-500 ml-2 font-normal">
                      ({pokemon.species})
                    </span>
                  )}
                </h4>

                {/* Level and Status */}
                <div className="flex items-center gap-3 mt-1">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    Lv. {pokemon.level}
                  </span>
                  <div
                    className={`flex items-center gap-1 ${getStatusColor(
                      pokemon.status
                    )} font-medium`}
                  >
                    {getStatusIcon(pokemon.status)}
                    <span className="capitalize text-sm">{pokemon.status}</span>
                  </div>
                  {isShiny && (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs font-medium">Shiny</span>
                    </div>
                  )}
                </div>
              </div>

              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="backdrop-blur-sm">
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
                            className="text-red-600 focus:text-red-600"
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
                            className="text-emerald-600 focus:text-emerald-600"
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
                        <DropdownMenuItem
                          onClick={onDelete}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Forever
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Pokemon Types */}
            {pokeData?.types && (
              <div className="flex gap-1.5">
                {pokeData.types.map((typeInfo) => (
                  <span
                    key={typeInfo.type.name}
                    className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getTypeColor(
                      typeInfo.type.name
                    )}`}
                  >
                    {typeInfo.type.name.toUpperCase()}
                  </span>
                ))}
              </div>
            )}

            {/* Location and Date Info */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-3.5 w-3.5" />
                <span>{pokemon.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-3.5 w-3.5" />
                <span>Caught {formatDate(pokemon.caughtAt)}</span>
              </div>
              {pokemon.status === "dead" && pokemon.diedAt && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <Skull className="h-3.5 w-3.5" />
                  <span>Died {formatDate(pokemon.diedAt)}</span>
                  {pokemon.cause && (
                    <span className="font-medium">- {pokemon.cause}</span>
                  )}
                </div>
              )}
            </div>

            {/* Pokemon Stats Bar (if available) */}
            {pokeData?.stats && pokemon.status === "alive" && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {pokeData.stats.slice(0, 3).map((stat) => (
                    <div key={stat.stat.name} className="text-center">
                      <div className="text-slate-500 capitalize">
                        {stat.stat.name === "special-attack"
                          ? "Sp.Atk"
                          : stat.stat.name === "special-defense"
                          ? "Sp.Def"
                          : stat.stat.name}
                      </div>
                      <div className="font-bold text-slate-700">
                        {stat.base_stat}
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1 mt-1">
                        <div
                          className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              (stat.base_stat / 255) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Demo component
export default function Demo() {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([
    {
      id: "1",
      name: "Pikachu",
      nickname: "Sparky",
      species: "pikachu",
      level: 25,
      status: "alive",
      location: "Viridian Forest",
      caughtAt: "2024-01-15",
      isInParty: true,
    },
    {
      id: "2",
      name: "Charizard",
      nickname: "Blaze",
      species: "charizard",
      level: 45,
      status: "alive",
      location: "Cinnabar Island",
      caughtAt: "2024-01-20",
      isInParty: false,
    },
    {
      id: "3",
      name: "Blastoise",
      species: "blastoise",
      level: 42,
      status: "dead",
      location: "Seafoam Islands",
      caughtAt: "2024-01-18",
      diedAt: "2024-02-01",
      cause: "Elite Four Battle",
      isInParty: false,
    },
  ]);

  const partyCount = pokemonList.filter((p) => p.isInParty).length;

  const handleToggleParty = (pokemonId: string) => {
    setPokemonList((prev) =>
      prev.map((pokemon) => {
        if (pokemon.id === pokemonId) {
          // If removing from party, just toggle
          if (pokemon.isInParty) {
            return { ...pokemon, isInParty: false };
          }
          // If adding to party, check constraints
          if (partyCount < 6 && pokemon.status === "alive") {
            return { ...pokemon, isInParty: true };
          }
        }
        return pokemon;
      })
    );
  };

  const handleKill = (pokemonId: string, cause?: string) => {
    setPokemonList((prev) =>
      prev.map((pokemon) =>
        pokemon.id === pokemonId
          ? {
              ...pokemon,
              status: "dead" as const,
              diedAt: new Date().toISOString(),
              cause: cause || "Unknown",
              isInParty: false, // Remove from party when killed
            }
          : pokemon
      )
    );
  };

  const handleRevive = (pokemonId: string) => {
    setPokemonList((prev) =>
      prev.map((pokemon) =>
        pokemon.id === pokemonId
          ? {
              ...pokemon,
              status: "alive" as const,
              diedAt: undefined,
              cause: undefined,
            }
          : pokemon
      )
    );
  };

  const handleDelete = (pokemonId: string) => {
    setPokemonList((prev) =>
      prev.filter((pokemon) => pokemon.id !== pokemonId)
    );
  };

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Pokemon Party Manager
          </h1>
          <p className="text-slate-600">Party: {partyCount}/6 Pokemon</p>
          <p className="text-sm text-slate-500 mt-1">
            Click on cards to add/remove from party
          </p>
        </div>

        {pokemonList.map((pokemon) => (
          <PokemonCard
            key={pokemon.id}
            pokemon={pokemon}
            onEdit={() => console.log("Edit", pokemon.id)}
            onDelete={() => handleDelete(pokemon.id)}
            onKill={handleKill}
            onRevive={handleRevive}
            onToggleParty={handleToggleParty}
            partyCount={partyCount}
          />
        ))}
      </div>
    </div>
  );
}
