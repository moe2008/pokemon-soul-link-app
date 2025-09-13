"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Zap, Search, Loader2, Star, Heart } from "lucide-react";

interface Pokemon {
  id: string;
  name: string;
  species: string;
  level: number;
  location: string;
  status: "alive" | "dead" | "boxed";
  nickname?: string;
  caughtAt: string;
}

interface PokemonSpecies {
  name: string;
  url: string;
  id: number;
  sprite?: string;
  types?: string[];
}

interface AddEncounterDialogProps {
  location: string;
  onAddPokemon: (pokemon: Omit<Pokemon, "id">) => void;
  existingPokemon?: Pokemon | null;
}

export function AddEncounterDialog({
  location,
  onAddPokemon,
  existingPokemon,
}: AddEncounterDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pokemonList, setPokemonList] = useState<PokemonSpecies[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonSpecies | null>(
    null
  );
  const [formData, setFormData] = useState({
    level: existingPokemon?.level || 5,
    nickname: existingPokemon?.nickname || "",
    notes: "",
  });

  // Lade alle Pokemon von der PokeAPI
  useEffect(() => {
    const fetchPokemon = async () => {
      if (pokemonList.length > 0) return;

      setLoading(true);
      try {
        // Lade die ersten 1010 Pokemon (alle Generationen bis Gen 9)
        const response = await fetch(
          "https://pokeapi.co/api/v2/pokemon?limit=1010"
        );
        const data = await response.json();

        const pokemonWithDetails = data.results.map(
          (pokemon: any, index: number) => ({
            name:
              pokemon.name.charAt(0).toUpperCase() +
              pokemon.name.slice(1).replace("-", " "),
            url: pokemon.url,
            id: index + 1,
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${
              index + 1
            }.png`,
          })
        );

        setPokemonList(pokemonWithDetails);
      } catch (error) {
        console.error("Fehler beim Laden der Pokemon:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchPokemon();
    }
  }, [isOpen, pokemonList.length]);

  // Gefilterte Pokemon basierend auf Suche
  const filteredPokemon = useMemo(() => {
    if (!searchQuery.trim()) return pokemonList.slice(0, 50); // Zeige erste 50 wenn keine Suche

    return pokemonList
      .filter((pokemon) =>
        pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 20); // Limitiere Suchergebnisse
  }, [pokemonList, searchQuery]);

  const handleSubmit = () => {
    if (!selectedPokemon) return;

    const pokemon: Omit<Pokemon, "id"> = {
      name: selectedPokemon.name,
      species: selectedPokemon.name,
      level: formData.level,
      location,
      status: "alive",
      nickname: formData.nickname || undefined,
      caughtAt: new Date().toISOString(),
    };

    onAddPokemon(pokemon);
    setIsOpen(false);
    setSelectedPokemon(null);
    setSearchQuery("");
    setFormData({
      level: 5,
      nickname: "",
      notes: "",
    });
  };

  const resetForm = () => {
    setIsOpen(false);
    setSelectedPokemon(null);
    setSearchQuery("");
    setFormData({
      level: 5,
      nickname: "",
      notes: "",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 transition-all duration-300 group"
        >
          <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
          {existingPokemon ? "Edit" : "Add"} Encounter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 -m-6 mb-4 rounded-t-lg">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Zap className="h-6 w-6 text-yellow-300" />
            {existingPokemon ? "Edit" : "Catch a"} Pokemon
          </DialogTitle>
          <DialogDescription className="text-blue-100">
            Record your Pokemon encounter at{" "}
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-white/30"
            >
              {location}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pokemon Auswahl */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <Search className="h-5 w-5" />
              Choose Your Pokemon *
            </Label>

            {/* Suchfeld */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a Pokemon..."
                className="pl-10 h-12 text-lg"
              />
            </div>

            {/* Ausgewähltes Pokemon */}
            {selectedPokemon && (
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={selectedPokemon.sprite}
                        alt={selectedPokemon.name}
                        className="w-20 h-20 object-contain bg-white/50 rounded-full p-2"
                        onError={(e) => {
                          (
                            e.target as HTMLImageElement
                          ).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemon.id}.png`;
                        }}
                      />
                      <Star className="absolute -top-1 -right-1 h-6 w-6 text-yellow-500 fill-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-green-800">
                        {selectedPokemon.name}
                      </h3>
                      <p className="text-green-600">
                        #{selectedPokemon.id.toString().padStart(3, "0")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPokemon(null)}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      Change
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pokemon Grid */}
            {!selectedPokemon && (
              <div className="space-y-2">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className="ml-2 text-lg">Loading Pokemon...</span>
                  </div>
                ) : (
                  <div className="h-80 w-full rounded-lg border bg-gradient-to-b from-blue-50 to-white p-2 overflow-y-auto">
                    <div className="grid grid-cols-4 gap-2">
                      {filteredPokemon.map((pokemon) => (
                        <Card
                          key={pokemon.id}
                          className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 border-2 hover:border-blue-300 group"
                          onClick={() => setSelectedPokemon(pokemon)}
                        >
                          <CardContent className="p-2 text-center">
                            <div className="relative mb-2">
                              <img
                                src={pokemon.sprite}
                                alt={pokemon.name}
                                className="w-16 h-16 mx-auto object-contain group-hover:scale-110 transition-transform"
                                loading="lazy"
                                onError={(e) => {
                                  (
                                    e.target as HTMLImageElement
                                  ).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
                                }}
                              />
                              <Heart className="absolute top-0 right-0 h-4 w-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-xs font-medium truncate group-hover:text-blue-700">
                              {pokemon.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              #{pokemon.id.toString().padStart(3, "0")}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    {filteredPokemon.length === 0 && searchQuery && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No Pokemon found matching "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Weitere Details */}
          {selectedPokemon && (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level" className="font-semibold">
                    Level
                  </Label>
                  <Input
                    id="level"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        level: Number.parseInt(e.target.value) || 5,
                      })
                    }
                    className="h-12 text-lg text-center font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nickname" className="font-semibold">
                    Nickname
                  </Label>
                  <Input
                    id="nickname"
                    value={formData.nickname}
                    onChange={(e) =>
                      setFormData({ ...formData, nickname: e.target.value })
                    }
                    placeholder="Give it a nickname..."
                    className="h-12 text-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="font-semibold">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="How did you encounter this Pokemon? Any special details..."
                  rows={3}
                  className="text-base"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              className="flex-1 h-12 text-lg bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
              disabled={!selectedPokemon}
            >
              <Zap className="h-5 w-5 mr-2" />
              {existingPokemon ? "Update" : "Catch"} Pokemon!
            </Button>
            <Button
              variant="outline"
              onClick={resetForm}
              className="flex-1 h-12 text-lg hover:bg-gray-100 transition-all duration-300"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
