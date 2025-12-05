import fs from 'fs';
import path from 'path';
import { Market, User, Trade } from '../types';

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'db.json');

type DBShape = {
  users: User[];
  markets: Market[];
  trades: Trade[];
};

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export class JSONDB {
  filePath: string;
  data: DBShape;

  constructor(filePath = DB_PATH) {
    this.filePath = filePath;
    ensureDir(this.filePath);
    if (!fs.existsSync(this.filePath)) {
      this.data = { users: [], markets: [], trades: [] };
      this.save();
    } else {
      this.data = JSON.parse(fs.readFileSync(this.filePath, 'utf-8')) as DBShape;
    }
  }

  save() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  getMarkets() {
    return this.data.markets;
  }

  getMarket(id: string) {
    return this.data.markets.find(m => m.id === id);
  }

  upsertMarket(market: Market) {
    const idx = this.data.markets.findIndex(x => x.id === market.id);
    if (idx === -1) this.data.markets.push(market);
    else this.data.markets[idx] = market;
    this.save();
  }

  addUser(user: User) {
    this.data.users.push(user);
    this.save();
  }

  findUserByUsername(username: string) {
    return this.data.users.find(u => u.username === username);
  }

  findUserById(id: string) {
    return this.data.users.find(u => u.id === id);
  }

  getAllUsers() {
    return this.data.users;
  }

  upsertUser(user: User) {
    const idx = this.data.users.findIndex(u => u.id === user.id);
    if (idx === -1) this.data.users.push(user);
    else this.data.users[idx] = user;
    this.save();
  }

  addTrade(trade: Trade) {
    this.data.trades.push(trade);
    this.save();
  }

  getTotalSpentOnMarket(marketId: string): number {
    return this.data.trades
      .filter(t => t.marketId === marketId)
      .reduce((sum, t) => sum + t.cost, 0);
  }

  getTotalSpentByUserOnMarket(userId: string, marketId: string): number {
    return this.data.trades
      .filter(t => t.marketId === marketId && t.userId === userId)
      .reduce((sum, t) => sum + t.cost, 0);
  }
}

export const db = new JSONDB();
