import Fastify from 'fastify';
import cors from '@fastify/cors';
import routes from './routes';
import { db } from './db/jsonDb';
import path from 'path';
import fs from 'fs';

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
