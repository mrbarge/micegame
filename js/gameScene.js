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
        // Create graphics for game pieces
        this.createWallGraphic();
        this.createMouseGraphics();
    }

    createWallGraphic() {
        // Create a brick wall pattern
        const graphics = this.add.graphics();
        graphics.fillStyle(0x8B4513); // Brown color
        graphics.fillRect(0, 0, GAME_CONFIG.CELL_SIZE - 2, GAME_CONFIG.CELL_SIZE - 2);

        // Add brick pattern
        graphics.lineStyle(1, 0x654321);
        for (let i = 0; i < GAME_CONFIG.CELL_SIZE; i += 8) {
            graphics.moveTo(0, i);
            graphics.lineTo(GAME_CONFIG.CELL_SIZE - 2, i);
        }
        for (let i = 0; i < GAME_CONFIG.CELL_SIZE; i += 12) {
            graphics.moveTo(i, 0);
            graphics.lineTo(i, GAME_CONFIG.CELL_SIZE - 2);
        }
        graphics.strokePath();

        graphics.generateTexture('wall', GAME_CONFIG.CELL_SIZE - 2, GAME_CONFIG.CELL_SIZE - 2);
        graphics.destroy();
    }

    createMouseGraphics() {
        // Create blue mouse
        const blueGraphics = this.add.graphics();
        blueGraphics.fillStyle(0x3498db);
        blueGraphics.fillCircle(GAME_CONFIG.CELL_SIZE / 2, GAME_CONFIG.CELL_SIZE / 2, 12);
        // Add ears
        blueGraphics.fillCircle(GAME_CONFIG.CELL_SIZE / 2 - 6, GAME_CONFIG.CELL_SIZE / 2 - 8, 4);
        blueGraphics.fillCircle(GAME_CONFIG.CELL_SIZE / 2 + 6, GAME_CONFIG.CELL_SIZE / 2 - 8, 4);
        // Add eyes
        blueGraphics.fillStyle(0x000000);
        blueGraphics.fillCircle(GAME_CONFIG.CELL_SIZE / 2 - 4, GAME_CONFIG.CELL_SIZE / 2 - 2, 2);
        blueGraphics.fillCircle(GAME_CONFIG.CELL_SIZE / 2 + 4, GAME_CONFIG.CELL_SIZE / 2 - 2, 2);
        blueGraphics.generateTexture('blueMouse', GAME_CONFIG.CELL_SIZE, GAME_CONFIG.CELL_SIZE);
        blueGraphics.destroy();

        // Create red mouse
        const redGraphics = this.add.graphics();
        redGraphics.fillStyle(0xe74c3c);
        redGraphics.fillCircle(GAME_CONFIG.CELL_SIZE / 2, GAME_CONFIG.CELL_SIZE / 2, 12);
        // Add ears
        redGraphics.fillCircle(GAME_CONFIG.CELL_SIZE / 2 - 6, GAME_CONFIG.CELL_SIZE / 2 - 8, 4);
        redGraphics.fillCircle(GAME_CONFIG.CELL_SIZE / 2 + 6, GAME_CONFIG.CELL_SIZE / 2 - 8, 4);
        // Add eyes
        redGraphics.fillStyle(0x000000);
        redGraphics.fillCircle(GAME_CONFIG.CELL_SIZE / 2 - 4, GAME_CONFIG.CELL_SIZE / 2 - 2, 2);
        redGraphics.fillCircle(GAME_CONFIG.CELL_SIZE / 2 + 4, GAME_CONFIG.CELL_SIZE / 2 - 2, 2);
        redGraphics.generateTexture('redMouse', GAME_CONFIG.CELL_SIZE, GAME_CONFIG.CELL_SIZE);
        redGraphics.destroy();
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
        const startY = 75;

        // Clear existing graphics
        if (this.cellGraphics) {
            this.cellGraphics.forEach(row => {
                row.forEach(cell => {
                    if (cell.sprite) cell.sprite.destroy();
                    cell.destroy();
                });
            });
        }
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
                cell.sprite = null; // Will hold the sprite for this cell

                this.cellGraphics[row][col] = cell;
            }
        }

        this.updateGridDisplay();
    }

    updateGridDisplay() {
        const startX = 50;
        const startY = 75;

        for (let row = 0; row < GAME_CONFIG.GRID_HEIGHT; row++) {
            for (let col = 0; col < GAME_CONFIG.GRID_WIDTH; col++) {
                const cellType = this.gameBoard.getCellType(row, col);
                const cell = this.cellGraphics[row][col];
                const x = startX + col * GAME_CONFIG.CELL_SIZE;
                const y = startY + row * GAME_CONFIG.CELL_SIZE;

                // Remove existing sprite if any
                if (cell.sprite) {
                    cell.sprite.destroy();
                    cell.sprite = null;
                }

                // Set background color and add sprite if needed
                switch (cellType) {
                    case GAME_CONFIG.CELL_TYPES.WALL:
                        cell.setFillStyle(GAME_CONFIG.COLORS.EMPTY);
                        cell.sprite = this.add.image(x, y, 'wall');
                        break;
                    case GAME_CONFIG.CELL_TYPES.BLUE_MOUSE:
                        cell.setFillStyle(GAME_CONFIG.COLORS.EMPTY);
                        cell.sprite = this.add.image(x, y, 'blueMouse');
                        break;
                    case GAME_CONFIG.CELL_TYPES.RED_MOUSE:
                        cell.setFillStyle(GAME_CONFIG.COLORS.EMPTY);
                        cell.sprite = this.add.image(x, y, 'redMouse');
                        break;
                    default:
                        cell.setFillStyle(GAME_CONFIG.COLORS.EMPTY);
                        break;
                }
            }
        }
    }

    createColumnControls() {
        const controlsContainer = document.getElementById('column-controls');
        controlsContainer.innerHTML = '';

        // Calculate positions based on the game configuration
        const GRID_OFFSET_X = 35; // Grid starts at x=50 in canvas
        const GRID_OFFSET_Y = 62; // Grid starts at y=50 in canvas
        const CELL_SIZE = GAME_CONFIG.CELL_SIZE;
        const GRID_HEIGHT = GAME_CONFIG.GRID_HEIGHT * CELL_SIZE;

        for (let col = 0; col < GAME_CONFIG.GRID_WIDTH; col++) {
            // Calculate the x position for this column
            // Grid cells are positioned at their center, buttons at their top-left
            const columnCenterX = GRID_OFFSET_X + (col * CELL_SIZE) + (CELL_SIZE / 2);
            const buttonX = columnCenterX - (CELL_SIZE / 2);

            // Create up button - above the grid
            const upButton = document.createElement('button');
            upButton.className = 'column-btn';
            upButton.id = `up-${col}`;
            upButton.textContent = '↑';
            upButton.style.left = `${buttonX}px`;
            upButton.style.top = `${GRID_OFFSET_Y - CELL_SIZE - 8}px`;
            upButton.onclick = () => this.handleColumnMove(col, 1);
            controlsContainer.appendChild(upButton);

            // Create down button - below the grid
            const downButton = document.createElement('button');
            downButton.className = 'column-btn';
            downButton.id = `down-${col}`;
            downButton.textContent = '↓';
            downButton.style.left = `${buttonX}px`;
            downButton.style.top = `${GRID_OFFSET_Y + GRID_HEIGHT + 8}px`;
            downButton.onclick = () => this.handleColumnMove(col, -1);
            controlsContainer.appendChild(downButton);

            // Create column number - below the down button
            const colNumber = document.createElement('div');
            colNumber.className = 'column-number';
            colNumber.textContent = col + 1;
            colNumber.style.left = `${columnCenterX - 10}px`;
            colNumber.style.top = `${GRID_OFFSET_Y + GRID_HEIGHT + CELL_SIZE + 16}px`;
            controlsContainer.appendChild(colNumber);
        }
    }

    handleColumnMove(col, direction) {
        if (this.gameLogic.makeMove(col, direction)) {
            this.updateGridDisplay();
        }
    }
}