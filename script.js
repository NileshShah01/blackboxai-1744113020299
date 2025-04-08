// Initialize chess game and AI
const chess = new Chess();
const stockfish = new Worker('stockfish.js');
let aiLevel = 5; // Default difficulty
let isPlayerTurn = true;
let soundEnabled = true;
let selectedSquare = null;
let validMoves = [];

// Sound effects with fallback
const sounds = {
    move: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3'),
    capture: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3'),
    check: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3'),
    gameEnd: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3')
};

// DOM elements
const board = document.getElementById('board');
const status = document.getElementById('status');
const undoBtn = document.getElementById('undo');
const resetBtn = document.getElementById('reset');
const suggestBtn = document.getElementById('suggest');
const moveHistory = document.getElementById('move-history');
const tutorialModal = document.getElementById('tutorial-modal');
const helpBtn = document.getElementById('help-btn');
const closeTutorialBtn = document.getElementById('close-tutorial');
const themeToggle = document.getElementById('theme-toggle');
const soundToggle = document.getElementById('sound-toggle');
const aiLevelSelect = document.getElementById('ai-level');

// Load settings from localStorage
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('chessSettings')) || {};
    aiLevel = settings.difficulty || 5;
    soundEnabled = settings.sound !== false;
    const theme = settings.theme || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    soundToggle.checked = soundEnabled;
    aiLevelSelect.value = aiLevel;
}

// Save settings to localStorage
function saveSettings() {
    const settings = {
        difficulty: parseInt(aiLevelSelect.value),
        sound: soundToggle.checked,
        theme: document.documentElement.getAttribute('data-theme')
    };
    localStorage.setItem('chessSettings', JSON.stringify(settings));
}

// Initialize the board with enhanced visuals
function drawBoard() {
    board.innerHTML = '';
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

    // Clear previous valid move indicators
    validMoves = [];

    ranks.forEach(rank => {
        files.forEach(file => {
            const square = `${file}${rank}`;
            const piece = chess.get(square);
            const squareEl = document.createElement('div');
            squareEl.className = `w-full h-24 flex items-center justify-center relative 
                ${(rank + file.charCodeAt(0)) % 2 === 0 ? 'square-light' : 'square-dark'}`;
            squareEl.dataset.square = square;

            if (piece) {
                const pieceEl = document.createElement('div');
                pieceEl.className = 'piece text-4xl cursor-pointer';
                pieceEl.innerHTML = getPieceSymbol(piece);
                pieceEl.dataset.piece = piece.type;
                pieceEl.dataset.color = piece.color;
                
                if (selectedSquare === square) {
                    pieceEl.classList.add('selected');
                }
                
                squareEl.appendChild(pieceEl);
            }

            // Highlight valid moves
            if (selectedSquare) {
                const move = chess.move({
                    from: selectedSquare,
                    to: square,
                    promotion: 'q'
                });
                if (move) {
                    chess.undo();
                    squareEl.classList.add('valid-move');
                    validMoves.push(square);
                }
            }

            squareEl.addEventListener('click', handleSquareClick);
            board.appendChild(squareEl);
        });
    });

    updateStatus();
    updateMoveHistory();
}

// Get chess piece symbols with better visuals
function getPieceSymbol(piece) {
    const symbols = {
        p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚',
        P: '♙', N: '♘', B: '♗', R: '♖', Q: '♕', K: '♔'
    };
    return symbols[piece.color === 'w' ? piece.type.toUpperCase() : piece.type];
}

// Handle square clicks
let selectedSquare = null;
function handleSquareClick(e) {
    if (!isPlayerTurn) return;

    const square = e.currentTarget.dataset.square;
    const piece = chess.get(square);

    if (selectedSquare) {
        // Try to make move
        const move = {
            from: selectedSquare,
            to: square,
            promotion: 'q' // Always promote to queen for simplicity
        };

        if (chess.move(move)) {
            // Play appropriate sound
            if (soundEnabled) {
                if (chess.in_checkmate() || chess.in_draw()) {
                    sounds.gameEnd.play();
                } else if (chess.in_check()) {
                    sounds.check.play();
                } else if (move.captured) {
                    sounds.capture.play();
                } else {
                    sounds.move.play();
                }
            }
            
            isPlayerTurn = false;
            drawBoard();
            setTimeout(makeAiMove, 1000); // AI moves after 1 second
        }
        selectedSquare = null;
    } else if (piece && piece.color === chess.turn()) {
        selectedSquare = square;
    }
}

// AI makes a move
function makeAiMove() {
    stockfish.postMessage(`setoption name Skill Level value ${aiLevel}`);
    stockfish.postMessage('position fen ' + chess.fen());
    stockfish.postMessage('go depth 12');

    stockfish.onmessage = function(e) {
        if (e.data.startsWith('bestmove')) {
            const move = e.data.split(' ')[1];
            if (move && move !== '(none)') {
                chess.move({ from: move.substring(0, 2), to: move.substring(2, 4) });
                isPlayerTurn = true;
                drawBoard();
            }
        }
    };
}

// Update game status
function updateStatus() {
    let statusText = '';
    if (chess.in_checkmate()) {
        statusText = `Checkmate! ${chess.turn() === 'w' ? 'Black' : 'White'} wins!`;
    } else if (chess.in_draw()) {
        statusText = 'Game ended in draw!';
    } else {
        statusText = `${chess.turn() === 'w' ? 'White' : 'Black'}'s turn`;
        if (chess.in_check()) {
            statusText += ' (Check!)';
        }
    }
    status.textContent = statusText;
}

// Button event listeners
undoBtn.addEventListener('click', () => {
    chess.undo();
    drawBoard();
});

resetBtn.addEventListener('click', () => {
    chess.reset();
    isPlayerTurn = true;
    drawBoard();
});

suggestBtn.addEventListener('click', () => {
    stockfish.postMessage('position fen ' + chess.fen());
    stockfish.postMessage('go depth 12');
    
    stockfish.onmessage = function(e) {
        if (e.data.startsWith('bestmove')) {
            const move = e.data.split(' ')[1];
            if (move && move !== '(none)') {
                status.textContent = `AI suggests: ${move}`;
            }
        }
    };
});

// Initialize the game
loadSettings();
drawBoard();

// Load sound generator script
function loadSoundFiles() {
    const script = document.createElement('script');
    script.src = 'assets/sounds/move.mp3.js';
    document.head.appendChild(script);
}

loadSoundFiles();
