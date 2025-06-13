import shots from '@/services/mockData/shots.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ShotService {
  constructor() {
    this.data = [...shots];
  }

  async getAll() {
    await delay(200);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const shot = this.data.find(item => item.id === id);
    return shot ? { ...shot } : null;
  }

  async create(shot) {
    await delay(250);
    const newShot = {
      ...shot,
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    this.data.push(newShot);
    return { ...newShot };
  }

  async update(id, updates) {
    await delay(200);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Shot not found');
    
    this.data[index] = { ...this.data[index], ...updates };
    return { ...this.data[index] };
  }

  async delete(id) {
    await delay(200);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Shot not found');
    
    this.data.splice(index, 1);
    return true;
  }

  async getRecentShots(limit = 10) {
    await delay(150);
    return [...this.data]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  async getShotsByPlayer(player) {
    await delay(200);
    return this.data.filter(shot => shot.player === player);
  }
}

export default new ShotService();