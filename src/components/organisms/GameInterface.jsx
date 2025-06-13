import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import CarromBoard from './CarromBoard';
import ScorePanel from '@/components/molecules/ScorePanel';
import PowerMeter from '@/components/molecules/PowerMeter';
import GameControls from '@/components/molecules/GameControls';
import { gameStateService } from '@/services';

const GameInterface = () => {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [power, setPower] = useState(0);
  const [isAiming, setIsAiming] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [winner, setWinner] = useState(null);

  const TARGET_SCORE = 100;

  // Load initial game state
  useEffect(() => {
    const initializeGame = async () => {
      setLoading(true);
      setError(null);
      try {
        let currentGame = await gameStateService.getCurrentGame();
        if (!currentGame) {
          currentGame = await gameStateService.resetGame();
        }
        setGameState(currentGame);
      } catch (err) {
        setError(err.message || 'Failed to initialize game');
        toast.error('Failed to initialize game');
      } finally {
        setLoading(false);
      }
    };

    initializeGame();
  }, []);

  // Check for winner
  useEffect(() => {
    if (gameState?.scores) {
      const { player1, player2 } = gameState.scores;
      if (player1 >= TARGET_SCORE || player2 >= TARGET_SCORE) {
        const gameWinner = player1 >= TARGET_SCORE ? 'player1' : 'player2';
        setGameWon(true);
        setWinner(gameWinner);
        toast.success(`Player ${gameWinner === 'player1' ? '1' : '2'} wins the game!`, {
          autoClose: 5000
        });
      }
    }
  }, [gameState?.scores]);

  const handleShot = async (shotResult) => {
    if (!gameState) return;

    const { coinsPocketed, strikerPocketed, score, foul } = shotResult;
    
    try {
      // Update scores
      const newScores = { ...gameState.scores };
      if (!strikerPocketed && coinsPocketed.length > 0) {
        newScores[gameState.currentPlayer] += score;
      }
      
      // Determine next player (switch if foul or no coins pocketed)
      const shouldSwitchPlayer = foul || coinsPocketed.length === 0;
      const nextPlayer = shouldSwitchPlayer 
        ? (gameState.currentPlayer === 'player1' ? 'player2' : 'player1')
        : gameState.currentPlayer;

      // Update board state
      const newBoardState = gameState.boardState.map(coin => {
        const pocketed = coinsPocketed.find(c => c.id === coin.id);
        return pocketed ? { ...coin, isPocketed: true } : coin;
      });

      // Reset striker position if pocketed
      if (strikerPocketed) {
        const strikerIndex = newBoardState.findIndex(coin => coin.id === 'striker');
        if (strikerIndex !== -1) {
          newBoardState[strikerIndex] = {
            ...newBoardState[strikerIndex],
            position: { x: 320, y: 500 },
            velocity: { x: 0, y: 0 },
            isPocketed: false
          };
        }
      }

      const updatedGameState = {
        ...gameState,
        currentPlayer: nextPlayer,
        scores: newScores,
        turnNumber: shouldSwitchPlayer ? gameState.turnNumber + 1 : gameState.turnNumber,
        boardState: newBoardState,
        lastShot: {
          player: gameState.currentPlayer,
          coinsPocketed: coinsPocketed.map(c => c.id),
          score,
          foul: strikerPocketed,
          timestamp: Date.now()
        }
      };

      const savedState = await gameStateService.saveGameState(updatedGameState);
      setGameState(savedState);

      // Show shot feedback
      if (foul) {
        toast.warning(`Foul! Turn switches to Player ${nextPlayer === 'player1' ? '1' : '2'}`);
      } else if (coinsPocketed.length === 0) {
        toast.info(`No coins pocketed. Turn switches to Player ${nextPlayer === 'player1' ? '1' : '2'}`);
      } else if (!shouldSwitchPlayer) {
        toast.success(`Great shot! Continue playing.`);
      }

    } catch (err) {
      setError(err.message || 'Failed to update game');
      toast.error('Failed to update game state');
    }
  };

  const handleNewGame = async () => {
    setLoading(true);
    setError(null);
    setGameWon(false);
    setWinner(null);
    
    try {
      const newGame = await gameStateService.resetGame();
      setGameState(newGame);
      toast.success('New game started!');
    } catch (err) {
      setError(err.message || 'Failed to start new game');
      toast.error('Failed to start new game');
    } finally {
      setLoading(false);
    }
  };

  const handleSettings = () => {
    toast.info('Settings panel coming soon!');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-surface-50 text-lg">Loading game...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-100/90 wood-texture rounded-lg border-2 border-primary/20 p-8 shadow-lg text-center max-w-md"
        >
          <h2 className="text-2xl font-heading font-bold text-error mb-4">Game Error</h2>
          <p className="text-surface-700 mb-6">{error}</p>
          <button
            onClick={handleNewGame}
            className="bg-primary text-surface-50 px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Start New Game
          </button>
        </motion.div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-surface-50 text-lg">No game state available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Score Panel */}
        <div className="mb-6">
          <ScorePanel
            player1Score={gameState.scores.player1}
            player2Score={gameState.scores.player2}
            currentPlayer={gameState.currentPlayer}
            turnNumber={gameState.turnNumber}
          />
        </div>

        {/* Main Game Area */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Game Board */}
          <div className="flex-1 flex justify-center">
            <CarromBoard
              gameState={gameState}
              onShot={handleShot}
              onPowerChange={setPower}
              onAimingChange={setIsAiming}
              isPlayerTurn={!gameWon}
            />
          </div>

          {/* Side Panel */}
          <div className="w-full lg:w-64 space-y-4">
            {/* Power Meter */}
            <PowerMeter power={power} isVisible={isAiming} />

            {/* Game Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-surface-100/90 wood-texture rounded-lg border-2 border-primary/20 p-4 shadow-lg"
            >
              <h3 className="font-heading font-bold text-primary mb-3">Game Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-600">Target Score:</span>
                  <span className="font-medium text-primary">{TARGET_SCORE}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Turn:</span>
                  <span className="font-medium text-primary">{gameState.turnNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Current Player:</span>
                  <span className="font-medium text-accent">
                    Player {gameState.currentPlayer === 'player1' ? '1' : '2'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Scoring Guide */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface-100/90 wood-texture rounded-lg border-2 border-primary/20 p-4 shadow-lg"
            >
              <h3 className="font-heading font-bold text-primary mb-3">Scoring</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 rounded-full border border-primary"></div>
                    <span className="text-surface-600">White</span>
                  </div>
                  <span className="font-medium text-primary">20 pts</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-800 rounded-full border border-primary"></div>
                    <span className="text-surface-600">Black</span>
                  </div>
                  <span className="font-medium text-primary">10 pts</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-600 rounded-full border border-accent"></div>
                    <span className="text-surface-600">Queen</span>
                  </div>
                  <span className="font-medium text-accent">50 pts</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8">
          <GameControls
            onReset={handleNewGame}
            onSettings={handleSettings}
            disabled={loading}
          />
        </div>

        {/* Win Modal */}
        <AnimatePresence>
          {gameWon && winner && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="bg-surface-100 wood-texture rounded-xl border-4 border-accent p-8 text-center max-w-md w-full shadow-2xl"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-6xl mb-4"
                >
                  🏆
                </motion.div>
                
                <h2 className="font-heading font-bold text-3xl text-primary mb-2">
                  Game Won!
                </h2>
                
                <p className="text-xl text-accent font-bold mb-2">
                  Player {winner === 'player1' ? '1' : '2'} Wins!
                </p>
                
                <div className="bg-surface-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between text-lg font-medium">
                    <span>Final Score:</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className={winner === 'player1' ? 'text-accent font-bold' : 'text-surface-600'}>
                      Player 1: {gameState.scores.player1}
                    </span>
                    <span className={winner === 'player2' ? 'text-accent font-bold' : 'text-surface-600'}>
                      Player 2: {gameState.scores.player2}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleNewGame}
                  className="bg-primary text-surface-50 px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors text-lg"
                >
                  Play Again
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GameInterface;