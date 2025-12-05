import { FastifyInstance } from 'fastify';
import { db } from '../db/jsonDb';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', async (req, rep) => {
    const body = req.body as any;
    if (!body?.username || !body?.password) return rep.status(400).send({ error: 'missing fields' });
    const existing = db.findUserByUsername(body.username);
    if (existing) return rep.status(400).send({ error: 'username taken' });
    const hash = bcrypt.hashSync(body.password, 8);
    const user = {
      id: uuidv4(),
      username: body.username,
      passwordHash: hash,
      balance: 1000,
      positions: {},
      isAdmin: false
    };
    db.addUser(user);
    return { id: user.id, username: user.username, isAdmin: user.isAdmin };
  });

  fastify.post('/login', async (req, rep) => {
    const body = req.body as any;
    if (!body?.username || !body?.password) return rep.status(400).send({ error: 'missing fields' });
    const user = db.findUserByUsername(body.username);
    if (!user) return rep.status(401).send({ error: 'invalid' });
    const ok = bcrypt.compareSync(body.password, user.passwordHash);
    if (!ok) return rep.status(401).send({ error: 'invalid' });
    // For simplicity return a token that's just the user id
    return { token: user.id, user: { id: user.id, username: user.username, balance: user.balance, isAdmin: user.isAdmin || false } };
  });
}
