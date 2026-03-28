const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const config = require('../config');

class DatabaseService {
  constructor() {
    this.db = null;
    this.init();
  }

  init() {
    // Crear directorio de datos si no existe
    const dbDir = path.dirname(config.database.path);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new sqlite3.Database(config.database.path, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
        this.createTables();
      }
    });
  }

  createTables() {
    const createConversationsTable = `
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        package TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createMessagesTable = `
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        agent_type TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations (id)
      )
    `;

    this.db.run(createConversationsTable, (err) => {
      if (err) {
        console.error('Error creating conversations table:', err);
      }
    });

    this.db.run(createMessagesTable, (err) => {
      if (err) {
        console.error('Error creating messages table:', err);
      }
    });
  }

  async saveConversation(packageInput) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO conversations (package) VALUES (?)',
        [packageInput],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  async saveMessage(conversationId, role, content, agentType = null, metadata = null) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO messages (conversation_id, role, content, agent_type, metadata) VALUES (?, ?, ?, ?, ?)',
        [conversationId, role, content, agentType, JSON.stringify(metadata)],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  async getConversationHistory(conversationId, limit = 50) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT role, content, agent_type, metadata, created_at 
         FROM messages 
         WHERE conversation_id = ? 
         ORDER BY created_at ASC 
         LIMIT ?`,
        [conversationId, limit],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            // Parsear metadata JSON
            const parsedRows = rows.map(row => ({
              ...row,
              metadata: row.metadata ? JSON.parse(row.metadata) : null
            }));
            resolve(parsedRows);
          }
        }
      );
    });
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = DatabaseService;