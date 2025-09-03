let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;
let gameMode = "pvp"; // "pvp" yoki "ai"
let difficulty = "easy"; // "easy", "medium", "hard"

let stats = {
    xWins: 0,
    oWins: 0,
    draws: 0
};

// Local Storage’dan statistikani yuklash
if (localStorage.getItem("xoStats")) {
    stats = JSON.parse(localStorage.getItem("xoStats"));
    updateStats();
}

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function setGameMode(mode) {
    gameMode = mode;
    document.querySelectorAll(".mode-btn").forEach(btn => btn.classList.remove("active"));
    event.target.classList.add("active");

    if (mode === "ai") {
        document.getElementById("difficulty-section").style.display = "block";
    } else {
        document.getElementById("difficulty-section").style.display = "none";
    }
    resetGame();
}

function setDifficulty(level) {
    difficulty = level;
    document.querySelectorAll(".difficulty-btn").forEach(btn => btn.classList.remove("active"));
    event.target.classList.add("active");
    resetGame();
}

function makeMove(index) {
    if (!gameActive || board[index] !== "") return;

    board[index] = currentPlayer;
    const cell = document.querySelectorAll(".cell")[index];
    cell.textContent = currentPlayer;
    cell.classList.add("taken", currentPlayer.toLowerCase());

    if (checkWinner()) {
        document.getElementById("game-status").textContent = `🎉 ${currentPlayer} g'alaba qozondi!`;
        document.getElementById("result").textContent = `🎉 ${currentPlayer} yutdi!`;
        document.getElementById("result").style.display = "block";
        updateStatsWin(currentPlayer);
        gameActive = false;
        return;
    }

    if (!board.includes("")) {
        document.getElementById("game-status").textContent = "🤝 Durrang!";
        document.getElementById("result").textContent = "🤝 O'yin durrang!";
        document.getElementById("result").style.display = "block";
        stats.draws++;
        saveStats();
        updateStats();
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    document.getElementById("current-player").textContent = `Navbat: ${currentPlayer}`;

    // Agar AI rejimi bo‘lsa va O navbatda bo‘lsa
    if (gameMode === "ai" && currentPlayer === "O" && gameActive) {
        setTimeout(aiMove, 500);
    }
}

function aiMove() {
    let move;
    if (difficulty === "easy") {
        move = getRandomMove();
    } else if (difficulty === "medium") {
        move = Math.random() > 0.5 ? getBestMove() : getRandomMove();
    } else {
        move = getBestMove();
    }
    makeMove(move);
}

function getRandomMove() {
    let availableMoves = board.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function getBestMove() {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = "O";
            let score = minimax(board, 0, false);
            board[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(newBoard, depth, isMaximizing) {
    let winner = getWinner();
    if (winner === "O") return 10 - depth;
    if (winner === "X") return depth - 10;
    if (!newBoard.includes("")) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (newBoard[i] === "") {
                newBoard[i] = "O";
                let score = minimax(newBoard, depth + 1, false);
                newBoard[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (newBoard[i] === "") {
                newBoard[i] = "X";
                let score = minimax(newBoard, depth + 1, true);
                newBoard[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinner() {
    for (let combo of winningCombinations) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            document.querySelectorAll(".cell")[a].classList.add("winning");
            document.querySelectorAll(".cell")[b].classList.add("winning");
            document.querySelectorAll(".cell")[c].classList.add("winning");
            return true;
        }
    }
    return false;
}

function getWinner() {
    for (let combo of winningCombinations) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

function updateStatsWin(winner) {
    if (winner === "X") stats.xWins++;
    else stats.oWins++;
    saveStats();
    updateStats();
}

function saveStats() {
    localStorage.setItem("xoStats", JSON.stringify(stats));
}

function updateStats() {
    document.getElementById("x-wins").textContent = stats.xWins;
    document.getElementById("o-wins").textContent = stats.oWins;
    document.getElementById("draws").textContent = stats.draws;
}

function resetGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    gameActive = true;
    document.querySelectorAll(".cell").forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("taken", "x", "o", "winning");
    });
    document.getElementById("game-status").textContent = "O'yin boshlandi!";
    document.getElementById("current-player").textContent = "Navbat: X";
    document.getElementById("result").style.display = "none";
}

function resetStats() {
    stats = { xWins: 0, oWins: 0, draws: 0 };
    saveStats();
    updateStats();
}

function showHelp() {
    document.getElementById("help-modal").style.display = "flex";
}

function hideHelp() {
    document.getElementById("help-modal").style.display = "none";
}

// Klaviatura boshqaruvi
document.addEventListener("keydown", function(e) {
    if (!gameActive) return;

    const key = e.key;
    if (key >= "1" && key <= "9") {
        makeMove(parseInt(key) - 1);
    } else if (key === "r" || key === "R") {
        resetGame();
    } else if (key === "Escape") {
        hideHelp();
    }
});