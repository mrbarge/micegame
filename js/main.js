import { GAME_CONFIG } from './gameConfig.js';
import { GameScene } from './gameScene.js';

// Initialize the game
const config = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.GRID_WIDTH * GAME_CONFIG.CELL_SIZE + 100,
    height: GAME_CONFIG.GRID_HEIGHT * GAME_CONFIG.CELL_SIZE + 100,
    parent: 'phaser-game',
    backgroundColor: '#2c3e50',
    scene: GameScene,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        max: {
            width: 1200,
            height: 800
        }
    }
};

const game = new Phaser.Game(config);