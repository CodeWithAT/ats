import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import authRoutes from './routes/auth.js';
import jobsRoutes from './routes/jobs.js';
import candidatesRoutes from './routes/candidates.js';
import dashboardRoutes from './routes/dashboard.js';
const app = new Hono();
// Middleware
app.use('*', cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
// Base Route
app.get('/', (c) => {
    return c.json({ status: 'ok', message: 'APTO Hono API running', version: '2.0' });
});
// Mount Routes
app.route('/auth', authRoutes);
app.route('/api/hono/jobs', jobsRoutes);
app.route('/api/hono/candidates', candidatesRoutes);
app.route('/api/hono/dashboard', dashboardRoutes);
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
console.log(`✅ Server is running on port ${port}`);
serve({ fetch: app.fetch, port });
