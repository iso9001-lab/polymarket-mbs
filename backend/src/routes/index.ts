import { FastifyInstance } from 'fastify';
import healthRoutes from './health';
import authRoutes from './auth';
import marketsRoutes from './markets';
import userRoutes from './user';
import adminRoutes from './admin';

export default async function routes(fastify: FastifyInstance) {
  await healthRoutes(fastify);
  await authRoutes(fastify);
  await marketsRoutes(fastify);
  await userRoutes(fastify);
  await adminRoutes(fastify);
}
