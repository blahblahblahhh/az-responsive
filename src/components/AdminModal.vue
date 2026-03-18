<template>
  <div v-if="showModal" class="admin-modal-overlay">
    <div class="admin-modal">
      <div class="modal-header">
        <h2>Admin Panel</h2>
        <div class="header-buttons">
          <button class="close-button" @click="closeModal">×</button>
        </div>
      </div>
      
      <div class="modal-content">
        <div class="admin-actions">
          <div class="admin-buttons">
            <button 
              class="admin-button clear-button"
              @click="clearLeaderboard"
            >
              Clear All Data
            </button>
            
            <button 
              class="admin-button export-button"
              @click="exportCSV"
            >
              Export CSV
            </button>
          </div>
          
          <div v-if="exportStatus" class="export-status">
            {{ exportStatus }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  showModal: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close', 'clearLeaderboard', 'exportCSV']);

const exportStatus = ref('');

function closeModal() {
  emit('close');
}

function clearLeaderboard() {
  if (confirm('Are you sure you want to clear all leaderboard data? This action cannot be undone.')) {
    emit('clearLeaderboard');
  }
}

async function testDatabase() {
  console.log('=== TESTING DATABASE ===');
  try {
    // Import the database functions directly for testing
    const { initDB, saveScore, getAllScores } = await import('../stores/db.js');
    
    console.log('Initializing database for test...');
    await initDB();
    
    console.log('Saving test score...');
    await saveScore({
      initials: 'TST',
      score: 999,
      type: 'test',
      bonusTimeScore: 10,
      correctAnswers: 5,
      questionResponses: [{ test: 'data' }],
      region: 'test'
    });
    
    console.log('Getting all scores...');
    const scores = await getAllScores();
    console.log('Found scores:', scores);
    
    exportStatus.value = `Test completed! Found ${scores.length} records.`;
  } catch (error) {
    console.error('Database test failed:', error);
    exportStatus.value = 'Test failed!';
  }
  
  setTimeout(() => {
    exportStatus.value = '';
  }, 5000);
}

async function exportCSV() {
  exportStatus.value = 'Exporting...';
  try {
    await emit('exportCSV');
    exportStatus.value = 'Export successful!';
    setTimeout(() => {
      exportStatus.value = '';
    }, 3000);
  } catch (error) {
    exportStatus.value = 'Export failed!';
    setTimeout(() => {
      exportStatus.value = '';
    }, 3000);
  }
}
</script>

<style scoped>
.admin-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.admin-modal {
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
  color: #003B45;
  font-family: 'Bebas Neue Pro', sans-serif;
  font-size: 32px;
}

.header-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.close-button {
  background: none;
  border: none;
  font-size: 32px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: #f0f0f0;
}

.modal-content p {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

/* Admin Actions Section */
.admin-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #e9ecef;
}

.admin-actions h3 {
  margin: 0 0 20px 0;
  font-family: 'Bebas Neue Pro', sans-serif;
  font-size: 24px;
  color: #003B45;
  text-align: center;
}

.admin-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.admin-button {
  background: #6c757d;
  border: none;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  padding: 12px 24px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
  min-width: 150px;
}

.admin-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.clear-button {
  background: #dc3545;
}

.clear-button:hover {
  background: #c82333;
}

.test-button {
  background: #007bff;
}

.test-button:hover {
  background: #0056b3;
}

.export-button {
  background: #28a745;
}

.export-button:hover {
  background: #218838;
}

.export-status {
  margin-top: 15px;
  text-align: center;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

@media (max-width: 768px) {
  .admin-buttons {
    flex-direction: column;
    gap: 15px;
  }
  
  .admin-button {
    min-width: auto;
  }
  
  .admin-modal {
    padding: 20px;
    margin: 20px;
  }
}
</style>