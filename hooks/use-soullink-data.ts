"use client";

import { useState, useEffect } from "react";

export interface Pokemon {
  id: string;
  name: string;
  species: string;
  level: number;
  location: string;
  status: "alive" | "dead";
  nickname?: string;
  caughtAt: string;
  diedAt?: string;
  cause?: string;
  isInParty?: boolean;
  linkedPokemonId?: string;
}

export interface Player {
  name: string;
  avatar: string;
  badges: number;
  alive: number;
  dead: number;
  team: Pokemon[];
  encounters: Record<string, Pokemon | null>;
  graveyard: Pokemon[];
  earnedBadges: Record<string, boolean>;
  starterTeam?: Pokemon[];
}

export interface SoullinkData {
  player1: Player;
  player2: Player;
  gameVersion: string;
  startDate: string;
  rules: string[];
  lastSync?: string;
  syncId?: string;
}

const defaultPlayer: Player = {
  name: "",
  avatar: "/placeholder.svg?key=nvctd",
  badges: 0,
  alive: 0,
  dead: 0,
  team: [],
  encounters: {},
  graveyard: [],
  earnedBadges: {},
};

const defaultData: SoullinkData = {
  player1: { ...defaultPlayer, name: "Player 1" },
  player2: { ...defaultPlayer, name: "Player 2" },
  gameVersion: "Pokemon Soul Silver",
  startDate: new Date().toISOString(),
  rules: [
    "If a Pokemon faints, it's considered dead and must be released or permanently boxed",
    "You may only catch the first Pokemon encountered in each area",
    "All Pokemon must be nicknamed",
    "Both players must coordinate their catches and releases",
  ],
};

export function useSoullinkData() {
  const [data, setData] = useState<SoullinkData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("pokemon-soullink-data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Ensure earnedBadges exists for backward compatibility
        if (parsed.player1 && !parsed.player1.earnedBadges) {
          parsed.player1.earnedBadges = {};
        }
        if (parsed.player2 && !parsed.player2.earnedBadges) {
          parsed.player2.earnedBadges = {};
        }
        setData(parsed);
      } catch (error) {
        console.error("Failed to parse saved data:", error);
      }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get("data");
    if (sharedData) {
      try {
        const decoded = JSON.parse(atob(sharedData));
        setData(decoded);
        // Clean up URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } catch (error) {
        console.error("Failed to parse shared data:", error);
      }
    }

    setIsLoading(false);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      const dataToSave = {
        ...data,
        lastSync: new Date().toISOString(),
      };
      localStorage.setItem("pokemon-soullink-data", JSON.stringify(dataToSave));
    }
  }, [data, isLoading]);

  const updatePlayer = (
    playerKey: "player1" | "player2",
    updates: Partial<Player>
  ) => {
    setData((prev) => ({
      ...prev,
      [playerKey]: {
        ...prev[playerKey],
        ...updates,
      },
    }));
  };

  const addPokemon = (
    playerKey: "player1" | "player2",
    pokemon: Omit<Pokemon, "id">
  ) => {
    const newPokemon: Pokemon = {
      ...pokemon,
      id: Date.now().toString(),
    };

    setData((prev) => {
      const player = prev[playerKey];
      const updatedTeam = [...player.team, newPokemon];
      const updatedEncounters = {
        ...player.encounters,
        [pokemon.location]: newPokemon,
      };

      return {
        ...prev,
        [playerKey]: {
          ...player,
          team: updatedTeam,
          encounters: updatedEncounters,
          alive: player.alive + 1,
        },
      };
    });

    return newPokemon;
  };

  const killPokemon = (
    playerKey: "player1" | "player2",
    pokemonId: string,
    cause?: string
  ) => {
    setData((prev) => {
      const player = prev[playerKey];
      const pokemon = player.team.find((p) => p.id === pokemonId);

      if (!pokemon) return prev;

      const deadPokemon: Pokemon = {
        ...pokemon,
        status: "dead",
        diedAt: new Date().toISOString(),
        cause,
      };

      return {
        ...prev,
        [playerKey]: {
          ...player,
          team: player.team.filter((p) => p.id !== pokemonId),
          graveyard: [...player.graveyard, deadPokemon],
          alive: player.alive - 1,
          dead: player.dead + 1,
        },
      };
    });
  };

  const revivePokemon = (
    playerKey: "player1" | "player2",
    pokemonId: string
  ) => {
    setData((prev) => {
      const player = prev[playerKey];
      const pokemon = player.graveyard.find((p) => p.id === pokemonId);

      if (!pokemon) return prev;

      const revivedPokemon: Pokemon = {
        ...pokemon,
        status: "alive",
        diedAt: undefined,
        cause: undefined,
      };

      return {
        ...prev,
        [playerKey]: {
          ...player,
          team: [...player.team, revivedPokemon],
          graveyard: player.graveyard.filter((p) => p.id !== pokemonId),
          alive: player.alive + 1,
          dead: player.dead - 1,
        },
      };
    });
  };

  const deletePokemon = (
    playerKey: "player1" | "player2",
    pokemonId: string
  ) => {
    setData((prev) => {
      const player = prev[playerKey];

      // Check if pokemon is in team
      const teamPokemon = player.team.find((p) => p.id === pokemonId);
      if (teamPokemon) {
        // Remove from encounters if it exists there
        const updatedEncounters = { ...player.encounters };
        Object.keys(updatedEncounters).forEach((location) => {
          if (updatedEncounters[location]?.id === pokemonId) {
            updatedEncounters[location] = null;
          }
        });

        return {
          ...prev,
          [playerKey]: {
            ...player,
            team: player.team.filter((p) => p.id !== pokemonId),
            encounters: updatedEncounters,
            alive: player.alive - 1,
          },
        };
      }

      // Check if pokemon is in graveyard
      const graveyardPokemon = player.graveyard.find((p) => p.id === pokemonId);
      if (graveyardPokemon) {
        // Remove from encounters if it exists there
        const updatedEncounters = { ...player.encounters };
        Object.keys(updatedEncounters).forEach((location) => {
          if (updatedEncounters[location]?.id === pokemonId) {
            updatedEncounters[location] = null;
          }
        });

        return {
          ...prev,
          [playerKey]: {
            ...player,
            graveyard: player.graveyard.filter((p) => p.id !== pokemonId),
            encounters: updatedEncounters,
            dead: player.dead - 1,
          },
        };
      }

      return prev;
    });
  };

  const toggleBadge = (playerKey: "player1" | "player2", badgeId: string) => {
    setData((prev) => {
      const player = prev[playerKey];
      const currentlyEarned = player.earnedBadges[badgeId] || false;
      const newEarnedBadges = {
        ...player.earnedBadges,
        [badgeId]: !currentlyEarned,
      };

      // Count total badges
      const totalBadges = Object.values(newEarnedBadges).filter(Boolean).length;

      return {
        ...prev,
        [playerKey]: {
          ...player,
          earnedBadges: newEarnedBadges,
          badges: totalBadges,
        },
      };
    });
  };

  const toggleParty = (playerKey: "player1" | "player2", pokemonId: string) => {
    setData((prevData) => {
      const player = prevData[playerKey];
      const currentPartyCount = player.team.filter((p) => p.isInParty).length;

      const updatedTeam = player.team.map((pokemon) => {
        if (pokemon.id === pokemonId) {
          // Wenn Pokemon im Party ist, entfernen
          if (pokemon.isInParty) {
            return { ...pokemon, isInParty: false };
          }

          // Wenn hinzufügen und Party nicht voll und Pokemon lebt
          if (currentPartyCount < 6 && pokemon.status === "alive") {
            return { ...pokemon, isInParty: true };
          }
        }
        return pokemon;
      });

      // Auch encounters updaten falls das Pokemon dort ist
      const updatedEncounters = Object.fromEntries(
        Object.entries(player.encounters).map(([location, encounter]) => {
          if (encounter && encounter.id === pokemonId) {
            if (encounter.isInParty) {
              return [location, { ...encounter, isInParty: false }];
            }
            if (currentPartyCount < 6 && encounter.status === "alive") {
              return [location, { ...encounter, isInParty: true }];
            }
          }
          return [location, encounter];
        })
      );

      return {
        ...prevData,
        [playerKey]: {
          ...player,
          team: updatedTeam,
          encounters: updatedEncounters,
        },
      };
    });
  };

  const importData = (newData: SoullinkData) => {
    setData({
      ...newData,
      lastSync: new Date().toISOString(),
    });
  };

  const addBadge = (playerKey: "player1" | "player2") => {
    updatePlayer(playerKey, {
      badges: data[playerKey].badges + 1,
    });
  };

  const resetData = () => {
    setData(defaultData);
    localStorage.removeItem("pokemon-soullink-data");
  };

  const linkPokemon = (player1PokemonId: string, player2PokemonId: string) => {
    setData((prevData) => {
      const updatePokemonInArrays = (pokemon: Pokemon, linkedId: string) => ({
        ...pokemon,
        linkedPokemonId: linkedId,
      });

      const updatePlayer1 = {
        ...prevData.player1,
        team: prevData.player1.team.map((p) =>
          p.id === player1PokemonId
            ? updatePokemonInArrays(p, player2PokemonId)
            : p
        ),
        graveyard: prevData.player1.graveyard.map((p) =>
          p.id === player1PokemonId
            ? updatePokemonInArrays(p, player2PokemonId)
            : p
        ),
        encounters: Object.fromEntries(
          Object.entries(prevData.player1.encounters).map(
            ([location, pokemon]) => [
              location,
              pokemon && pokemon.id === player1PokemonId
                ? updatePokemonInArrays(pokemon, player2PokemonId)
                : pokemon,
            ]
          )
        ),
      };

      const updatePlayer2 = {
        ...prevData.player2,
        team: prevData.player2.team.map((p) =>
          p.id === player2PokemonId
            ? updatePokemonInArrays(p, player1PokemonId)
            : p
        ),
        graveyard: prevData.player2.graveyard.map((p) =>
          p.id === player2PokemonId
            ? updatePokemonInArrays(p, player1PokemonId)
            : p
        ),
        encounters: Object.fromEntries(
          Object.entries(prevData.player2.encounters).map(
            ([location, pokemon]) => [
              location,
              pokemon && pokemon.id === player2PokemonId
                ? updatePokemonInArrays(pokemon, player1PokemonId)
                : pokemon,
            ]
          )
        ),
      };

      return {
        ...prevData,
        player1: updatePlayer1,
        player2: updatePlayer2,
      };
    });
  };

  return {
    data,
    isLoading,
    linkPokemon,
    updatePlayer,
    addPokemon,
    killPokemon,
    revivePokemon,
    deletePokemon,
    toggleBadge,
    importData,
    addBadge,
    resetData,
    toggleParty,
  };
}
