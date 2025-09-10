import { GAME_CONFIG } from './gameConfig.js';

export class GameLogic {
    constructor(gameBoard) {
        this.gameBoard = gameBoard;
        this.currentPlayer = GAME_CONFIG.PLAYERS.BLUE;
        this.blueScore = 0;
        this.redScore = 0;
        this.selectedColumn = null;
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === GAME_CONFIG.PLAYERS.BLUE ?
            GAME_CONFIG.PLAYERS.RED : GAME_CONFIG.PLAYERS.BLUE;
        this.updateUI();
    }

    makeMove(col, direction) {
        const validColumns = this.gameBoard.getValidColumns(this.currentPlayer);

        if (!validColumns.includes(col)) {
            console.log(`Column ${col} is not valid for ${this.currentPlayer}`);
            return false;
        }

        this.gameBoard.moveColumn(col, direction);
        this.processMiceMovement();
        this.switchPlayer();
        return true;
    }

    processMiceMovement() {
        // Process current player's mice first
        this.moveMiceForPlayer(this.currentPlayer);

        // Then process other player's mice
        const otherPlayer = this.currentPlayer === GAME_CONFIG.PLAYERS.BLUE ?
            GAME_CONFIG.PLAYERS.RED : GAME_CONFIG.PLAYERS.BLUE;
        this.moveMiceForPlayer(otherPlayer);
    }

    moveMiceForPlayer(player) {
        const micePositions = player === GAME_CONFIG.PLAYERS.BLUE ?
            this.gameBoard.blueMicePositions : this.gameBoard.redMicePositions;
        const mouseType = player === GAME_CONFIG.PLAYERS.BLUE ?
            GAME_CONFIG.CELL_TYPES.BLUE_MOUSE : GAME_CONFIG.CELL_TYPES.RED_MOUSE;
        const targetDirection = player === GAME_CONFIG.PLAYERS.BLUE ? 1 : -1; // Blue goes right, Red goes left

        // Process each mouse
        for (let i = 0; i < micePositions.length; i++) {
            const mouse = micePositions[i];
            let moved = true;

            // Keep moving until no more movement is possible
            while (moved) {
                moved = false;

                // Try to move down first
                if (mouse.row + 1 < GAME_CONFIG.GRID_HEIGHT &&
                    this.gameBoard.isEmpty(mouse.row + 1, mouse.col) &&
                    !this.isCellOccupiedByMouse(mouse.row + 1, mouse.col)) {

                    this.gameBoard.grid[mouse.row][mouse.col] = GAME_CONFIG.CELL_TYPES.EMPTY;
                    mouse.row++;
                    this.gameBoard.grid[mouse.row][mouse.col] = mouseType;
                    moved = true;
                    continue;
                }

                // Try to move horizontally toward goal
                const newCol = mouse.col + targetDirection;
                if (newCol >= 0 && newCol < GAME_CONFIG.GRID_WIDTH &&
                    this.gameBoard.isEmpty(mouse.row, newCol) &&
                    !this.isCellOccupiedByMouse(mouse.row, newCol)) {

                    this.gameBoard.grid[mouse.row][mouse.col] = GAME_CONFIG.CELL_TYPES.EMPTY;
                    mouse.col = newCol;
                    this.gameBoard.grid[mouse.row][mouse.col] = mouseType;
                    moved = true;

                    // Check if mouse reached the goal
                    if ((player === GAME_CONFIG.PLAYERS.BLUE && mouse.col === GAME_CONFIG.GRID_WIDTH - 1) ||
                        (player === GAME_CONFIG.PLAYERS.RED && mouse.col === 0)) {
                        this.scorePoint(player);
                        this.removeMouse(player, i);
                        i--; // Adjust index since we removed a mouse
                        break;
                    }
                }
            }
        }
    }

    scorePoint(player) {
        if (player === GAME_CONFIG.PLAYERS.BLUE) {
            this.blueScore++;
        } else {
            this.redScore++;
        }
        this.updateScoreDisplay();
    }

    removeMouse(player, index) {
        if (player === GAME_CONFIG.PLAYERS.BLUE) {
            const mouse = this.gameBoard.blueMicePositions[index];
            this.gameBoard.grid[mouse.row][mouse.col] = GAME_CONFIG.CELL_TYPES.EMPTY;
            this.gameBoard.blueMicePositions.splice(index, 1);
        } else {
            const mouse = this.gameBoard.redMicePositions[index];
            this.gameBoard.grid[mouse.row][mouse.col] = GAME_CONFIG.CELL_TYPES.EMPTY;
            this.gameBoard.redMicePositions.splice(index, 1);
        }
    }

    updateUI() {
        const turnIndicator = document.getElementById('current-player');
        const playerText = this.currentPlayer === GAME_CONFIG.PLAYERS.BLUE ? 'Blue Player\'s Turn' : 'Red Player\'s Turn';
        turnIndicator.textContent = playerText;

        // Update column button states
        this.updateColumnButtons();
    }

    updateColumnButtons() {
        const validColumns = this.gameBoard.getValidColumns(this.currentPlayer);

        for (let col = 0; col < GAME_CONFIG.GRID_WIDTH; col++) {
            const upBtn = document.getElementById(`up-${col}`);
            const downBtn = document.getElementById(`down-${col}`);

            if (upBtn && downBtn) {
                const isValid = validColumns.includes(col);
                upBtn.disabled = !isValid;
                downBtn.disabled = !isValid;
            }
        }
    }

    updateScoreDisplay() {
        document.getElementById('blue-score').textContent = this.blueScore;
        document.getElementById('red-score').textContent = this.redScore;
    }

    isCellOccupiedByMouse(row, col) {
        const cellType = this.gameBoard.getCellType(row, col);
        return cellType === GAME_CONFIG.CELL_TYPES.BLUE_MOUSE ||
            cellType === GAME_CONFIG.CELL_TYPES.RED_MOUSE;
    }
}