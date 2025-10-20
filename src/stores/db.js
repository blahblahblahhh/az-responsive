// db.js
const DB_NAME = 'quizGameDB';
const DB_VERSION = 1;
const SCORES_STORE = 'leaderboard';

let db;

export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = event => {
      console.error("Database error:", event.target.error);
      reject(event.target.error);
    };
    
    request.onsuccess = event => {
      db = event.target.result;
      console.log("Database opened successfully");
      resolve(db);
    };
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(SCORES_STORE)) {
        const store = db.createObjectStore(SCORES_STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('by_score', 'score', { unique: false });
        store.createIndex('by_date', 'date', { unique: false });
        store.createIndex('by_initials', 'initials', { unique: false });
      }
    };
  });
}

export async function saveScore(playerData) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("Database not initialized"));
      return;
    }
    
    const transaction = db.transaction([SCORES_STORE], 'readwrite');
    const store = transaction.objectStore(SCORES_STORE);
    
    const score = {
      initials: playerData.initials,
      score: playerData.score,
      type: playerData.type,
      bonusTimeScore: playerData.bonusTimeScore || 0,
      date: new Date().toISOString()
    };
    
    const request = store.add(score);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getTopScores(limit = 20) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("Database not initialized"));
      return;
    }
    
    const transaction = db.transaction([SCORES_STORE], 'readonly');
    const store = transaction.objectStore(SCORES_STORE);
    const index = store.index('by_score');
    
    const request = index.openCursor(null, 'prev'); // descending order
    const scores = [];
    
    request.onsuccess = event => {
      const cursor = event.target.result;
      if (cursor && scores.length < limit) {
        scores.push(cursor.value);
        cursor.continue();
      } else {
        resolve(scores);
      }
    };
    
    request.onerror = () => reject(request.error);
  });
}

export async function getAllScores() {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error("Database not initialized"));
        return;
      }
      
      const transaction = db.transaction([SCORES_STORE], 'readonly');
      const store = transaction.objectStore(SCORES_STORE);
      
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }