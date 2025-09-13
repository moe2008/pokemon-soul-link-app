export interface Badge {
  id: string
  name: string
  city: string
  leader: string
  type: string
  description: string
  order: number
}

export const fireRedBadges: Badge[] = [
  {
    id: "pewter",
    name: "Boulder Badge",
    city: "Pewter City",
    leader: "Brock",
    type: "Rock",
    description: "Defeat Brock, the Rock-type Gym Leader",
    order: 1,
  },
  {
    id: "cerulean",
    name: "Cascade Badge",
    city: "Cerulean City",
    leader: "Misty",
    type: "Water",
    description: "Defeat Misty, the Water-type Gym Leader",
    order: 2,
  },
  {
    id: "vermilion",
    name: "Thunder Badge",
    city: "Vermilion City",
    leader: "Lt. Surge",
    type: "Electric",
    description: "Defeat Lt. Surge, the Electric-type Gym Leader",
    order: 3,
  },
  {
    id: "celadon",
    name: "Rainbow Badge",
    city: "Celadon City",
    leader: "Erika",
    type: "Grass",
    description: "Defeat Erika, the Grass-type Gym Leader",
    order: 4,
  },
  {
    id: "fuchsia",
    name: "Soul Badge",
    city: "Fuchsia City",
    leader: "Koga",
    type: "Poison",
    description: "Defeat Koga, the Poison-type Gym Leader",
    order: 5,
  },
  {
    id: "saffron",
    name: "Marsh Badge",
    city: "Saffron City",
    leader: "Sabrina",
    type: "Psychic",
    description: "Defeat Sabrina, the Psychic-type Gym Leader",
    order: 6,
  },
  {
    id: "cinnabar",
    name: "Volcano Badge",
    city: "Cinnabar Island",
    leader: "Blaine",
    type: "Fire",
    description: "Defeat Blaine, the Fire-type Gym Leader",
    order: 7,
  },
  {
    id: "viridian",
    name: "Earth Badge",
    city: "Viridian City",
    leader: "Giovanni",
    type: "Ground",
    description: "Defeat Giovanni, the Ground-type Gym Leader",
    order: 8,
  },
]
