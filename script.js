
        class ModernTicTacToe {
            constructor() {
                this.board = Array(9).fill('');
                this.currentPlayer = 'X';
                this.gameActive = true;
                this.vsComputer = false;
                this.scores = { X: 0, O: 0, draw: 0 };
                this.playerNames = { X: 'Joueur X', O: 'Joueur O' };
                this.timeLeft = 15;
                this.timer = null;
                this.winningCombinations = [
                    [0, 1, 2], [3, 4, 5], [6, 7, 8],
                    [0, 3, 6], [1, 4, 7], [2, 5, 8],
                    [0, 4, 8], [2, 4, 6]
                ];
                
                this.initializeElements();
                this.attachEventListeners();
                this.showPlayerModal();
                this.startTimer();
            }

            initializeElements() {
                this.boardElement = document.getElementById('board');
                this.statusElement = document.getElementById('status');
                this.timerElement = document.getElementById('timer');
                this.resetBtn = document.getElementById('reset-btn');
                this.modeToggle = document.getElementById('mode-toggle');
                this.themeToggle = document.getElementById('theme-toggle');
                this.playerModal = document.getElementById('player-modal');
                this.startGameBtn = document.getElementById('start-game');
                this.winningMessage = document.getElementById('winning-message');
                this.winningText = document.getElementById('winning-text');
                
                // Score elements
                this.xScoreElement = document.getElementById('x-score');
                this.oScoreElement = document.getElementById('o-score');
                this.drawScoreElement = document.getElementById('draw-score');
                
                // Leaderboard elements
                this.playerXName = document.getElementById('player-x-name');
                this.playerOName = document.getElementById('player-o-name');
                this.playerXLeaderboard = document.getElementById('player-x-leaderboard');
                this.playerOLeaderboard = document.getElementById('player-o-leaderboard');
            }

            attachEventListeners() {
                this.boardElement.addEventListener('click', (e) => {
                    if (e.target.classList.contains('cell')) {
                        this.handleCellClick(e.target);
                    }
                });

                this.resetBtn.addEventListener('click', () => this.resetGame());
                this.modeToggle.addEventListener('click', () => this.toggleMode());
                this.themeToggle.addEventListener('click', () => this.toggleTheme());
                this.startGameBtn.addEventListener('click', () => this.startGame());
                
                // Fermer le message de victoire en cliquant dessus
                this.winningMessage.addEventListener('click', () => {
                    this.winningMessage.style.display = 'none';
                });
            }

            showPlayerModal() {
                this.playerModal.style.display = 'flex';
            }

            startGame() {
                const playerXInput = document.getElementById('player-x').value.trim();
                const playerOInput = document.getElementById('player-o').value.trim();
                
                this.playerNames.X = playerXInput || 'Joueur X';
                this.playerNames.O = playerOInput || 'Joueur O';
                
                this.updateLeaderboardNames();
                this.playerModal.style.display = 'none';
                this.updateStatus();
            }

            updateLeaderboardNames() {
                this.playerXName.textContent = this.playerNames.X;
                this.playerOName.textContent = this.playerNames.O;
            }

            handleCellClick(cell) {
                const index = parseInt(cell.dataset.index);
                
                if (this.board[index] !== '' || !this.gameActive) return;
                
                this.makeMove(index, this.currentPlayer);
                
                if (this.vsComputer && this.gameActive && this.currentPlayer === 'O') {
                    setTimeout(() => this.makeComputerMove(), 500);
                }
            }

            makeMove(index, player) {
                this.board[index] = player;
                const cell = document.querySelector(`[data-index="${index}"]`);
                cell.classList.add(player.toLowerCase());
                
                this.resetTimer();
                
                if (this.checkWinner()) {
                    this.handleGameEnd(player);
                } else if (this.board.every(cell => cell !== '')) {
                    this.handleGameEnd('draw');
                } else {
                    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
                    this.updateStatus();
                    this.startTimer();
                }
            }

            makeComputerMove() {
                if (!this.gameActive) return;
                
                // IA Simple: essaie de gagner, puis de bloquer, sinon joue aléatoirement
                let bestMove = this.findWinningMove('O') || 
                              this.findWinningMove('X') || 
                              this.getRandomMove();
                
                if (bestMove !== null) {
                    this.makeMove(bestMove, 'O');
                }
            }

            findWinningMove(player) {
                for (let combo of this.winningCombinations) {
                    const [a, b, c] = combo;
                    const cells = [this.board[a], this.board[b], this.board[c]];
                    
                    if (cells.filter(cell => cell === player).length === 2 && 
                        cells.includes('')) {
                        return combo[cells.indexOf('')];
                    }
                }
                return null;
            }

            getRandomMove() {
                const emptyCells = this.board
                    .map((cell, index) => cell === '' ? index : null)
                    .filter(index => index !== null);
                
                return emptyCells.length > 0 ? 
                    emptyCells[Math.floor(Math.random() * emptyCells.length)] : null;
            }

            checkWinner() {
                for (let combo of this.winningCombinations) {
                    const [a, b, c] = combo;
                    if (this.board[a] && 
                        this.board[a] === this.board[b] && 
                        this.board[a] === this.board[c]) {
                        this.highlightWinningCells(combo);
                        return true;
                    }
                }
                return false;
            }

            highlightWinningCells(combo) {
                combo.forEach(index => {
                    document.querySelector(`[data-index="${index}"]`).classList.add('winner');
                });
                document.body.classList.add('game-over');
            }

            handleGameEnd(result) {
                this.gameActive = false;
                this.resetTimer();
                
                if (result === 'draw') {
                    this.scores.draw++;
                    this.updateStatus('🤝 Match nul!');
                    this.showWinningMessage('🤝 Match Nul!');
                } else {
                    this.scores[result]++;
                    const playerName = this.playerNames[result];
                    this.updateStatus(`🎉 ${playerName} a gagné!`);
                    this.showWinningMessage(`🎉 ${playerName} a gagné!`);
                }
                
                this.updateScoreDisplay();
                setTimeout(() => this.resetGame(), 3000);
            }

            showWinningMessage(message) {
                this.winningText.textContent = message;
                this.winningMessage.style.display = 'flex';
                setTimeout(() => {
                    this.winningMessage.style.display = 'none';
                }, 2500);
            }

            updateStatus(message = null) {
                if (message) {
                    this.statusElement.textContent = message;
                } else {
                    const playerName = this.playerNames[this.currentPlayer];
                    this.statusElement.textContent = 
                        `🎯 C'est au tour de ${playerName}`;
                }
            }

            startTimer() {
                this.timeLeft = 15;
                this.updateTimer();
                
                this.timer = setInterval(() => {
                    this.timeLeft--;
                    this.updateTimer();
                    
                    if (this.timeLeft <= 0) {
                        this.handleTimeout();
                    }
                }, 1000);
            }

            updateTimer() {
                this.timerElement.textContent = `⏱️ Temps: ${this.timeLeft}s`;
                
                if (this.timeLeft <= 5) {
                    this.timerElement.classList.add('warning');
                } else {
                    this.timerElement.classList.remove('warning');
                }
            }

            resetTimer() {
                if (this.timer) {
                    clearInterval(this.timer);
                    this.timer = null;
                }
                this.timerElement.classList.remove('warning');
            }

            handleTimeout() {
                this.resetTimer();
                
                if (this.vsComputer && this.currentPlayer === 'O') {
                    this.makeComputerMove();
                } else {
                    // Passe automatiquement au joueur suivant
                    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
                    this.updateStatus();
                    this.startTimer();
                }
            }

            updateScoreDisplay() {
                this.xScoreElement.textContent = this.scores.X;
                this.oScoreElement.textContent = this.scores.O;
                this.drawScoreElement.textContent = this.scores.draw;
                this.playerXLeaderboard.textContent = this.scores.X;
                this.playerOLeaderboard.textContent = this.scores.O;
            }

            resetGame() {
                this.board = Array(9).fill('');
                this.currentPlayer = 'X';
                this.gameActive = true;
                this.resetTimer();
                
                // Réinitialise l'affichage du plateau
                document.querySelectorAll('.cell').forEach(cell => {
                    cell.classList.remove('x', 'o', 'winner');
                });
                
                document.body.classList.remove('game-over');
                this.updateStatus();
                this.startTimer();
            }

            toggleMode() {
                this.vsComputer = !this.vsComputer;
                this.modeToggle.textContent = this.vsComputer ? 
                    '👥 Jouer à deux' : '🤖 Jouer contre l\'IA';
                
                this.playerNames.O = this.vsComputer ? 'Ordinateur' : 'Joueur O';
                this.updateLeaderboardNames();
                this.resetGame();
            }

            toggleTheme() {
                document.body.classList.toggle('dark-mode');
                const isDark = document.body.classList.contains('dark-mode');
                this.themeToggle.textContent = isDark ? '☀️ Mode Clair' : '🌙 Mode Sombre';
            }
        }

        // Initialisation du jeu
        document.addEventListener('DOMContentLoaded', () => {
            new ModernTicTacToe();
        });

        // Effets visuels supplémentaires
        document.addEventListener('mousemove', (e) => {
            const container = document.querySelector('.container');
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const xPercent = (x / rect.width) * 100;
            const yPercent = (y / rect.height) * 100;
            
            container.style.background = `
                radial-gradient(circle at ${xPercent}% ${yPercent}%, 
                rgba(255, 255, 255, 0.15) 0%, 
                rgba(255, 255, 255, 0.05) 50%, 
                rgba(255, 255, 255, 0.1) 100%)
            `;
        });

        // Ajouter des particules flottantes
        function createFloatingParticles() {
            const particlesContainer = document.createElement('div');
            particlesContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: -1;
                overflow: hidden;
            `;
            
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: absolute;
                    width: ${Math.random() * 6 + 2}px;
                    height: ${Math.random() * 6 + 2}px;
                    background: rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1});
                    border-radius: 50%;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    animation: float ${Math.random() * 10 + 10}s infinite linear;
                `;
                particlesContainer.appendChild(particle);
            }
            
            document.body.appendChild(particlesContainer);
        }

        // Ajouter l'animation des particules au CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatParticles {
                0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        // Créer les particules au chargement
        document.addEventListener('DOMContentLoaded', createFloatingParticles);

        // Effet de son (simulation avec vibration sur mobile)
        function playSound(type) {
            if ('vibrate' in navigator) {
                switch(type) {
                    case 'click':
                        navigator.vibrate(50);
                        break;
                    case 'win':
                        navigator.vibrate([100, 50, 100, 50, 200]);
                        break;
                    case 'draw':
                        navigator.vibrate([50, 25, 50]);
                        break;
                }
            }
        }

        // Ajouter des sons aux interactions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell')) {
                playSound('click');
            }
        });
