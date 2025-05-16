document.addEventListener('DOMContentLoaded', () => {
    // Éléments du DOM
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const status = document.getElementById('status');
    const resetBtn = document.getElementById('reset-btn');
    const xScoreElement = document.getElementById('x-score');
    const oScoreElement = document.getElementById('o-score');
    const drawScoreElement = document.getElementById('draw-score');
    const themeToggle = document.getElementById('theme-toggle');
    const modeToggle = document.getElementById('mode-toggle');
    const timerElement = document.getElementById('timer');
    const playerModal = document.getElementById('player-modal');
    const playerXInput = document.getElementById('player-x');
    const playerOInput = document.getElementById('player-o');
    const startGameButton = document.getElementById('start-game');
    const leaderboardList = document.getElementById('leaderboard-list');
    
    // Sons
    const soundClick = document.getElementById('sound-click');
    const soundWin = document.getElementById('sound-win');
    const soundDraw = document.getElementById('sound-draw');
    
    // Variables du jeu
    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameActive = false;
    let vsComputer = false;
    let scores = {
        X: 0,
        O: 0,
        draw: 0
    };
    
    // Variables pour le timer
    let timerInterval;
    let timeLeft = 15;
    
    // Noms des joueurs et classement
    let playerNames = {
        X: 'Joueur X',
        O: 'Joueur O'
    };
    
    let leaderboard = [];
    
    // Combinaisons gagnantes
    const winningConditions = [
        [0, 1, 2], // Première ligne
        [3, 4, 5], // Deuxième ligne
        [6, 7, 8], // Troisième ligne
        [0, 3, 6], // Première colonne
        [1, 4, 7], // Deuxième colonne
        [2, 5, 8], // Troisième colonne
        [0, 4, 8], // Diagonale gauche-droite
        [2, 4, 6]  // Diagonale droite-gauche
    ];
    
    // Fonction pour vérifier si un joueur a gagné
    function checkWin() {
        let roundWon = false;
        let winningCombination = [];
        
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            
            if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                roundWon = true;
                winningCombination = [a, b, c];
                break;
            }
        }
        
        if (roundWon) {
            // Arrêter le timer
            clearInterval(timerInterval);
            
            // Marquer les cellules gagnantes
            winningCombination.forEach(index => {
                cells[index].classList.add('winner');
            });
            
            updateStatus(`${playerNames[currentPlayer]} a gagné!`);
            
            // Mettre à jour le score
            scores[currentPlayer]++;
            updateScoreDisplay();
            
            // Jouer le son de victoire
            soundWin.play();
            
            // Mettre à jour le classement
            updateLeaderboardWin(currentPlayer);
            
            gameActive = false;
            return true;
        }
        
        // Vérifier s'il y a match nul
        if (!gameState.includes('')) {
            // Arrêter le timer
            clearInterval(timerInterval);
            
            updateStatus('Match nul!');
            
            // Mettre à jour le score de match nul
            scores.draw++;
            updateScoreDisplay();
            
            // Jouer le son de match nul
            soundDraw.play();
            
            gameActive = false;
            return true;
        }
        
        return false;
    }
    
    // Fonction pour mettre à jour l'affichage du statut
    function updateStatus(message) {
        status.textContent = message;
    }
    
    // Fonction pour mettre à jour l'affichage des scores
    function updateScoreDisplay() {
        xScoreElement.textContent = scores.X;
        oScoreElement.textContent = scores.O;
        drawScoreElement.textContent = scores.draw;
    }
    
    // Fonction pour effectuer un coup
    function makeMove(index) {
        gameState[index] = currentPlayer;
        
        // Mettre à jour la cellule visuellement (sans texte, en utilisant les classes CSS)
        cells[index].classList.add(currentPlayer.toLowerCase());
        
        // Jouer le son de clic
        soundClick.play();
        
        if (!checkWin()) {
            // Changer de joueur
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updateStatus(`C'est au tour de ${playerNames[currentPlayer]}`);
            
            // Redémarrer le timer
            startTimer();
            
            // Si c'est maintenant le tour de l'ordinateur, faire son coup
            if (vsComputer && currentPlayer === 'O') {
                computerMove();
            }
        }
    }
    
    // Fonction pour gérer le clic sur une cellule
    function handleCellClick(clickedCellEvent) {
        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        // Vérifier si la cellule est déjà occupée ou si le jeu est terminé
        if (gameState[clickedCellIndex] !== '' || !gameActive) {
            return;
        }
        
        // Effectuer le coup
        makeMove(clickedCellIndex);
    }
    
    // Fonction pour le coup de l'ordinateur
    function computerMove() {
        if (!gameActive || !vsComputer || currentPlayer === 'X') return;
        
        setTimeout(() => {
            // IA simple: d'abord vérifier si l'ordinateur peut gagner
            const winMove = findWinningMove('O');
            if (winMove !== -1) {
                makeMove(winMove);
                return;
            }
            
            // Ensuite, bloquer une victoire potentielle du joueur
            const blockMove = findWinningMove('X');
            if (blockMove !== -1) {
                makeMove(blockMove);
                return;
            }
            
            // Prendre le centre s'il est disponible
            if (gameState[4] === '') {
                makeMove(4);
                return;
            }
            
            // Sinon, faire un mouvement aléatoire
            let availableMoves = [];
            gameState.forEach((cell, index) => {
                if (cell === '') availableMoves.push(index);
            });
            
            if (availableMoves.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableMoves.length);
                makeMove(availableMoves[randomIndex]);
            }
        }, 700); // Délai pour simuler la "réflexion"
    }
    
    // Fonction pour trouver un coup gagnant
    function findWinningMove(player) {
        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === '') {
                // Tester ce mouvement
                gameState[i] = player;
                
                // Vérifier si c'est un mouvement gagnant
                let isWinning = false;
                for (let j = 0; j < winningConditions.length; j++) {
                    const [a, b, c] = winningConditions[j];
                    if (gameState[a] === player && gameState[b] === player && gameState[c] === player) {
                        isWinning = true;
                        break;
                    }
                }
                
                // Annuler le mouvement de test
                gameState[i] = '';
                
                if (isWinning) return i;
            }
        }
        
        return -1;
    }
    
    // Fonction pour réinitialiser le jeu
    function resetGame() {
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        
        // Réinitialiser l'interface utilisateur
        if (vsComputer) {
            updateStatus(`Vous jouez contre l'ordinateur (${playerNames.X} commence)`);
        } else {
            updateStatus(`C'est au tour de ${playerNames.X}`);
        }
        
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winner');
        });
        
        // Redémarrer le timer
        startTimer();
    }
    
    // Fonction pour démarrer/redémarrer le timer
    function startTimer() {
        // Arrêter le timer existant s'il y en a un
        clearInterval(timerInterval);
        
        // Réinitialiser le temps
        timeLeft = 15;
        timerElement.textContent = `Temps: ${timeLeft}s`;
        timerElement.classList.remove('warning');
        
        // Démarrer un nouveau timer
        timerInterval = setInterval(() => {
            timeLeft--;
            timerElement.textContent = `Temps: ${timeLeft}s`;
            
            // Avertissement lorsqu'il reste peu de temps
            if (timeLeft <= 5) {
                timerElement.classList.add('warning');
            }
            
            // Si le temps est écoulé, passer au joueur suivant
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                updateStatus(`Temps écoulé! C'est au tour de ${playerNames[currentPlayer]}`);
                startTimer();
                
                // Si c'est le tour de l'ordinateur, faire son coup
                if (vsComputer && currentPlayer === 'O') {
                    computerMove();
                }
            }
        }, 1000);
    }
    
    // Fonction pour mettre à jour le classement
    function updateLeaderboardWin(winner) {
        // Trouver le joueur dans le classement ou l'ajouter
        let playerFound = false;
        
        for (let i = 0; i < leaderboard.length; i++) {
            if (leaderboard[i].name === playerNames[winner]) {
                leaderboard[i].score++;
                playerFound = true;
                break;
            }
        }
        
        if (!playerFound) {
            leaderboard.push({
                name: playerNames[winner],
                score: 1
            });
        }
        
        // Trier le classement
        leaderboard.sort((a, b) => b.score - a.score);
        
        // Mettre à jour l'affichage
        updateLeaderboard();
    }
    
    // Fonction pour mettre à jour l'affichage du classement
    function updateLeaderboard() {
        // Vider la liste
        leaderboardList.innerHTML = '';
        
        // Ajouter les joueurs actuels s'ils ne sont pas dans le classement
        let xFound = leaderboard.some(player => player.name === playerNames.X);
        let oFound = leaderboard.some(player => player.name === playerNames.O);
        
        if (!xFound) {
            leaderboard.push({
                name: playerNames.X,
                score: 0
            });
        }
        
        if (!oFound) {
            leaderboard.push({
                name: playerNames.O,
                score: 0
            });
        }
        
        // Trier le classement
        leaderboard.sort((a, b) => b.score - a.score);
        
        // Afficher le classement (limité aux 5 premiers)
        for (let i = 0; i < Math.min(5, leaderboard.length); i++) {
            const player = leaderboard[i];
            
            const item = document.createElement('li');
            item.className = 'leaderboard-item';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'player-name';
            nameSpan.textContent = player.name;
            
            const scoreSpan = document.createElement('span');
            scoreSpan.className = 'player-score';
            scoreSpan.textContent = player.score;
            
            item.appendChild(nameSpan);
            item.appendChild(scoreSpan);
            
            leaderboardList.appendChild(item);
        }
    }
    
    // Gérer le clic sur le bouton "Commencer le Jeu"
    startGameButton.addEventListener('click', () => {
        // Récupérer les noms des joueurs
        playerNames.X = playerXInput.value.trim() || 'Joueur X';
        playerNames.O = playerOInput.value.trim() || 'Joueur O';
        
        // Mettre à jour le tableau des scores
        updateLeaderboard();
        
        // Fermer la boîte de dialogue
        playerModal.style.display = 'none';
        
        // Activer le jeu
        gameActive = true;
        
        // Démarrer le timer
        startTimer();
        
        // Mettre à jour l'affichage du statut
        if (vsComputer) {
            updateStatus(`Vous jouez contre l'ordinateur (${playerNames.X} commence)`);
        } else {
            updateStatus(`C'est au tour de ${playerNames.X}`);
        }
    });
    
    // Mode sombre
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            themeToggle.textContent = 'Mode Clair';
        } else {
            themeToggle.textContent = 'Mode Sombre';
        }
    });
    
    // Mode contre l'ordinateur
    modeToggle.addEventListener('click', () => {
        vsComputer = !vsComputer;
        resetGame();
        
        if (vsComputer) {
            modeToggle.textContent = 'Jouer contre un ami';
            playerNames.O = 'Ordinateur';
            updateStatus(`Vous jouez contre l'ordinateur (${playerNames.X} commence)`);
        } else {
            modeToggle.textContent = 'Jouer contre l\'ordinateur';
            playerNames.O = 'Joueur O';
            updateStatus(`C'est au tour de ${playerNames.X}`);
        }
        
        // Mettre à jour le tableau des scores
        updateLeaderboard();
    });
    
    // Ajouter des écouteurs d'événements aux cellules
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    
    // Ajouter un écouteur d'événement au bouton de réinitialisation
    resetBtn.addEventListener('click', resetGame);
    
    // Afficher la boîte de dialogue des noms de joueurs au chargement
    playerModal.style.display = 'flex';
    
    // Initialiser le jeu
    updateLeaderboard();
});