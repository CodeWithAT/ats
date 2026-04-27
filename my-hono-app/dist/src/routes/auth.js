import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
const auth = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});
const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});
// REGISTER
auth.post('/register', zValidator('json', registerSchema), async (c) => {
    try {
        const { name, email, password } = c.req.valid('json');
        // Check if user exists
        const existingUser = await db.select().from(users).where(eq(users.email, email));
        if (existingUser.length > 0) {
            return c.json({ error: 'User already exists' }, 400);
        }
        // Hash password & Insert
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
        }).returning({ id: users.id, name: users.name, email: users.email });
        return c.json({ message: 'User registered successfully', user: newUser[0] }, 201);
    }
    catch (error) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
// LOGIN
auth.post('/login', zValidator('json', loginSchema), async (c) => {
    try {
        const { email, password } = c.req.valid('json');
        // Find user
        const user = await db.select().from(users).where(eq(users.email, email));
        if (user.length === 0) {
            return c.json({ error: 'Invalid credentials' }, 401);
        }
        // Verify password
        const validPassword = await bcrypt.compare(password, user[0].password);
        if (!validPassword) {
            return c.json({ error: 'Invalid credentials' }, 401);
        }
        // Generate JWT
        const token = jwt.sign({ id: user[0].id, email: user[0].email }, JWT_SECRET, { expiresIn: '1d' });
        return c.json({ message: 'Login successful', token }, 200);
    }
    catch (error) {
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
// PROTECTED ROUTE (Get my profile)
auth.get('/me', async (c) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.id, decoded.id));
        if (user.length === 0)
            return c.json({ error: 'User not found' }, 404);
        return c.json({ user: user[0] }, 200);
    }
    catch (error) {
        return c.json({ error: 'Invalid or expired token' }, 401);
    }
});
const updateSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, "Password must be at least 6 characters").optional(),
});
// PROTECTED ROUTE (Update my profile)
auth.put('/me', zValidator('json', updateSchema), async (c) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { name, currentPassword, newPassword } = c.req.valid('json');
        const user = await db.select().from(users).where(eq(users.id, decoded.id));
        if (user.length === 0)
            return c.json({ error: 'User not found' }, 404);
        let passwordHash = user[0].password;
        if (currentPassword && newPassword) {
            const validPassword = await bcrypt.compare(currentPassword, user[0].password);
            if (!validPassword) {
                return c.json({ error: 'Invalid current password' }, 400);
            }
            passwordHash = await bcrypt.hash(newPassword, 10);
        }
        const updatedUser = await db.update(users)
            .set({
            name: name || user[0].name,
            password: passwordHash,
        })
            .where(eq(users.id, decoded.id))
            .returning({ id: users.id, name: users.name, email: users.email });
        return c.json({ message: 'Profile updated', user: updatedUser[0] }, 200);
    }
    catch (error) {
        return c.json({ error: 'Invalid or expired token' }, 401);
    }
});
export default auth;
