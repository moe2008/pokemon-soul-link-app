export interface Badge {
  id: string
  name: string
  city: string
  leader: string
  type: string
  description: string
  order: number
}

export const diamondBadges: Badge[] = [
  {
    id: "oreburgh",
    name: "Coal Badge",
    city: "Oreburgh City",
    leader: "Roark",
    type: "Rock",
    description: "Defeat Roark, the Rock-type Gym Leader",
    order: 1,
  },
  {
    id: "eterna",
    name: "Forest Badge",
    city: "Eterna City",
    leader: "Gardenia",
    type: "Grass",
    description: "Defeat Gardenia, the Grass-type Gym Leader",
    order: 2,
  },
  {
    id: "veilstone",
    name: "Cobble Badge",
    city: "Veilstone City",
    leader: "Maylene",
    type: "Fighting",
    description: "Defeat Maylene, the Fighting-type Gym Leader",
    order: 3,
  },
  {
    id: "pastoria",
    name: "Fen Badge",
    city: "Pastoria City",
    leader: "Crasher Wake",
    type: "Water",
    description: "Defeat Crasher Wake, the Water-type Gym Leader",
    order: 4,
  },
  {
    id: "hearthome",
    name: "Relic Badge",
    city: "Hearthome City",
    leader: "Fantina",
    type: "Ghost",
    description: "Defeat Fantina, the Ghost-type Gym Leader",
    order: 5,
  },
  {
    id: "canalave",
    name: "Mine Badge",
    city: "Canalave City",
    leader: "Byron",
    type: "Steel",
    description: "Defeat Byron, the Steel-type Gym Leader",
    order: 6,
  },
  {
    id: "snowpoint",
    name: "Icicle Badge",
    city: "Snowpoint City",
    leader: "Candice",
    type: "Ice",
    description: "Defeat Candice, the Ice-type Gym Leader",
    order: 7,
  },
  {
    id: "sunnyshore",
    name: "Beacon Badge",
    city: "Sunyshore City",
    leader: "Volkner",
    type: "Electric",
    description: "Defeat Volkner, the Electric-type Gym Leader",
    order: 8,
  },
]
