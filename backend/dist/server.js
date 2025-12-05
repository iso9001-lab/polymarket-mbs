"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const routes_1 = __importDefault(require("./routes"));
const jsonDb_1 = require("./db/jsonDb");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const server = (0, fastify_1.default)({ logger: true });
server.register(cors_1.default, { origin: true });
server.register(routes_1.default);
async function seed() {
    const markets = jsonDb_1.db.getMarkets();
    if (markets.length === 0) {
        const seedPath = path_1.default.join(__dirname, '..', 'seed.json');
        if (fs_1.default.existsSync(seedPath)) {
            const seed = JSON.parse(fs_1.default.readFileSync(seedPath, 'utf-8'));
            for (const m of seed)
                jsonDb_1.db.upsertMarket(m);
            server.log.info('Seeded markets');
        }
    }
    // Seed admin user if it doesn't exist
    const adminExists = jsonDb_1.db.findUserByUsername('admin');
    if (!adminExists) {
        const adminUser = {
            id: (0, uuid_1.v4)(),
            username: 'admin',
            passwordHash: bcryptjs_1.default.hashSync('admin', 8),
            balance: 10000,
            positions: {},
            isAdmin: true
        };
        jsonDb_1.db.addUser(adminUser);
        server.log.info('Seeded admin user (username: admin, password: admin)');
    }
}
const PORT = Number(process.env.PORT || 4000);
const start = async () => {
    try {
        await seed();
        await server.listen({ port: PORT, host: '0.0.0.0' });
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();
