export interface Badge {
  id: string
  name: string
  city: string
  leader: string
  type: string
  description: string
  order: number
}

export const blackBadges: Badge[] = [
  {
    id: "striaton",
    name: "Trio Badge",
    city: "Striaton City",
    leader: "Cilan / Chili / Cress",
    type: "Grass / Fire / Water",
    description: "Defeat one of the Striaton Gym Leaders (Cilan, Chili, or Cress)",
    order: 1,
  },
  {
    id: "nacrene",
    name: "Basic Badge",
    city: "Nacrene City",
    leader: "Lenora",
    type: "Normal",
    description: "Defeat Lenora, the Normal-type Gym Leader",
    order: 2,
  },
  {
    id: "castelia",
    name: "Insect Badge",
    city: "Castelia City",
    leader: "Burgh",
    type: "Bug",
    description: "Defeat Burgh, the Bug-type Gym Leader",
    order: 3,
  },
  {
    id: "nimbasa",
    name: "Bolt Badge",
    city: "Nimbasa City",
    leader: "Elesa",
    type: "Electric",
    description: "Defeat Elesa, the Electric-type Gym Leader",
    order: 4,
  },
  {
    id: "driftveil",
    name: "Quake Badge",
    city: "Driftveil City",
    leader: "Clay",
    type: "Ground",
    description: "Defeat Clay, the Ground-type Gym Leader",
    order: 5,
  },
  {
    id: "mistralton",
    name: "Jet Badge",
    city: "Mistralton City",
    leader: "Skyla",
    type: "Flying",
    description: "Defeat Skyla, the Flying-type Gym Leader",
    order: 6,
  },
  {
    id: "icirrus",
    name: "Freeze Badge",
    city: "Icirrus City",
    leader: "Brycen",
    type: "Ice",
    description: "Defeat Brycen, the Ice-type Gym Leader",
    order: 7,
  },
  {
    id: "opelucid",
    name: "Legend Badge",
    city: "Opelucid City",
    leader: "Drayden",
    type: "Dragon",
    description: "Defeat Drayden, the Dragon-type Gym Leader",
    order: 8,
  },
]
