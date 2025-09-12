export interface Badge {
  id: string
  name: string
  city: string
  leader: string
  type: string
  description: string
  order: number
}

export const soulSilverBadges: Badge[] = [
  {
    id: "violet",
    name: "Zephyr Badge",
    city: "Violet City",
    leader: "Falkner",
    type: "Flying",
    description: "Defeat Falkner, the Flying-type Gym Leader",
    order: 1,
  },
  {
    id: "azalea",
    name: "Hive Badge",
    city: "Azalea Town",
    leader: "Bugsy",
    type: "Bug",
    description: "Defeat Bugsy, the Bug-type Gym Leader",
    order: 2,
  },
  {
    id: "goldenrod",
    name: "Plain Badge",
    city: "Goldenrod City",
    leader: "Whitney",
    type: "Normal",
    description: "Defeat Whitney, the Normal-type Gym Leader",
    order: 3,
  },
  {
    id: "ecruteak",
    name: "Fog Badge",
    city: "Ecruteak City",
    leader: "Morty",
    type: "Ghost",
    description: "Defeat Morty, the Ghost-type Gym Leader",
    order: 4,
  },
  {
    id: "cianwood",
    name: "Storm Badge",
    city: "Cianwood City",
    leader: "Chuck",
    type: "Fighting",
    description: "Defeat Chuck, the Fighting-type Gym Leader",
    order: 5,
  },
  {
    id: "olivine",
    name: "Mineral Badge",
    city: "Olivine City",
    leader: "Jasmine",
    type: "Steel",
    description: "Defeat Jasmine, the Steel-type Gym Leader",
    order: 6,
  },
  {
    id: "mahogany",
    name: "Glacier Badge",
    city: "Mahogany Town",
    leader: "Pryce",
    type: "Ice",
    description: "Defeat Pryce, the Ice-type Gym Leader",
    order: 7,
  },
  {
    id: "blackthorn",
    name: "Rising Badge",
    city: "Blackthorn City",
    leader: "Clair",
    type: "Dragon",
    description: "Defeat Clair, the Dragon-type Gym Leader",
    order: 8,
  },
]

export const kantoBadges: Badge[] = [
  {
    id: "pewter",
    name: "Boulder Badge",
    city: "Pewter City",
    leader: "Brock",
    type: "Rock",
    description: "Defeat Brock, the Rock-type Gym Leader",
    order: 9,
  },
  {
    id: "cerulean",
    name: "Cascade Badge",
    city: "Cerulean City",
    leader: "Misty",
    type: "Water",
    description: "Defeat Misty, the Water-type Gym Leader",
    order: 10,
  },
  {
    id: "vermilion",
    name: "Thunder Badge",
    city: "Vermilion City",
    leader: "Lt. Surge",
    type: "Electric",
    description: "Defeat Lt. Surge, the Electric-type Gym Leader",
    order: 11,
  },
  {
    id: "celadon",
    name: "Rainbow Badge",
    city: "Celadon City",
    leader: "Erika",
    type: "Grass",
    description: "Defeat Erika, the Grass-type Gym Leader",
    order: 12,
  },
  {
    id: "fuchsia",
    name: "Soul Badge",
    city: "Fuchsia City",
    leader: "Janine",
    type: "Poison",
    description: "Defeat Janine, the Poison-type Gym Leader",
    order: 13,
  },
  {
    id: "saffron",
    name: "Marsh Badge",
    city: "Saffron City",
    leader: "Sabrina",
    type: "Psychic",
    description: "Defeat Sabrina, the Psychic-type Gym Leader",
    order: 14,
  },
  {
    id: "cinnabar",
    name: "Volcano Badge",
    city: "Cinnabar Island",
    leader: "Blaine",
    type: "Fire",
    description: "Defeat Blaine, the Fire-type Gym Leader",
    order: 15,
  },
  {
    id: "viridian",
    name: "Earth Badge",
    city: "Viridian City",
    leader: "Blue",
    type: "Various",
    description: "Defeat Blue, the Viridian Gym Leader",
    order: 16,
  },
]
