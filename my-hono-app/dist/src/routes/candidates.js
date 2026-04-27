import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db/index.js';
import { candidates, jobs } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '../middleware.js';
const candidatesRouter = new Hono();
const candidateSchema = z.object({
    jobId: z.number().optional().nullable(),
    filename: z.string().optional(),
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    education: z.string().optional(),
    experience: z.union([z.string(), z.array(z.string())]).optional(),
    skills: z.union([z.string(), z.array(z.string())]).optional(),
    match_score: z.number().optional(),
    status: z.string().optional(),
});
// GET /candidates — list all, sorted by match score DESC
candidatesRouter.get('/', requireAuth, async (c) => {
    try {
        const userId = c.get('userId');
        const all = await db
            .select()
            .from(candidates)
            .where(eq(candidates.createdBy, userId))
            .orderBy(desc(candidates.matchScore));
        const parsed = all.map((c, i) => ({
            ...c,
            skills: safeJsonParse(c.skills),
            rank: i + 1,
        }));
        return c.json(parsed);
    }
    catch {
        return c.json({ error: 'Failed to fetch candidates' }, 500);
    }
});
// POST /candidates — save a parsed candidate from ATS
candidatesRouter.post('/', requireAuth, zValidator('json', candidateSchema), async (c) => {
    try {
        const body = c.req.valid('json');
        const { jobId, filename, name, email, phone, location, education, experience, skills, match_score, status, } = body;
        const created = await db.insert(candidates).values({
            jobId: jobId || null,
            filename: filename || 'unknown.pdf',
            name: name || '',
            email: email || '',
            phone: phone || '',
            location: location || '',
            education: education || '',
            experience: Array.isArray(experience) ? experience[0] || 'Fresher' : (experience || ''),
            skills: JSON.stringify(Array.isArray(skills) ? skills : []),
            matchScore: match_score ?? 0,
            status: status || 'New',
            createdBy: c.get('userId'),
        }).returning();
        // Increment applicant count for the job
        if (jobId) {
            const job = await db.select().from(jobs).where(eq(jobs.id, jobId));
            if (job.length > 0) {
                await db.update(jobs)
                    .set({ applicants: job[0].applicants + 1 })
                    .where(eq(jobs.id, jobId));
            }
        }
        return c.json({ ...created[0], skills: safeJsonParse(created[0].skills) }, 201);
    }
    catch (error) {
        console.error(error);
        return c.json({ error: 'Failed to save candidate' }, 500);
    }
});
// DELETE /candidates/:id
candidatesRouter.delete('/:id', requireAuth, async (c) => {
    try {
        const userId = c.get('userId');
        const id = parseInt(c.req.param('id'));
        const existing = await db.select().from(candidates).where(eq(candidates.id, id));
        if (existing.length === 0 || existing[0].createdBy !== userId) {
            return c.json({ error: 'Candidate not found or unauthorized' }, 403);
        }
        await db.delete(candidates).where(eq(candidates.id, id));
        return c.json({ message: 'Candidate deleted' });
    }
    catch {
        return c.json({ error: 'Failed to delete candidate' }, 500);
    }
});
function safeJsonParse(str) {
    try {
        return JSON.parse(str || '[]');
    }
    catch {
        return [];
    }
}
export default candidatesRouter;
