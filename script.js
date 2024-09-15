const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const restartButton = document.getElementById('restart-button');
const gameContainer = document.getElementById('game-container');
const difficultySelect = document.getElementById('difficulty');

// إضافة الأصوات
const clickSound = document.getElementById('click-sound');
const winSound = document.getElementById('win-sound');
const loseSound = document.getElementById('lose-sound');
const drawSound = document.getElementById('draw-sound');

let currentPlayer = 'X'; // اللاعب البشري
let gameActive = true;
let gameState = ["", "", "", "", "", "", "", "", ""];
let aiLevel = 1; // مستوى ذكاء الاصطناعي
let difficulty = 'easy'; // مستوى الصعوبة الافتراضي

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// تغيير مستوى الصعوبة عند الاختيار
difficultySelect.addEventListener('change', (event) => {
    difficulty = event.target.value;
});

function handleCellClick(clickedCell, clickedCellIndex) {
    if (gameState[clickedCellIndex] !== "" || !gameActive || currentPlayer === 'O') {
        return;
    }

    // تشغيل صوت النقر
    clickSound.play();

    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer); // إضافة الفئة المناسبة

    checkResult();

    // إذا كان اللاعب هو "X"، دع الذكاء الاصطناعي يلعب بعد ذلك
    if (gameActive) {
        currentPlayer = 'O'; // تغيير الدور إلى الذكاء الاصطناعي
        setTimeout(aiPlay, 500); // تأخير الذكاء الاصطناعي قليلاً
    }
}

function aiPlay() {
    const availableCells = gameState.map((cell, index) => cell === "" ? index : null).filter(index => index !== null);
    
    let bestMove;

    if (difficulty === 'easy') {
        // اختيار خلية عشوائية من الخلايا المتاحة
        bestMove = availableCells[Math.floor(Math.random() * availableCells.length)];
    } else {
        // استخدام خوارزمية Minimax
        let bestScore = -Infinity;

        for (let index of availableCells) {
            gameState[index] = 'O'; // الذكاء الاصطناعي يلعب
            let score = minimax(gameState, 0, false);
            gameState[index] = ""; // إعادة الحالة
            if (score > bestScore) {
                bestScore = score;
                bestMove = index;
            }
        }
    }

    // تحديث الحالة
    gameState[bestMove] = currentPlayer;
    const clickedCell = cells[bestMove];
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer); // إضافة الفئة المناسبة

    // تشغيل صوت النقر
    clickSound.play();

    checkResult();

    // إذا كان اللاعب هو "O"، دع اللاعب البشري يلعب بعد ذلك
    if (gameActive) {
        currentPlayer = 'X'; // تغيير الدور إلى اللاعب البشري
        statusDisplay.textContent = `It's ${currentPlayer}'s turn`;
    }
}

function minimax(state, depth, isMaximizing) {
    const scores = {
        X: -1,
        O: 1,
        draw: 0
    };

    let result = checkWinner(state);
    if (result !== null) {
        return scores[result];
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < state.length; i++) {
            if (state[i] === "") {
                state[i] = 'O'; // الذكاء الاصطناعي يلعب
                let score = minimax(state, depth + 1, false);
                state[i] = ""; // إعادة الحالة
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < state.length; i++) {
            if (state[i] === "") {
                state[i] = 'X'; // اللاعب البشري يلعب
                let score = minimax(state, depth + 1, true);
                state[i] = ""; // إعادة الحالة
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinner(state) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (state[a] && state[a] === state[b] && state[a] === state[c]) {
            return state[a]; // إرجاع الفائز
        }
    }
    if (state.includes("")) {
        return null; // اللعبة مستمرة
    }
    return 'draw'; // تعادل
}

function checkResult() {
    let roundWon = false;

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameState[a] === "" || gameState[b] === "" || gameState[c] === "") {
            continue;
        }
        if (gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            roundWon = true;
            drawWinningLine(winningConditions[i]);
            break;
        }
    }

    if (roundWon) {
        if (currentPlayer === 'X') {
            // إذا فاز اللاعب البشري
            statusDisplay.textContent = `Player ${currentPlayer} has won! 🎉`;
            launchFireworks(); // إطلاق الألعاب النارية
            winSound.play(); // تشغيل صوت الفوز
        } else {
            // إذا فاز الذكاء الاصطناعي
            statusDisplay.textContent = `Player ${currentPlayer} has won! 😢`;
            gameContainer.style.backgroundColor = 'red'; // تغيير لون الخلفية إلى الأحمر
            loseSound.play(); // تشغيل صوت الخسارة
            aiLevel++; // زيادة مستوى الذكاء الاصطناعي
        }
        gameActive = false;
        return;
    }

    if (!gameState.includes("")) {
        statusDisplay.textContent = "It's a draw!";
        drawSound.play(); // تشغيل صوت التعادل
        gameActive = false;
        return;
    }

    // تغيير الدور
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.textContent = `It's ${currentPlayer}'s turn`;
}

function drawWinningLine(winningCondition) {
    const [a, b, c] = winningCondition;

    if (a === 0 && b === 1 && c === 2) {
        // خط أفقي
        const line = document.createElement('div');
        line.classList.add('line', 'horizontal');
        line.style.top = '40%'; // تعديل موضع الخط
        gameContainer.appendChild(line);
    } else if (a === 3 && b === 4 && c === 5) {
        // خط أفقي
        const line = document.createElement('div');
        line.classList.add('line', 'horizontal');
        line.style.top = '40%'; // تعديل موضع الخط
        gameContainer.appendChild(line);
    } else if (a === 6 && b === 7 && c === 8) {
        // خط أفقي
        const line = document.createElement('div');
        line.classList.add('line', 'horizontal');
        line.style.top = '40%'; // تعديل موضع الخط
        gameContainer.appendChild(line);
    } else if (a === 0 && b === 3 && c === 6) {
        // خط عمودي
        const line = document.createElement('div');
        line.classList.add('line', 'vertical');
        line.style.left = '20%'; // تعديل موضع الخط
        gameContainer.appendChild(line);
    } else if (a === 1 && b === 4 && c === 7) {
        // خط عمودي
        const line = document.createElement('div');
        line.classList.add('line', 'vertical');
        line.style.left = '20%'; // تعديل موضع الخط
        gameContainer.appendChild(line);
    } else if (a === 2 && b === 5 && c === 8) {
        // خط عمودي
        const line = document.createElement('div');
        line.classList.add('line', 'vertical');
        line.style.left = '20%'; // تعديل موضع الخط
        gameContainer.appendChild(line);
    } else if (a === 0 && b === 4 && c === 8) {
        // خط قطري
        const line = document.createElement('div');
        line.classList.add('line', 'diagonal1');
        gameContainer.appendChild(line);
    } else if (a === 2 && b === 4 && c === 6) {
        // خط قطري
        const line = document.createElement('div');
        line.classList.add('line', 'diagonal2');
        gameContainer.appendChild(line);
    }
}

function launchFireworks() {
    // إطلاق الألعاب النارية
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}

function restartGame() {
    gameActive = true;
    currentPlayer = 'X'; // اللاعب البشري يبدأ أولاً
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.textContent = `It's ${currentPlayer}'s turn`;
    gameContainer.style.backgroundColor = '#fff'; // إعادة لون الخلفية إلى الأبيض

    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove('X', 'O'); // إزالة الفئات
    });

    // إزالة أي خطوط موجودة
    const lines = document.querySelectorAll('.line');
    lines.forEach(line => line.remove());
}

cells.forEach((cell, index) => {
    cell.addEventListener('click', () => handleCellClick(cell, index));
});

restartButton.addEventListener('click', restartGame);

statusDisplay.textContent = `It's ${currentPlayer}'s turn`;