// db.js
const DB_NAME = 'aldosteroneQuizDB';
const DB_VERSION = 1;
const SCORES_STORE = 'playerResults';

let db;

export async function initDB() {
  return new Promise((resolve, reject) => {
    console.log('Initializing database:', DB_NAME);
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = event => {
      console.error("Database error:", event.target.error);
      reject(event.target.error);
    };
    
    request.onsuccess = event => {
      db = event.target.result;
      console.log("Database opened successfully:", DB_NAME);
      console.log("Available object stores:", [...db.objectStoreNames]);
      resolve(db);
    };
    
    request.onupgradeneeded = event => {
      console.log("Database upgrade needed, creating object store:", SCORES_STORE);
      const db = event.target.result;
      if (!db.objectStoreNames.contains(SCORES_STORE)) {
        const store = db.createObjectStore(SCORES_STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('by_score', 'score', { unique: false });
        store.createIndex('by_date', 'date', { unique: false });
        store.createIndex('by_initials', 'initials', { unique: false });
        console.log("Object store created:", SCORES_STORE);
      }
    };
  });
}

export async function saveScore(playerData) {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.error('Database not initialized when trying to save score');
      reject(new Error("Database not initialized"));
      return;
    }
    
    console.log('Saving player data:', playerData);
    
    const transaction = db.transaction([SCORES_STORE], 'readwrite');
    const store = transaction.objectStore(SCORES_STORE);
    
    const score = {
      initials: playerData.initials,
      score: playerData.score,
      type: playerData.type,
      bonusTimeScore: playerData.bonusTimeScore || 0,
      correctAnswers: playerData.correctAnswers || 0,
      questionResponses: playerData.questionResponses || [],
      region: playerData.region || null,
      date: new Date().toISOString()
    };
    
    console.log('Prepared score object for saving:', score);
    
    const request = store.add(score);
    
    request.onsuccess = () => {
      console.log('Score saved successfully to IndexedDB with ID:', request.result);
      resolve(request.result);
    };
    request.onerror = (event) => {
      console.error('Error saving score to IndexedDB:', event.target.error);
      reject(request.error);
    };
    
    transaction.onerror = (event) => {
      console.error('Transaction error:', event.target.error);
      reject(event.target.error);
    };
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

export async function clearAllScores() {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("Database not initialized"));
      return;
    }
    
    const transaction = db.transaction([SCORES_STORE], 'readwrite');
    const store = transaction.objectStore(SCORES_STORE);
    
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function exportToCSV() {
  try {
    const allScores = await getAllScores();
    
    if (allScores.length === 0) {
      alert('No data to export');
      return;
    }
    
    // Get the maximum number of questions to create columns
    let maxQuestions = 0;
    allScores.forEach(score => {
      if (score.questionResponses && score.questionResponses.length > maxQuestions) {
        maxQuestions = score.questionResponses.length;
      }
    });
    
    // Create CSV headers - no initials or region
    const headers = [
      'Date',
      'Total Score',
      'Correct Answers',
      'Bonus Time Score',
      'Player Type'
    ];
    
    // Helper function to clean HTML tags and problematic characters
    function cleanText(text) {
      if (!text) return '';
      return text
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
        .replace(/&amp;/g, '&')  // Replace &amp; with &
        .replace(/&lt;/g, '<')   // Replace &lt; with <
        .replace(/&gt;/g, '>')   // Replace &gt; with >
        .replace(/"/g, '""')     // Escape quotes for CSV
        .trim();
    }
    
    // Add question columns dynamically with cleaned question text
    // First, collect unique questions from all responses
    const questionMap = new Map();
    allScores.forEach(score => {
      if (score.questionResponses) {
        score.questionResponses.forEach((response, index) => {
          if (response && response.questionText && !questionMap.has(index)) {
            // Clean and truncate question text to first 60 characters for header
            const cleanedText = cleanText(response.questionText);
            const truncatedText = cleanedText.length > 60 
              ? cleanedText.substring(0, 60) + '...'
              : cleanedText;
            questionMap.set(index, `Q${index + 1}: ${truncatedText}`);
          }
        });
      }
    });
    
    // Add question headers in order - properly quoted for CSV
    for (let i = 0; i < maxQuestions; i++) {
      const questionHeader = questionMap.get(i) || `Q${i + 1}: Question ${i + 1}`;
      // Always wrap question headers in quotes since they contain commas and colons
      headers.push(`"${questionHeader}"`);
    }
    
    // Create CSV rows
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    allScores.forEach(score => {
      const row = [
        `"${new Date(score.date).toLocaleString()}"`,
        score.score,
        score.correctAnswers || 0,
        score.bonusTimeScore || 0,
        score.type
      ];
      
      // Add question responses with cleaned answers
      const responses = score.questionResponses || [];
      for (let i = 0; i < maxQuestions; i++) {
        if (i < responses.length && responses[i]) {
          // Clean the selected answer and wrap in quotes if it contains commas
          const cleanAnswer = cleanText(responses[i].selectedAnswer || '');
          const formattedAnswer = cleanAnswer.includes(',') ? `"${cleanAnswer}"` : cleanAnswer;
          row.push(formattedAnswer);
        } else {
          row.push('');
        }
      }
      
      csvRows.push(row.join(','));
    });
    
    // Create and download CSV file
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `aldosterone-quiz-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw error;
  }
}