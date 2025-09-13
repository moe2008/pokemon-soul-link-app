export interface Badge {
  id: string
  name: string
  city: string
  leader: string
  type: string
  description: string
  order: number
}

export const hoennBadges: Badge[] = [
  {
    id: "rustboro",
    name: "Stone Badge",
    city: "Rustboro City",
    leader: "Roxanne",
    type: "Rock",
    description: "Defeat Roxanne, the Rock-type Gym Leader",
    order: 1,
  },
  {
    id: "dewford",
    name: "Knuckle Badge",
    city: "Dewford Town",
    leader: "Brawly",
    type: "Fighting",
    description: "Defeat Brawly, the Fighting-type Gym Leader",
    order: 2,
  },
  {
    id: "mauville",
    name: "Dynamo Badge",
    city: "Mauville City",
    leader: "Wattson",
    type: "Electric",
    description: "Defeat Wattson, the Electric-type Gym Leader",
    order: 3,
  },
  {
    id: "lavaridge",
    name: "Heat Badge",
    city: "Lavaridge Town",
    leader: "Flannery",
    type: "Fire",
    description: "Defeat Flannery, the Fire-type Gym Leader",
    order: 4,
  },
  {
    id: "petalburg",
    name: "Balance Badge",
    city: "Petalburg City",
    leader: "Norman",
    type: "Normal",
    description: "Defeat Norman, the Normal-type Gym Leader",
    order: 5,
  },
  {
    id: "fortree",
    name: "Feather Badge",
    city: "Fortree City",
    leader: "Winona",
    type: "Flying",
    description: "Defeat Winona, the Flying-type Gym Leader",
    order: 6,
  },
  {
    id: "mossdeep",
    name: "Mind Badge",
    city: "Mossdeep City",
    leader: "Tate & Liza",
    type: "Psychic",
    description: "Defeat Tate & Liza, the Psychic-type Gym Leaders",
    order: 7,
  },
  {
    id: "soutopolis",
    name: "Rain Badge",
    city: "Sootopolis City",
    leader: "Wallace",
    type: "Water",
    description: "Defeat Wallace, the Water-type Gym Leader",
    order: 8,
  },
]
