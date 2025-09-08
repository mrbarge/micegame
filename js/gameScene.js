import { GAME_CONFIG } from './gameConfig.js';
import { GameBoard } from './gameBoard.js';
import { GameLogic } from './gameLogic.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.gameBoard = null;
        this.gameLogic = null;
        this.cellGraphics = [];
    }

    preload() {
        // Create simple colored rectangles for game pieces
        this.load.image('wall', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    }

    create() {
        this.gameBoard = new GameBoard();
        this.gameLogic = new GameLogic(this.gameBoard);

        this.createGrid();
        this.createColumnControls();
        this.gameLogic.updateUI();

        // Make scene accessible globally for controls
        window.gameScene = this;
    }

    createGrid() {
        const startX = 50;
        const startY = 50;

        // Clear existing graphics
        this.cellGraphics = [];

        for (let row = 0; row < GAME_CONFIG.GRID_HEIGHT; row++) {
            this.cellGraphics[row] = [];
            for (let col = 0; col < GAME_CONFIG.GRID_WIDTH; col++) {
                const x = startX + col * GAME_CONFIG.CELL_SIZE;
                const y = startY + row * GAME_CONFIG.CELL_SIZE;

                // Create cell background
                const cell = this.add.rectangle(x, y, GAME_CONFIG.CELL_SIZE - 1, GAME_CONFIG.CELL_SIZE - 1,
                    GAME_CONFIG.COLORS.EMPTY);
                cell.setStrokeStyle(1, GAME_CONFIG.COLORS.GRID_LINE);

                this.cellGraphics[row][col] = cell;
            }
        }

        this.updateGridDisplay();
    }

    updateGridDisplay() {
        for (let row = 0; row < GAME_CONFIG.GRID_HEIGHT; row++) {
            for (let col = 0; col < GAME_CONFIG.GRID_WIDTH; col++) {
                const cellType = this.gameBoard.getCellType(row, col);
                let color = GAME_CONFIG.COLORS.EMPTY;

                switch (cellType) {
                    case GAME_CONFIG.CELL_TYPES.WALL:
                        color = GAME_CONFIG.COLORS.WALL;
                        break;
                    case GAME_CONFIG.CELL_TYPES.BLUE_MOUSE:
                        color = GAME_CONFIG.COLORS.BLUE_MOUSE;
                        break;
                    case GAME_CONFIG.CELL_TYPES.RED_MOUSE:
                        color = GAME_CONFIG.COLORS.RED_MOUSE;
                        break;
                }

                this.cellGraphics[row][col].setFillStyle(color);
            }
        }
    }

    createColumnControls() {
        const controlsContainer = document.getElementById('column-controls');
        controlsContainer.innerHTML = '';

        for (let col = 0; col < GAME_CONFIG.GRID_WIDTH; col++) {
            const columnDiv = document.createElement('div');
            columnDiv.className = 'column-control';

            const upButton = document.createElement('button');
            upButton.className = 'column-btn';
            upButton.id = `up-${col}`;
            upButton.textContent = '↑';
            upButton.onclick = () => this.handleColumnMove(col, 1);

            const colNumber = document.createElement('div');
            colNumber.className = 'column-number';
            colNumber.textContent = col + 1;

            const downButton = document.createElement('button');
            downButton.className = 'column-btn';
            downButton.id = `down-${col}`;
            downButton.textContent = '↓';
            downButton.onclick = () => this.handleColumnMove(col, -1);

            columnDiv.appendChild(upButton);
            columnDiv.appendChild(colNumber);
            columnDiv.appendChild(downButton);
            controlsContainer.appendChild(columnDiv);
        }
    }

    handleColumnMove(col, direction) {
        if (this.gameLogic.makeMove(col, direction)) {
            this.updateGridDisplay();
        }
    }
}