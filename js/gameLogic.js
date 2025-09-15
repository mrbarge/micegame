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

    async makeMove(col, direction) {
        const validColumns = this.gameBoard.getValidColumns(this.currentPlayer);

        if (!validColumns.includes(col)) {
            console.log(`Column ${col} is not valid for ${this.currentPlayer}`);
            return false;
        }

        // Disable all buttons during move processing
        this.setButtonsEnabled(false);

        this.gameBoard.moveColumn(col, direction);

        // Update display after column move
        if (window.gameScene) {
            window.gameScene.updateGridDisplay();
        }

        await this.processMiceMovement();
        this.switchPlayer();

        // Re-enable buttons after move is complete
        this.setButtonsEnabled(true);
        return true;
    }

    async processMiceMovement() {
        // Process current player's mice first
        await this.moveMiceForPlayer(this.currentPlayer);

        // Then process other player's mice
        const otherPlayer = this.currentPlayer === GAME_CONFIG.PLAYERS.BLUE ?
            GAME_CONFIG.PLAYERS.RED : GAME_CONFIG.PLAYERS.BLUE;
        await this.moveMiceForPlayer(otherPlayer);
    }

    async moveMiceForPlayer(player) {
        const micePositions = player === GAME_CONFIG.PLAYERS.BLUE ?
            this.gameBoard.blueMicePositions : this.gameBoard.redMicePositions;
        const mouseType = player === GAME_CONFIG.PLAYERS.BLUE ?
            GAME_CONFIG.CELL_TYPES.BLUE_MOUSE : GAME_CONFIG.CELL_TYPES.RED_MOUSE;
        const targetDirection = player === GAME_CONFIG.PLAYERS.BLUE ? 1 : -1; // Blue goes right, Red goes left

        // Sort mice by distance to goal (closest first)
        const sortedMice = [...micePositions].map((mouse, index) => ({ mouse, index }))
            .sort((a, b) => {
                const distanceA = player === GAME_CONFIG.PLAYERS.BLUE ?
                    (GAME_CONFIG.GRID_WIDTH - 1 - a.mouse.col) : a.mouse.col;
                const distanceB = player === GAME_CONFIG.PLAYERS.BLUE ?
                    (GAME_CONFIG.GRID_WIDTH - 1 - b.mouse.col) : b.mouse.col;
                return distanceA - distanceB;
            });

        // Process each mouse in order
        for (let i = 0; i < sortedMice.length; i++) {
            const { mouse, index } = sortedMice[i];
            let moved = true;

            // Keep moving until no more movement is possible
            while (moved) {
                moved = false;
                let newRow = mouse.row;
                let newCol = mouse.col;

                // Try to move down first
                if (mouse.row + 1 < GAME_CONFIG.GRID_HEIGHT &&
                    this.gameBoard.isEmpty(mouse.row + 1, mouse.col) &&
                    !this.isCellOccupiedByMouse(mouse.row + 1, mouse.col)) {

                    newRow = mouse.row + 1;
                    moved = true;
                }
                // Try to move horizontally toward goal
                else {
                    const testCol = mouse.col + targetDirection;
                    if (testCol >= 0 && testCol < GAME_CONFIG.GRID_WIDTH &&
                        this.gameBoard.isEmpty(mouse.row, testCol) &&
                        !this.isCellOccupiedByMouse(mouse.row, testCol)) {

                        newCol = testCol;
                        moved = true;
                    }
                }

                if (moved) {
                    // Update grid
                    this.gameBoard.grid[mouse.row][mouse.col] = GAME_CONFIG.CELL_TYPES.EMPTY;
                    this.gameBoard.grid[newRow][newCol] = mouseType;

                    // Animate the movement
                    if (window.gameScene) {
                        await window.gameScene.animateMouseMovement(mouse.row, mouse.col, newRow, newCol, mouseType);
                    }

                    // Update mouse position
                    mouse.row = newRow;
                    mouse.col = newCol;

                    // Check if mouse reached the goal
                    if ((player === GAME_CONFIG.PLAYERS.BLUE && mouse.col === GAME_CONFIG.GRID_WIDTH - 1) ||
                        (player === GAME_CONFIG.PLAYERS.RED && mouse.col === 0)) {

                        this.scorePoint(player);
                        this.removeMouse(player, index);

                        // Remove this mouse from the sorted list
                        const mouseIndex = sortedMice.findIndex(item => item.index === index);
                        if (mouseIndex !== -1) {
                            sortedMice.splice(mouseIndex, 1);
                            i--; // Adjust loop index
                        }
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

    setButtonsEnabled(enabled) {
        for (let col = 0; col < GAME_CONFIG.GRID_WIDTH; col++) {
            const upBtn = document.getElementById(`up-${col}`);
            const downBtn = document.getElementById(`down-${col}`);

            if (upBtn && downBtn) {
                if (!enabled) {
                    // Disable all buttons during animations
                    upBtn.disabled = true;
                    downBtn.disabled = true;
                } else {
                    // Re-enable based on current player's valid columns
                    this.updateColumnButtons();
                }
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