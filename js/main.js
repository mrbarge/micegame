import { GAME_CONFIG } from './gameConfig.js';
import { GameScene } from './gameScene.js';

// Initialize the game
const config = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.GRID_WIDTH * GAME_CONFIG.CELL_SIZE + 70,
    height: GAME_CONFIG.GRID_HEIGHT * GAME_CONFIG.CELL_SIZE + 140,
    parent: 'phaser-game',
    backgroundColor: '#2c3e50',
    scene: GameScene,
    scale: {
        mode: Phaser.Scale.NONE, // Disable auto-scaling
        autoCenter: Phaser.Scale.NO_CENTER // Disable auto-centering
    }
};

const game = new Phaser.Game(config);