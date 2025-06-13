import gameStates from '@/services/mockData/gameStates.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class GameStateService {
  constructor() {
    this.data = [...gameStates];
    this.currentGameId = null;
  }

  async getAll() {
    await delay(200);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const gameState = this.data.find(item => item.id === id);
    return gameState ? { ...gameState } : null;
  }

  async create(gameState) {
    await delay(300);
    const newGameState = {
      ...gameState,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    this.data.push(newGameState);
    this.currentGameId = newGameState.id;
    return { ...newGameState };
  }

  async update(id, updates) {
    await delay(250);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Game state not found');
    
    this.data[index] = { ...this.data[index], ...updates };
    return { ...this.data[index] };
  }

  async delete(id) {
    await delay(200);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Game state not found');
    
    this.data.splice(index, 1);
    if (this.currentGameId === id) {
      this.currentGameId = null;
    }
    return true;
  }

  async getCurrentGame() {
    await delay(100);
    if (!this.currentGameId) return null;
    return this.getById(this.currentGameId);
  }

  async saveGameState(gameState) {
    if (this.currentGameId) {
      return this.update(this.currentGameId, gameState);
    } else {
      return this.create(gameState);
    }
  }

  async resetGame() {
    await delay(200);
    const initialState = {
      currentPlayer: 'player1',
      scores: { player1: 0, player2: 0 },
      turnNumber: 1,
      boardState: this.getInitialBoardState(),
      lastShot: null,
      gameWon: false,
      winner: null
    };
    
    if (this.currentGameId) {
      return this.update(this.currentGameId, initialState);
    } else {
      return this.create(initialState);
    }
  }

  getInitialBoardState() {
    return [
      // White coins (9 total)
      { id: 'w1', type: 'white', position: { x: 300, y: 280 }, velocity: { x: 0, y: 0 }, isPocketed: false },
      { id: 'w2', type: 'white', position: { x: 320, y: 260 }, velocity: { x: 0, y: 0 }, isPocketed: false },
      { id: 'w3', type: 'white', position: { x: 340, y: 280 }, velocity: { x: 0, y: 0 }, isPocketed: false },
      { id: 'w4', type: 'white', position: { x: 320, y: 300 }, velocity: { x: 0, y: 0 }, isPocketed: false },
      { id: 'w5', type: 'white', position: { x: 300, y: 320 }, velocity: { x: 0, y: 0 }, isPocketed: false },
      { id: 'w6', type: 'white', position: { x: 340, y: 320 }, velocity: { x: 0, y: 0 }, isPocketed: false },
      { id: 'w7', type: 'white', position: { x: 280, y: 300 }, velocity: { x: 0, y: 0 }, isPocketed: false },
      { id: 'w8', type: 'white', position: { x: 360, y: 300 }, velocity: { x: 0, y: 0 }, isPocketed: false },
      { id: 'w9', type: 'white', position: { x: 320, y: 340 }, velocity: { x: 0, y: 0 }, isPocketed: false },
      
      // Black coins (9 total)
      { id: 'b1', type: 'black', position: { x: 310, y: 270 }, velocity: { x: 0, y: 0 }, isPocketed: false },
      { id: 'b2', type: 'black', position: { x: 330, y: 270 }, velocity: { x: 0, y: 0 }, isPocketed: false },
      { id: 'b3', type: 'black', position: { x: 310, y: 290 }, velocity: { x: 0, y: 0 }, isPocketed: false },
      { id: 'b4', type: 'black', position: { x: 330, y: 290 }, velocity: { x: 0, y: 0 }, isPocketed: false },
      { id: 'b5', type: 'black', position: { x: 310, y: 310 }, velocity: { x: 0, y: 0 }, isPocketed: false },
      { id: 'b6', type: 'black', position: { x: 330, y: 310 }, velocity: { x: 0, y: 0 }, isPocketed: false },
      { id: 'b7', type: 'black', position: { x: 310, y: 330 }, velocity: { x: 0, y: 0 }, isPocketed: false },
      { id: 'b8', type: 'black', position: { x: 330, y: 330 }, velocity: { x: 0, y: 0 }, isPocketed: false },
      { id: 'b9', type: 'black', position: { x: 290, y: 320 }, velocity: { x: 0, y: 0 }, isPocketed: false },
      
      // Queen (red coin)
      { id: 'queen', type: 'queen', position: { x: 320, y: 300 }, velocity: { x: 0, y: 0 }, isPocketed: false },
      
      // Striker
      { id: 'striker', type: 'striker', position: { x: 320, y: 500 }, velocity: { x: 0, y: 0 }, isPocketed: false }
    ];
  }
}

export default new GameStateService();