# TypeScript Roguelike Game

A modern roguelike game built with TypeScript, Phaser 3, and advanced algorithms for dungeon generation and field of view.

## 🎮 Features

- **Procedural Dungeon Generation** using ROT.js
- **Advanced Field of View** with MRPAS algorithm
- **Turn-based Combat System** with stats and damage calculation
- **Enemy AI** that hunts the player intelligently
- **Grid-based Movement** with classic roguelike feel
- **Real-time UI** showing health, level, and combat messages
- **Modern TypeScript Architecture** with strict mode enabled

## 🛠️ Tech Stack

- **TypeScript 5.x** - Type-safe development with strict mode
- **Phaser 3** - Modern 2D game engine for web
- **Vite** - Ultra-fast build tool and dev server
- **ROT.js** - Roguelike algorithms and dungeon generation
- **MRPAS** - Advanced field of view calculations

## 🚀 Getting Started

### Prerequisites
- Node.js (18+ recommended)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd roguelike-game
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🎯 How to Play

- **Movement**: Use WASD keys or arrow keys to move around
- **Combat**: Walk into enemies to attack them
- **Wait**: Press Space to skip your turn
- **Objective**: Defeat all enemies in the dungeon!

## 🏗️ Project Structure

```
src/
├── core/           # Game engine and scene management
├── entities/       # Player, enemies, and game objects
├── combat/         # Combat system and damage calculation
├── utils/          # Utilities, types, and constants
├── world/          # Dungeon generation and level management
├── ai/             # Enemy AI and pathfinding
└── ui/             # User interface components
```

## 🔧 Build

To build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📚 Key Libraries Used

- **[Phaser 3](https://phaser.io/)** - 2D game framework
- **[ROT.js](https://ondras.github.io/rot.js/hp/)** - Roguelike algorithms
- **[MRPAS](https://www.npmjs.com/package/mrpas)** - Field of view algorithm
- **[Vite](https://vitejs.dev/)** - Build tool and dev server

## 🎨 Game Design

This roguelike follows traditional genre conventions:
- Grid-based movement and positioning
- Turn-based gameplay mechanics
- Procedurally generated dungeons
- Fog of war with field of view
- Progressive difficulty and character stats

## 🔮 Future Enhancements

- Inventory and item system
- Multiple dungeon levels
- Character progression and leveling
- Different enemy types and behaviors
- Save/load functionality
- Audio and visual effects

## 📄 License

MIT License - feel free to use this code for your own projects!

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

Built with ❤️ using modern TypeScript and game development best practices.