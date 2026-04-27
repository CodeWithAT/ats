import Database from 'better-sqlite3';
import path from 'path';
const sqlite = new Database(path.resolve('./sqlite.db'));
// Create jobs table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    department TEXT NOT NULL DEFAULT 'General',
    status TEXT NOT NULL DEFAULT 'Active',
    type TEXT NOT NULL DEFAULT 'Full-time',
    location TEXT NOT NULL DEFAULT 'Remote',
    applicants INTEGER NOT NULL DEFAULT 0,
    description TEXT DEFAULT '',
    posted_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
  );
`);
// Create candidates table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER REFERENCES jobs(id),
    filename TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    phone TEXT DEFAULT '',
    location TEXT DEFAULT '',
    education TEXT DEFAULT '',
    experience TEXT DEFAULT '',
    skills TEXT DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'New',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
  );
`);
try {
    sqlite.exec(`ALTER TABLE candidates ADD COLUMN created_by INTEGER REFERENCES users(id);`);
    console.log('✅ Added created_by column to candidates table.');
}
catch (e) {
    // Ignore error if column already exists
}
// Ensure scalability indexes
sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_jobs_created_by ON jobs(created_by);`);
sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_candidates_created_by ON candidates(created_by);`);
console.log('✅ Created indexes for multi-tenancy optimization.');
console.log('✅ Migration complete: jobs and candidates tables configured.');
sqlite.close();
