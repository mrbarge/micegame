import { GAME_CONFIG } from './gameConfig.js';

export class GameBoard {
    constructor() {
        this.grid = [];
        this.blueMicePositions = [];
        this.redMicePositions = [];
        this.initializeGrid();
        this.placeMice();
    }

    initializeGrid() {
        // Initialize empty grid
        this.grid = Array(GAME_CONFIG.GRID_HEIGHT).fill().map(() =>
            Array(GAME_CONFIG.GRID_WIDTH).fill(GAME_CONFIG.CELL_TYPES.EMPTY)
        );

        // Place walls in each column
        for (let col = 0; col < GAME_CONFIG.GRID_WIDTH; col++) {
            this.generateWallsForColumn(col);
        }
    }

    generateWallsForColumn(col) {
        const numWalls = Math.floor(Math.random() *
                (GAME_CONFIG.MAX_WALLS_PER_COLUMN - GAME_CONFIG.MIN_WALLS_PER_COLUMN + 1)) +
            GAME_CONFIG.MIN_WALLS_PER_COLUMN;

        const wallPositions = [];
        while (wallPositions.length < numWalls) {
            const row = Math.floor(Math.random() * GAME_CONFIG.GRID_HEIGHT);
            if (!wallPositions.includes(row)) {
                wallPositions.push(row);
            }
        }

        wallPositions.forEach(row => {
            this.grid[row][col] = GAME_CONFIG.CELL_TYPES.WALL;
        });
    }

    placeMice() {
        // Place blue mice in left columns
        this.placeMiceForPlayer(GAME_CONFIG.PLAYERS.BLUE, GAME_CONFIG.BLUE_COLUMNS);
        // Place red mice in right columns
        this.placeMiceForPlayer(GAME_CONFIG.PLAYERS.RED, GAME_CONFIG.RED_COLUMNS);
    }

    placeMiceForPlayer(player, availableColumns) {
        const micePositions = player === GAME_CONFIG.PLAYERS.BLUE ? this.blueMicePositions : this.redMicePositions;
        const mouseType = player === GAME_CONFIG.PLAYERS.BLUE ? GAME_CONFIG.CELL_TYPES.BLUE_MOUSE : GAME_CONFIG.CELL_TYPES.RED_MOUSE;

        for (let i = 0; i < GAME_CONFIG.MICE_PER_PLAYER; i++) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 100) {
                const col = availableColumns[Math.floor(Math.random() * availableColumns.length)];

                // Find the highest wall or mouse in this column
                let surfaceRow = GAME_CONFIG.GRID_HEIGHT - 1;
                for (let row = 0; row < GAME_CONFIG.GRID_HEIGHT; row++) {
                    if (this.grid[row][col] === GAME_CONFIG.CELL_TYPES.WALL ||
                        this.grid[row][col] === GAME_CONFIG.CELL_TYPES.BLUE_MOUSE ||
                        this.grid[row][col] === GAME_CONFIG.CELL_TYPES.RED_MOUSE) {
                        surfaceRow = row - 1;
                        break;
                    }
                }

                if (surfaceRow >= 0) {
                    this.grid[surfaceRow][col] = mouseType;
                    micePositions.push({ row: surfaceRow, col: col });
                    placed = true;
                }
                attempts++;
            }
        }
    }

    moveColumn(col, direction) {
        // direction: 1 for up, -1 for down
        const column = [];

        // Extract the column
        for (let row = 0; row < GAME_CONFIG.GRID_HEIGHT; row++) {
            column.push(this.grid[row][col]);
        }

        // Shift the column
        if (direction === 1) { // Move up
            const top = column.shift();
            column.push(top);
        } else { // Move down
            const bottom = column.pop();
            column.unshift(bottom);
        }

        // Put the column back
        for (let row = 0; row < GAME_CONFIG.GRID_HEIGHT; row++) {
            this.grid[row][col] = column[row];
        }

        // Update mice positions
        this.updateMicePositions();
    }

    updateMicePositions() {
        this.blueMicePositions = [];
        this.redMicePositions = [];

        for (let row = 0; row < GAME_CONFIG.GRID_HEIGHT; row++) {
            for (let col = 0; col < GAME_CONFIG.GRID_WIDTH; col++) {
                if (this.grid[row][col] === GAME_CONFIG.CELL_TYPES.BLUE_MOUSE) {
                    this.blueMicePositions.push({ row, col });
                } else if (this.grid[row][col] === GAME_CONFIG.CELL_TYPES.RED_MOUSE) {
                    this.redMicePositions.push({ row, col });
                }
            }
        }
    }

    getValidColumns(player) {
        const micePositions = player === GAME_CONFIG.PLAYERS.BLUE ? this.blueMicePositions : this.redMicePositions;
        const validColumns = new Set();

        micePositions.forEach(pos => {
            validColumns.add(pos.col);
        });

        return Array.from(validColumns).sort((a, b) => a - b);
    }

    getCellType(row, col) {
        if (row < 0 || row >= GAME_CONFIG.GRID_HEIGHT || col < 0 || col >= GAME_CONFIG.GRID_WIDTH) {
            return null;
        }
        return this.grid[row][col];
    }

    isEmpty(row, col) {
        return this.getCellType(row, col) === GAME_CONFIG.CELL_TYPES.EMPTY;
    }
}