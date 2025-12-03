import { FastifyInstance } from 'fastify';
import healthRoutes from './health';
import authRoutes from './auth';
import marketsRoutes from './markets';

export default async function routes(fastify: FastifyInstance) {
  await healthRoutes(fastify);
  await authRoutes(fastify);
  await marketsRoutes(fastify);
}
