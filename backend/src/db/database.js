import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create database connection
const dbPath = path.join(__dirname, '../../data/photoshoots.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const createTables = () => {
  // Photoshoots table
  db.exec(`
    CREATE TABLE IF NOT EXISTS photoshoots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      garment_filename TEXT NOT NULL,
      garment_path TEXT NOT NULL,
      result_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'completed'
    )
  `);

  // Videos table
  db.exec(`
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id TEXT NOT NULL,
      socket_token TEXT,
      image_url TEXT NOT NULL,
      video_url TEXT,
      status TEXT DEFAULT 'processing',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Database tables created successfully');
};

// Initialize database
createTables();

// Database operations
export const savePhotoshoot = (garmentFilename, garmentPath, resultUrl) => {
  const stmt = db.prepare(`
    INSERT INTO photoshoots (garment_filename, garment_path, result_url)
    VALUES (?, ?, ?)
  `);
  
  const result = stmt.run(garmentFilename, garmentPath, resultUrl);
  return result.lastInsertRowid;
};

export const getAllPhotoshoots = (limit = 50) => {
  const stmt = db.prepare(`
    SELECT * FROM photoshoots 
    ORDER BY created_at DESC 
    LIMIT ?
  `);
  
  return stmt.all(limit);
};

export const getPhotoshootById = (id) => {
  const stmt = db.prepare('SELECT * FROM photoshoots WHERE id = ?');
  return stmt.get(id);
};

export const deletePhotoshoot = (id) => {
  const stmt = db.prepare('DELETE FROM photoshoots WHERE id = ?');
  return stmt.run(id);
};

export default db;
