🔗 Soullink Dashboard
A modern, interactive dashboard for tracking Pokemon Soullink challenges - where every bond matters and every loss is shared.
Bild anzeigen
Bild anzeigen
Bild anzeigen
Bild anzeigen
✨ Features

🎮 Dual Player Tracking - Monitor both players' teams simultaneously
🔗 Soullink Connections - Visual representation of Pokemon bonds between players
📊 Real-time Status Updates - Live tracking of Pokemon health, levels, and status
🖼️ Dynamic Sprites - Automatic Pokemon sprite loading from PokeAPI
⚰️ Graveyard Management - Honor fallen Pokemon with dedicated memorial sections
📱 Responsive Design - Perfect experience on desktop, tablet, and mobile
🎨 Modern UI - Beautiful gradient designs with smooth animations

🎯 What is a Soullink?
A Soullink is a Pokemon challenge variant where two players play through their games simultaneously with special rules:

Each player's Pokemon is "linked" to one of their partner's Pokemon
If one Pokemon in a linked pair faints, both must be considered "dead"
This creates an intense cooperative experience where both players must protect not just their own team, but their partner's as well

🚀 Getting Started
Prerequisites

Node.js 18+
npm or yarn
A modern web browser

Installation

Clone the repository

bash   git clone https://github.com/yourusername/soullink-dashboard.git
   cd soullink-dashboard

Install dependencies

bash   npm install
   # or
   yarn install

Start the development server

bash   npm run dev
   # or
   yarn dev

Open your browser
Navigate to http://localhost:3000

🏗️ Project Structure
soullink-dashboard/
├── src/
│   ├── components/
│   │   ├── StarterPokemonSprite.tsx    # Pokemon sprite display
│   │   ├── StarterTeamDisplay.tsx      # Team overview component
│   │   ├── SoullinkConnections.tsx     # Connection management
│   │   └── SoullinkConnectionCard.tsx  # Individual connection cards
│   ├── types/
│   │   └── pokemon.ts                  # TypeScript definitions
│   ├── hooks/
│   │   └── usePokeAPI.ts              # PokeAPI integration
│   └── utils/
│       └── soullink.ts                # Soullink logic utilities
├── public/
├── package.json
└── README.md
🎮 Usage
Setting Up a Soullink Run

Create Player Profiles

Enter both players' names
Set up starter Pokemon for each player


Establish Soullink Connections

Link Pokemon between players using the connection interface
Each Pokemon can only be linked to one partner Pokemon


Track Progress

Update Pokemon levels, status, and nicknames
Move fainted Pokemon to the graveyard
Monitor active connections in real-time



Data Format
The dashboard expects data in the following format:
typescriptinterface GameData {
  player1: {
    name: string;
    team: Pokemon[];
    graveyard: Pokemon[];
  };
  player2: {
    name: string;
    team: Pokemon[];
    graveyard: Pokemon[];
  };
}

interface Pokemon {
  id: string;
  name: string;
  species: string;
  nickname?: string;
  level: number;
  status: "alive" | "dead";
  linkedPokemonId?: string;
}
🎨 Customization
Themes
The dashboard uses Tailwind CSS for styling. You can customize the theme by modifying:

tailwind.config.js - Color schemes and design tokens
CSS custom properties in globals.css
Component-specific styles in individual components

Adding New Features
The modular component structure makes it easy to extend:

Create new components in src/components/
Add TypeScript types in src/types/
Implement hooks for data management in src/hooks/

🔌 API Integration
PokeAPI
The dashboard integrates with PokeAPI for:

Pokemon sprite images
Species information
Move data (future feature)

Rate Limiting
Be mindful of API rate limits. The app implements:

Response caching
Error handling for failed requests
Fallback to text-based Pokemon representation

🧪 Testing
bash# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
📦 Building for Production
bash# Create production build
npm run build

# Preview production build
npm run preview
🤝 Contributing
Contributions are welcome! Please read our contributing guidelines:

Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

Development Guidelines

Follow TypeScript best practices
Write tests for new features
Use semantic commit messages
Maintain responsive design principles
Follow the existing code style

📋 Roadmap

 Save/Load System - Export and import Soullink progress
 Battle Tracker - Log gym battles and important encounters
 Statistics Dashboard - Survival rates, level progression charts
 Rules Engine - Customizable Soullink rule variations
 Multiplayer Sync - Real-time collaboration between players
 Mobile App - Native mobile companion
 Twitch Integration - Streaming overlay support

🐛 Known Issues

Sprite loading may be slow on first load (cached afterwards)
Some older Pokemon sprites may not be available
Mobile tooltip positioning needs refinement

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
🙏 Acknowledgments

PokeAPI - For the amazing Pokemon data API
Lucide - For the beautiful icons
Tailwind CSS - For the utility-first CSS framework
The Pokemon community - For keeping the spirit of adventure alive

💡 Support
If you encounter any issues or have questions:

🐛 Report bugs
💬 Start a discussion
📧 Email: your.email@example.com


<div align="center">
Made with ❤️ for the Pokemon community
"In Soullink, we share the bonds of victory and the weight of loss together."
</div>
