"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.JSONDB = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DB_PATH = path_1.default.join(__dirname, '..', '..', 'data', 'db.json');
function ensureDir(filePath) {
    const dir = path_1.default.dirname(filePath);
    if (!fs_1.default.existsSync(dir))
        fs_1.default.mkdirSync(dir, { recursive: true });
}
class JSONDB {
    constructor(filePath = DB_PATH) {
        this.filePath = filePath;
        ensureDir(this.filePath);
        if (!fs_1.default.existsSync(this.filePath)) {
            this.data = { users: [], markets: [], trades: [] };
            this.save();
        }
        else {
            this.data = JSON.parse(fs_1.default.readFileSync(this.filePath, 'utf-8'));
        }
    }
    save() {
        fs_1.default.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    }
    getMarkets() {
        return this.data.markets;
    }
    getMarket(id) {
        return this.data.markets.find(m => m.id === id);
    }
    upsertMarket(market) {
        const idx = this.data.markets.findIndex(x => x.id === market.id);
        if (idx === -1)
            this.data.markets.push(market);
        else
            this.data.markets[idx] = market;
        this.save();
    }
    addUser(user) {
        this.data.users.push(user);
        this.save();
    }
    findUserByUsername(username) {
        return this.data.users.find(u => u.username === username);
    }
    findUserById(id) {
        return this.data.users.find(u => u.id === id);
    }
    getAllUsers() {
        return this.data.users;
    }
    upsertUser(user) {
        const idx = this.data.users.findIndex(u => u.id === user.id);
        if (idx === -1)
            this.data.users.push(user);
        else
            this.data.users[idx] = user;
        this.save();
    }
    addTrade(trade) {
        this.data.trades.push(trade);
        this.save();
    }
    getTotalSpentOnMarket(marketId) {
        return this.data.trades
            .filter(t => t.marketId === marketId)
            .reduce((sum, t) => sum + t.cost, 0);
    }
    getTotalSpentByUserOnMarket(userId, marketId) {
        return this.data.trades
            .filter(t => t.marketId === marketId && t.userId === userId)
            .reduce((sum, t) => sum + t.cost, 0);
    }
}
exports.JSONDB = JSONDB;
exports.db = new JSONDB();
