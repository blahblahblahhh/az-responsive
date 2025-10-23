import { defineStore } from 'pinia';
import { ref, computed, onMounted, nextTick } from 'vue';
import { initDB, saveScore, getTopScores } from './db'; // Import DB functions

// Questions data
const questions = [
  {
    id: 1,
    text: "What % of adults in the US with high blood pressure may have hard-to-control hypertension?",
    type: "multiple",
    options: ["~15%", "~30%", "~40%", "~50%"],
    correctAnswer: "~30%",
    explanation: "~30% of adults in the US with high blood pressure may have hard-to-control hypertension.",
    additionalInfo: "",
    finePrint: ""
  },
  {
    id: 2,
    text: "According to the 2023 AHA/ACC High Blood Pressure Guideline, what is the recommended BP target for most adults?",
    type: "multiple",
    options: ["<120/80 mm Hg", "<130/80 mm Hg", "<140/80 mm Hg", "<160/100 mm Hg"],
    correctAnswer: "<130/80 mm Hg",
    explanation: "According to the 2023 AHA/ACC High Blood Pressure Guideline, the recommended BP target for most adults is <130/80 mm Hg.",
    additionalInfo: "",
    finePrint: ""
  },
  {
    id: 3,
    text: "Having hard-to-control hypertension* and not at blood pressure goal more than doubles the risk of stroke.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "Having hard-to-control hypertension and not at blood pressure goal more than doubles the risk of stroke.",
    additionalInfo: "",
    finePrint: ""
  },
  {
    id: 4,
    text: "Having hard-to-control hypertension* and not at blood pressure goal nearly doubles the risk of MI.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "Having hard-to-control hypertension and not at blood pressure goal nearly doubles the risk of MI.",
    additionalInfo: "",
    finePrint: ""
  },
  {
    id: 5,
    text: "In the US, hypertension was a primary or contributing cause of death in _____ people in 2023.",
    type: "multiple",
    options: ["~ 100,000", "~ 250,000", "~ 400,000", "~ 600,000"],
    correctAnswer: "~ 600,000",
    explanation: "In the US, hypertension was a primary or contributing cause of death in ~ 600,000 people in 2023.",
    additionalInfo: "",
    finePrint: ""
  },
  {
    id: 6,
    text: "Every 10 mm Hg reduction in SBP significantly reduces the risk of major CV events, CHD, stroke, HF, and all-cause mortality.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "Every 10 mm Hg reduction in SBP significantly reduces the risk of major CV events, CHD, stroke, HF, and all-cause mortality.",
    additionalInfo: "",
    finePrint: ""
  },
  {
    id: 7,
    text: "Every 10 mm Hg reduction in systolic blood pressure significantly reduces the risk of major CV events by _____.",
    type: "multiple",
    options: ["5%", "10%", "20%", "100%"],
    correctAnswer: "20%",
    explanation: "Every 10 mm Hg reduction in systolic blood pressure significantly reduces the risk of major CV events by 20%.",
    additionalInfo: "",
    finePrint: ""
  },
  {
    id: 8,
    text: "Every 10 mm Hg reduction in SBP reduces the risk of stroke by _____.",
    type: "multiple",
    options: ["7%", "17%", "27%", "37%"],
    correctAnswer: "27%",
    explanation: "Every 10 mm Hg reduction in SBP reduces the risk of stroke by 27%.",
    additionalInfo: "",
    finePrint: ""
  },
  {
    id: 9,
    text: "Every 10 mm Hg reduction in SBP reduces the risk of heart failure by _____.",
    type: "multiple",
    options: ["8%", "18%", "28%", "38%"],
    correctAnswer: "28%",
    explanation: "Every 10 mm Hg reduction in SBP reduces the risk of heart failure by 28%.",
    additionalInfo: "",
    finePrint: ""
  },
  {
    id: 10,
    text: "Aldosterone plays an important role in regulating BP by regulating balance of sodium, potassium, and water.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "Aldosterone plays an important role in regulating BP by regulating balance of sodium, potassium, and water.",
    additionalInfo: "",
    finePrint: ""
  },
  {
    id: 11,
    text: "Excess circulating aldosterone contributes to inflammation and fibrosis of the heart, vasculature, and kidneys, leading to end-organ damage.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "Excess circulating aldosterone contributes to inflammation and fibrosis of the heart, vasculature, and kidneys, leading to end-organ damage.",
    additionalInfo: "",
    finePrint: ""
  },
  {
    id: 12,
    text: "Aldosterone production occurs in the ________.",
    type: "multiple",
    options: ["Adrenal glands", "Liver", "Small intestines", "Kidneys"],
    correctAnswer: "Adrenal glands",
    explanation: "Aldosterone production occurs in the adrenal glands.",
    additionalInfo: "",
    finePrint: ""
  },
  {
    id: 13,
    text: "Current treatment options can directly address aldosterone production.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "Current treatment options can directly address aldosterone production.",
    additionalInfo: "",
    finePrint: ""
  },
  {
    id: 14,
    text: "Existing therapies may cause a counterregulatory increase in aldosterone over time.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "Existing therapies may cause a counterregulatory increase in aldosterone over time.",
    additionalInfo: "",
    finePrint: ""
  },
  {
    id: 15,
    text: "Aldosterone can be a driving force behind hypertension.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "Aldosterone can be a driving force behind hypertension.",
    additionalInfo: "",
    finePrint: ""
  }
];

export const useGameStore = defineStore('game', () => {
  // Store the questions in their own ref
  const questionsList = ref([...questions]);
  
  // Added correctAnswers to track the number of correctly answered questions
  const state = ref({
    currentScreen: 'welcome',
    playerInitials: '',
    currentQuestionIndex: 0,
    score: 0,
    timeRemaining: 30,
    totalBonusTime: 0, // Track accumulated bonus time
    correctAnswers: 0, // Track number of correct answers
    selectedAnswer: null,
    showExplanation: false,
    showAdditionalInfo: false,
    showFinePrint: false,
    isFromResultsScreen: false
  });

  const timer = ref(null);
  const leaderboard = ref([]);
  let dbInitialized = false;

  const playerType = computed(() => {
    const score = state.value.score;
    if (score >= 1000) return 'expert';
    if (score >= 500) return 'scholar';
    return 'explorer';
  });

  const currentQuestion = computed(() => {
    // Log current state for debugging
    console.log('Computing current question:', {
      questionsList: questionsList.value,
      index: state.value.currentQuestionIndex,
    });
  
    // Early return if questions aren't loaded
    if (!questionsList.value?.length) return null;
  
    // Ensure index is valid
    const index = state.value.currentQuestionIndex;
    if (index < 0 || index >= questionsList.value.length) {
      console.warn(`Invalid question index: ${index}`);
      return questionsList.value[0]; // Default to first question
    }
  
    const question = questionsList.value[index];
    console.log('Returning question:', question);
    return question;
  });

  // Initialize the database
  async function initializeDatabase() {
    if (!dbInitialized) {
      try {
        await initDB();
        dbInitialized = true;
        console.log('Database initialized successfully');
        await loadLeaderboard(); // Load the leaderboard after DB init
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    }
  }

  async function loadLeaderboard() {
    try {
      const scores = await getTopScores();
      leaderboard.value = scores.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
      console.log('Leaderboard loaded:', leaderboard.value);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  }

  async function initializeQuestions() {
    console.log('Initializing questions...');
    
    // Reverting to original code that selects first 3 + random 4:
    const firstThree = questions.slice(0, 3);
    const remaining = questions.slice(3);
    const shuffled = remaining.sort(() => Math.random() - 0.5);
    const randomFour = shuffled.slice(0, 4);
    questionsList.value = [...firstThree, ...randomFour];
    
    // The temporary code that kept first 3 and added all remaining:
    /*
    const firstThree = questions.slice(0, 3);
    const remaining = questions.slice(3);
    questionsList.value = [...firstThree, ...remaining];
    */
    
    await nextTick();
    console.log('Questions initialized:', questionsList.value);
    return questionsList.value;
  }

  function startTimer() {
    stopTimer();
    state.value.timeRemaining = 30;
    timer.value = setInterval(() => {
      if (state.value.timeRemaining > 0) {
        state.value.timeRemaining--;
      } else {
        clearInterval(timer.value);
        handleAnswerSubmit(null);
      }
    }, 1000);
  }

  function stopTimer() {
    if (timer.value) {
      clearInterval(timer.value);
      timer.value = null;
    }
  }

  function handleAnswerSubmit(answer) {
    stopTimer();
    state.value.selectedAnswer = answer;
    state.value.showExplanation = true;
    
    if (answer === currentQuestion.value?.correctAnswer) {
      // Increment correct answers count
      state.value.correctAnswers++;
      
      // Calculate bonus time from this question
      const questionBonusTime = Math.max(0, state.value.timeRemaining);
      
      // Add to accumulated total bonus time
      state.value.totalBonusTime += questionBonusTime;
      
      // 150 base points for correct answer, plus bonus points based on remaining time
      state.value.score += 150 + questionBonusTime;
    }
  }

  function nextQuestion() {
    if (!questionsList.value || questionsList.value.length === 0) {
      console.error('No questions available');
      return;
    }

    state.value.showExplanation = false;
    state.value.showAdditionalInfo = false;
    state.value.showFinePrint = false;
    state.value.selectedAnswer = null;
    
    if (state.value.currentQuestionIndex < questionsList.value.length - 1) {
      state.value.currentQuestionIndex++;
      startTimer();
    } else {
      stopTimer();
      state.value.currentScreen = 'result';
      addToLeaderboard();
    }
  }

  // Updated to include correctAnswers in the leaderboard entry
  async function addToLeaderboard() {
    const entry = {
      initials: state.value.playerInitials || 'AAA',
      score: state.value.score,
      type: playerType.value,
      bonusTimeScore: state.value.totalBonusTime, // Use the accumulated total bonus time
      correctAnswers: state.value.correctAnswers, // Add correct answers count
      date: new Date().toISOString()
    };
    
    try {
      await saveScore(entry);
      await loadLeaderboard(); // Refresh the leaderboard after adding a new score
    } catch (error) {
      console.error('Error saving score:', error);
      // Fallback to in-memory leaderboard if database fails
      leaderboard.value.push(entry);
      leaderboard.value.sort((a, b) => b.score - a.score);
      leaderboard.value.forEach((entry, index) => {
        entry.rank = index + 1;
      });
    }
  }

  function toggleFinePrint() {
    state.value.showFinePrint = !state.value.showFinePrint;
  }

  function viewLeaderboardFromResults() {
    state.value.isFromResultsScreen = true;
    state.value.currentScreen = 'leaderboard';
  }

  function resetGame() {
    stopTimer();
    state.value = {
      currentScreen: 'welcome',
      playerInitials: '',
      currentQuestionIndex: 0,
      score: 0,
      timeRemaining: 30,
      totalBonusTime: 0, // Reset the accumulated bonus time
      correctAnswers: 0, // Reset the correct answers counter
      selectedAnswer: null,
      showExplanation: false,
      showAdditionalInfo: false,
      showFinePrint: false,
      isFromResultsScreen: false
    };
    initializeQuestions();
  }

  // Initialize database and questions when store is created
  initializeDatabase();
  initializeQuestions();

  return {
    state,
    questionsList,
    currentQuestion,
    playerType,
    leaderboard,
    initializeQuestions,
    initializeDatabase,
    loadLeaderboard,
    startTimer,
    stopTimer,
    handleAnswerSubmit,
    nextQuestion,
    resetGame,
    toggleFinePrint,
    viewLeaderboardFromResults
  };
});