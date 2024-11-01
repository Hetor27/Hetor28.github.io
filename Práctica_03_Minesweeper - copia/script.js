let board, rows, cols, cellsRevealed, firstMove;

function initGame(rowsInput, colsInput, minePercentage = 0.15, numMines = null) {
  rows = rowsInput;
  cols = colsInput;
  cellsRevealed = 0;
  firstMove = true;  
  board = [];
  document.getElementById("message").innerText = "";
  document.getElementById("game-board").innerHTML = "";
  document.getElementById("game-board").style.gridTemplateColumns = `repeat(${cols}, 30px)`;

  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < cols; j++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.onclick = () => revealCell(i, j);
      cell.oncontextmenu = (e) => {
        e.preventDefault();
        toggleFlag(i, j);
      };
      document.getElementById("game-board").appendChild(cell);
      board[i][j] = { mine: false, revealed: false, flagged: false, element: cell };
    }
  }
    totalMines = numMines || Math.floor(rows * cols * minePercentage);
    placeMines(rows, cols, totalMines);
  }

function setDifficulty() {
  const difficulty = document.getElementById("difficulty").value;
  document.getElementById("custom-settings").style.display = difficulty === "custom" ? "block" : "none";
  switch (difficulty) {
    case "easy":
      initGame(9, 9, 0.1);
      break;
    case "medium":
      initGame(16, 16, 0.15);
      break;
    case "hard":
      initGame(30, 16, 0.2);
      break;
    case "veryHard":
      initGame(30, 24, 0.25);
      break;
    case "hardcore":
      initGame(30, 30, 0.3);
      break;
    case "legend":
      initGame(30, 30, 0.35);
      break;
  }
}

function startCustomGame() {
  const customRows = parseInt(document.getElementById("custom-rows").value);
  const customCols = parseInt(document.getElementById("custom-cols").value);
  const customMines = parseInt(document.getElementById("custom-mines").value);
  const maxMines = customRows * customCols - 1;

  if (customRows < 5 || customRows > 30 || customCols < 5 || customCols > 30) {
    document.getElementById("message").innerText = "El tamaño debe estar entre 5x5 y 30x30.";
  } else if (customMines < 1 || customMines > maxMines) {
    document.getElementById("message").innerText = `Número de minas inválido. Máximo permitido: ${maxMines}.`;
  } else {
    initGame(customRows, customCols, 0, customMines);
  }
}

function placeMines(rows, cols, numMines, safeRow = null, safeCol = null) {
  let minesPlaced = 0;
  while (minesPlaced < numMines) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);
    if (!board[row][col].mine && (row !== safeRow || col !== safeCol)) {
      board[row][col].mine = true;
      minesPlaced++;
    }
  }
}


function revealCell(row, col) {
  const cell = board[row][col];
  if (cell.revealed || cell.flagged) return;

  if (firstMove) {
    firstMove = false;
    if (cell.mine) {
      resetMines(row, col);
    }
  }

  cell.revealed = true;
  cellsRevealed++;
  cell.element.classList.add("revealed");

  if (cell.mine) {
    cell.element.textContent = "💣";
    cell.element.classList.add("mine");
    document.getElementById("message").innerText = "¡Juego Terminado!";
    revealAllMines();
    return;
  }

  const minesCount = countMines(row, col);
  if (minesCount > 0) {
    cell.element.textContent = minesCount;
  } else {
    revealAdjacentCells(row, col, new Set());
  }

  checkWin();
}

function resetMines(safeRow, safeCol) {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      board[i][j].mine = false;
    }
  }
  placeMines(rows, cols, totalMines, safeRow, safeCol);
}

function countMines(row, col) {
  let count = 0;
  for (let i = row - 1; i <= row + 1; i++) {
    for (let j = col - 1; j <= col + 1; j++) {
      if (i >= 0 && i < rows && j >= 0 && j < cols && board[i][j].mine) {
        count++;
      }
    }
  }
  return count;
}

function revealAdjacentCells(row, col, visited, maxReveals = 50) {
  const cellKey = `${row},${col}`;
  if (visited.has(cellKey) || visited.size >= maxReveals) return; 
  visited.add(cellKey);

  for (let i = row - 1; i <= row + 1; i++) {
    for (let j = col - 1; j <= col + 1; j++) {
      if (i >= 0 && i < rows && j >= 0 && j < cols) {
        const adjacentCell = board[i][j];
        
        if (!adjacentCell.revealed && !adjacentCell.flagged) {
          adjacentCell.revealed = true;
          cellsRevealed++;
          adjacentCell.element.classList.add("revealed");

          const minesAround = countMines(i, j);
          if (minesAround > 0) {
            adjacentCell.element.innerText = minesAround;
          } else if (visited.size < maxReveals) {
            revealAdjacentCells(i, j, visited, maxReveals); 
          }
        }
      }
    }
  }
}

function checkWin() {
  const cellsToReveal = rows * cols - totalMines;

  if (cellsRevealed === cellsToReveal) {
    document.getElementById("message").innerText = "¡Felicidades, ganaste!";
    revealAllMines();
  }
}

function toggleFlag(row, col) {
  const cell = board[row][col];
  if (!cell.revealed) {
    cell.flagged = !cell.flagged;
    cell.element.textContent = cell.flagged ? "🚩" : ""; 
    cell.element.classList.toggle("flagged", cell.flagged);
  }
}

function revealAllMines() {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (board[i][j].mine && !board[i][j].element.textContent) {
        board[i][j].element.textContent = "💣";
        board[i][j].element.classList.add("mine");
      }
    }
  }
}
setDifficulty();
