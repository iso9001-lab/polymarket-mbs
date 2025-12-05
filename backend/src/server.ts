import Fastify from 'fastify';
import cors from '@fastify/cors';
import routes from './routes';
import { db } from './db/jsonDb';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const server = Fastify({ logger: true });

server.register(cors, { origin: true });

server.register(routes);

async function seed() {
  const markets = db.getMarkets();
  if (markets.length === 0) {
    const seedPath = path.join(__dirname, '..', 'seed.json');
    if (fs.existsSync(seedPath)) {
      const seed = JSON.parse(fs.readFileSync(seedPath, 'utf-8')) as any[];
      for (const m of seed) db.upsertMarket(m);
      server.log.info('Seeded markets');
    }
  }

  // Seed admin user if it doesn't exist
  const adminExists = db.findUserByUsername('admin');
  if (!adminExists) {
    const adminUser = {
      id: uuidv4(),
      username: 'admin',
      passwordHash: bcrypt.hashSync('admin', 8),
      balance: 10000,
      positions: {},
      isAdmin: true
    };
    db.addUser(adminUser);
    server.log.info('Seeded admin user (username: admin, password: admin)');
  }
}

const PORT = Number(process.env.PORT || 4000);

const start = async () => {
  try {
    await seed();
    await server.listen({ port: PORT, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
