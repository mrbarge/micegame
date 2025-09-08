// Game constants and configuration
export const GAME_CONFIG = {
    GRID_WIDTH: 19,
    GRID_HEIGHT: 13,
    MICE_PER_PLAYER: 12,
    MIN_WALLS_PER_COLUMN: 5,
    MAX_WALLS_PER_COLUMN: 8,
    CELL_SIZE: 32,
    BLUE_COLUMNS: [0, 1, 2, 3, 4, 5, 6, 7, 8], // Left 9 columns
    RED_COLUMNS: [10, 11, 12, 13, 14, 15, 16, 17, 18], // Right 9 columns
    COLORS: {
        WALL: 0x34495e,
        EMPTY: 0x2c3e50,
        BLUE_MOUSE: 0x3498db,
        RED_MOUSE: 0xe74c3c,
        GRID_LINE: 0x7f8c8d,
        HIGHLIGHT: 0xf39c12
    },
    CELL_TYPES: {
        EMPTY: 0,
        WALL: 1,
        BLUE_MOUSE: 2,
        RED_MOUSE: 3
    },
    PLAYERS: {
        BLUE: 'blue',
        RED: 'red'
    }
};