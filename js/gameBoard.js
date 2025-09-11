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

        // First, collect all valid positions across all available columns
        const validPositions = [];

        for (const col of availableColumns) {
            // Find all valid positions in this column (stacking upward from surfaces)
            const columnPositions = this.getValidPositionsInColumn(col);
            columnPositions.forEach(row => {
                validPositions.push({ row, col });
            });
        }

        // Shuffle the valid positions to randomize placement
        for (let i = validPositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [validPositions[i], validPositions[j]] = [validPositions[j], validPositions[i]];
        }

        // Place mice in the first 12 valid positions
        let placedCount = 0;
        for (let i = 0; i < validPositions.length && placedCount < GAME_CONFIG.MICE_PER_PLAYER; i++) {
            const pos = validPositions[i];

            // Double-check the position is still empty (in case of overlapping placements)
            if (this.grid[pos.row][pos.col] === GAME_CONFIG.CELL_TYPES.EMPTY) {
                this.grid[pos.row][pos.col] = mouseType;
                micePositions.push({ row: pos.row, col: pos.col });
                placedCount++;
            }
        }

        // Log results for debugging
        if (placedCount < GAME_CONFIG.MICE_PER_PLAYER) {
            console.warn(`Only placed ${placedCount} out of ${GAME_CONFIG.MICE_PER_PLAYER} mice for ${player} - not enough valid positions`);
        } else {
            console.log(`Successfully placed ${placedCount} mice for ${player}`);
        }
    }

    getValidPositionsInColumn(col) {
        const positions = [];

        // Start from the bottom and work up, finding surfaces to place mice on
        let currentSurfaceRow = GAME_CONFIG.GRID_HEIGHT - 1;

        // Check each row from bottom to top
        for (let row = GAME_CONFIG.GRID_HEIGHT - 1; row >= 0; row--) {
            if (this.grid[row][col] === GAME_CONFIG.CELL_TYPES.WALL) {
                // Found a wall, mice can be placed above it
                currentSurfaceRow = row - 1;

                // Add valid positions above this wall (stacking upward)
                let stackRow = currentSurfaceRow;
                while (stackRow >= 0) {
                    positions.push(stackRow);
                    stackRow--;
                }
                break; // Stop at first wall found from bottom
            }
        }

        // If no walls found in column, mice can be placed from bottom up
        if (positions.length === 0) {
            for (let row = GAME_CONFIG.GRID_HEIGHT - 1; row >= 0; row--) {
                positions.push(row);
            }
        }

        return positions;
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

    // Method to count mice on the board for verification
    countMice() {
        const counts = {
            blue: 0,
            red: 0
        };

        for (let row = 0; row < GAME_CONFIG.GRID_HEIGHT; row++) {
            for (let col = 0; col < GAME_CONFIG.GRID_WIDTH; col++) {
                if (this.grid[row][col] === GAME_CONFIG.CELL_TYPES.BLUE_MOUSE) {
                    counts.blue++;
                } else if (this.grid[row][col] === GAME_CONFIG.CELL_TYPES.RED_MOUSE) {
                    counts.red++;
                }
            }
        }

        console.log(`Mice on board - Blue: ${counts.blue}, Red: ${counts.red}`);
        return counts;
    }
}