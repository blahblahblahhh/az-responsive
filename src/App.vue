<template>
  <div class="app">
    <component
      :is="currentComponent"
      v-bind="getComponentProps()"
      @startQuiz="handleStartQuiz"
      @continue="handleContinue"
      @back="handleBack"
      @startGame="handleStartGame"
      @answer="handleAnswer"
      @next="handleNext"
      @viewLeaderboard="handleViewLeaderboard"
      @playAgain="resetGame"
    />
  </div>
  <div class="az-footer">
    <span v-if="currentComponent === WelcomeScreen">©2025 AstraZeneca. All rights reserved. US-103694 Last Updated 10/25</span>
    <span class="az-logo" v-if="currentComponent != LeaderboardScreen && currentComponent != ResultScreen">
      <img src="/AZLOGO.png">
    </span>
  </div>
</template>

<script setup>
import { computed, onMounted, nextTick, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore } from './stores/game';
import WelcomeScreen from './components/WelcomeScreen.vue';
import InitialsScreen from './components/InitialsScreen.vue';
import CountdownScreen from './components/CountdownScreen.vue';
import QuestionScreen from './components/QuestionScreen.vue';
import ResultScreen from './components/ResultScreen.vue';
import LeaderboardScreen from './components/LeaderboardScreen.vue';

const gameStore = useGameStore();
const { state, currentQuestion, playerType, leaderboard, questionsList } = storeToRefs(gameStore);
const isLoading = ref(false);

// Initialize questions when the app starts
onMounted(() => {
  console.log('App mounted - initializing questions');
  gameStore.initializeQuestions();
});

const currentComponent = computed(() => {
  switch (state.value.currentScreen) {
    case 'welcome':
      return WelcomeScreen;
    case 'initials':
      return InitialsScreen;
    case 'countdown':
      return CountdownScreen;
    case 'question':
      return QuestionScreen;
    case 'result':
      return ResultScreen;
    case 'leaderboard':
      return LeaderboardScreen;
    default:
      return WelcomeScreen;
  }
});

// Update the getComponentProps function to include correctAnswers for question screen
function getComponentProps() {
  const commonProps = {
    playerInitials: state.value.playerInitials,
    score: state.value.score,
    playerType: playerType.value,
    leaderboard: leaderboard.value,
    correctAnswers: state.value.correctAnswers, // Add to common props so all screens can use it
  };

  // Add special props for result screen
  if (state.value.currentScreen === 'result') {
    return {
      ...commonProps,
      bonusTimeScore: state.value.bonusTimeScore || 0
    };
  }

  // Add isFromResultsScreen prop for leaderboard
  if (state.value.currentScreen === 'leaderboard') {
    return {
      ...commonProps,
      currentPlayer: {
        initials: state.value.playerInitials,
        score: state.value.score,
        type: playerType.value,
        correctAnswers: state.value.correctAnswers // Also add to current player object
      },
      isFromResultsScreen: state.value.isFromResultsScreen
    };
  }

  if (state.value.currentScreen === 'question') {
    const question = currentQuestion.value;
    console.log('Current question in getComponentProps:', question);
    
    // Only return question props if we have a valid question
    if (question) {
      return {
        ...commonProps,
        question,
        currentQuestionIndex: state.value.currentQuestionIndex,
        timeRemaining: state.value.timeRemaining,
        selectedAnswer: state.value.selectedAnswer,
        showExplanation: state.value.showExplanation,
        showAdditionalInfo: state.value.showAdditionalInfo,
      };
    } else {
      console.error('No valid question available');
      // Reinitialize questions and try again
      gameStore.initializeQuestions();
      const retryQuestion = currentQuestion.value;
      if (retryQuestion) {
        return {
          ...commonProps,
          question: retryQuestion,
          currentQuestionIndex: state.value.currentQuestionIndex,
          timeRemaining: state.value.timeRemaining,
          selectedAnswer: state.value.selectedAnswer,
          showExplanation: state.value.showExplanation,
          showAdditionalInfo: state.value.showAdditionalInfo,
        };
      }
      // If still no question, return to welcome screen
      state.value.currentScreen = 'welcome';
      return commonProps;
    }
  }

  return commonProps;
}

function handleStartQuiz() {
  state.value.currentScreen = 'countdown';
}

function handleContinue(initials) {
  state.value.playerInitials = initials;
  state.value.currentScreen = 'countdown';
}

function handleBack() {
  state.value.currentScreen = 'welcome';
}

async function handleStartGame() {
  console.log('Handling start game');
  isLoading.value = true;
  
  try {
    // Initialize questions and wait for them to be ready
    await gameStore.initializeQuestions();
    
    // Reset question index
    state.value.currentQuestionIndex = 0;
    await nextTick();

    // Verify questions are loaded
    if (!questionsList.value?.length) {
      throw new Error('Questions failed to load');
    }

    // Get current question
    const question = currentQuestion.value;
    console.log('Current question:', question);

    if (!question) {
      throw new Error('Current question is undefined');
    }

    // Proceed with game
    state.value.currentScreen = 'question';
    gameStore.startTimer();
  } catch (error) {
    console.error('Error starting game:', error);
    state.value.currentScreen = 'welcome';
  } finally {
    isLoading.value = false;
  }
}

function handleAnswer(answer) {
  gameStore.handleAnswerSubmit(answer);
}

function handleNext() {
  gameStore.nextQuestion();
}

// Updated to handle leaderboard view from different contexts
function handleViewLeaderboard() {
  // If coming from results screen, use the special function
  if (state.value.currentScreen === 'result') {
    gameStore.viewLeaderboardFromResults();
  } else {
    // If viewing from elsewhere, make sure the flag is false
    state.value.isFromResultsScreen = false;
    state.value.currentScreen = 'leaderboard';
  }
}

function resetGame() {
  gameStore.resetGame();
}
</script>

<style>
/* Fix for mobile viewport height issues */
html, body {
  height: 100%;
  overflow-x: hidden;
}

.app {
  min-height: 100dvh; /* Dynamic viewport height for mobile */
  background-color: var(--background-color);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.az-footer {
    position: absolute;
    bottom: 0;
    z-index: 10;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: clamp(1rem, 3vw, 2rem) clamp(1rem, 8vw, 6.5rem);
    font-size: 11px;
}

@media (max-width: 768px) {
  .az-footer {
    flex-direction: column-reverse;
    align-items: center;
    gap: 0.5rem;
    font-size: 9px;
  }
  
  .az-logo {
    margin-left: 0;
  }
}

.az-logo {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.az-logo img {
  width: clamp(120px, 15vw, 206.757px);
  height: clamp(30px, 4vw, 51px);
  flex-shrink: 0;
}
</style>