import { defineStore } from 'pinia';
import { ref, computed, onMounted, nextTick } from 'vue';
import { initDB, saveScore, getTopScores } from './db'; // Import DB functions

// Questions data
const questions = [
  {
    id: 1,
    text: "What % of adults in the US with high blood pressure may have hard-to-control hypertension?",
    type: "multiple",
    options: ["~15%", "~30%", "~50%", "~90%"],
    correctAnswer: "~50%",
    explanation: "~50% of adults with high blood pressure may not be at goal (<130/80 mm Hg) despite taking 2+ antihypertensives of different classes<sup>1†</sup>",
    additionalInfo: "<b>Abbreviations:</b> aTRH=apparent treatment-resistant hypertension; AHA=American Heart Association; BP=blood pressure; HTN=hypertension; US=United States.<br><br><b>Reference:</b>  <b>1.</b> Carey RM, Sakhuja S, Calhoun DA, Whelton PK, Muntner P. Prevalence of apparent treatment-resistant hypertension in the United States [including online supplement]. <i>Hypertension.</i> 2019;73(2):424-431.",
    finePrint: "<span class='sup-asterisk'>Hard-to-control hypertension is defined as a patient with hypertension, not at goal (<130/80 mm Hg), and taking 2+ antihypertensives.</span><br><span class='sup-cross'>Based on an analysis of data from the 2009-2014 US National Health and Nutrition Examination Survey (NHANES). Analysis was restricted to participants aged ≥20 years who self-reported taking antihypertensive medication, had ≥1 class of antihypertensive medication identified during a pill bottle review conducted as part of the NHANES examination, and had ≥3 BP measurements obtained during their study exam (N=4158). The primary purpose of the study was to compare the prevalence and characteristics of adults with aTRH using the definitions in the 2018 versus the 2008 AHA Scientific Statement. The data used above are based on the definition of uncontrolled HTN (defined as BP ≥130/80 mm Hg) from the 2018 AHA Scientific Statement.</span>"
  },
  {
    id: 2,
    text: "According to the 2025 AHA/ACC High Blood Pressure Guideline, what is the recommended BP target for most adults?",
    type: "multiple", 
    options: ["<120/80 mm Hg", "<130/80 mm Hg", "<140/80 mm Hg", "<160/100 mm Hg"],
    correctAnswer: "<130/80 mm Hg",
    explanation: "According to the 2025 AHA/ACC High Blood Pressure Guideline, a BP of <130/80 mm Hg is recommended for most patients<sup>1*</sup>",
    additionalInfo: "<b>Abbreviations:</b> ACC=American College of Cardiology; AHA=American Heart Association; BP=blood pressure; COR=Class of Recommendation; CVD=cardiovascular disease; DBP=diastolic blood pressure; LOE=Level of Evidence; NR=nonrandomized; PREVENT=Predicting Risk of Cardiovascular Disease EVENTs; RCT=randomized controlled trial; SBP=systolic blood pressure.<br><br><b>Reference:</b>  <b>1.</b> Jones DW, Ferdinand KC, Taler SJ, et al. 2025 AHA/ACC/AANP/AAPA/ABC/ACCP/ACPM/AGS/AMA/ASPC/NMA/PCNA/SGIM guideline for the prevention, detection, evaluation, and management of high blood pressure in adults: a report of the American College of Cardiology/American Heart Association Joint Committee on Clinical Practice Guidelines. <i>J Am Coll Cardiol.</i> Published online August 14, 2025. doi:10.1016/j.jacc.2025.05.007",
    finePrint: "<span class='sup-asterisk'>An SBP goal of <130 mm Hg is a COR 1 recommendation, with LOE A, for adults with confirmed hypertension who are at increased risk for CVD. An SBP goal of <130 mm Hg is a COR 2b recommendation, with LOE B-NR, for adults with confirmed hypertension who are not at increased risk for CVD. An SBP goal of <120 mm Hg is encouraged for both groups of patients. A DBP goal of <80 mm Hg is a COR 1 recommendation, with LOE B-NR, for adults with confirmed hypertension who are at increased risk for CVD. A DBP goal of <80 mm Hg is a COR 2b recommendation, with LOE B-NR, for adults with confirmed hypertension who are not at increased risk for CVD. Increased risk is defined as a 10-year predicted risk for CVD events of ≥7.5% using PREVENT. COR 1 is a strong recommendation, while 2b is a weak recommendation. LOE A is derived from high-quality evidence from >1 RCT or meta-analysis; LOE B-NR is derived from moderate quality of evidence from multiple NR studies or meta-analysis of such studies; LOE B-R is derived from moderate quality of evidence from ≥1 RCT or meta-analysis.</span>"
  },
  {
    id: 3,
    text: "Having hard-to-control hypertension* and not at blood pressure goal more than doubles the risk of stroke",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "Based on a recent real-world evidence study, US adults with hypertension not at goal (<130/80 mm Hg) despite treatment with 2+ antihypertensives had a 2.17x increased risk of stroke compared to those at goal<sup>1†</sup>",
    additionalInfo: "<b>Abbreviations:</b> aHR=adjusted hazard ratio; BP=blood pressure; CI=confidence interval; EMR=electronic medical record; HTN=hypertension; HR=hazard ratio; US=United States.<br><br></br><b>Reference:</b> <b>1.</b> McCormack T, Suárez Fernández C, Bhalla V, et al. Risk of cardiorenal and metabolic outcomes in inadequately controlled hypertension: insights from the EnligHTN study. Poster presented at: European Society of Cardiology (ESC) Congress; August 29-September 1, 2025; Madrid, Spain.",
    preFinePrint: "<span class='sup-asterisk'>Hard-to-control hypertension is defined as a patient with hypertension, not at goal (<130/80 mm Hg), and taking 2+ antihypertensives.</span>",
    finePrint: "<span class='sup-cross'>EnligHTN is an observational, longitudinal, multinational, cohort study of over 240,000 patients with HTN that assessed clinical characteristics and real-world disease burden in patients with controlled or inadequately controlled HTN using secondary de-identified claims and EMR data of patients with HTN in the US from IQVIA ambulatory EMRs linked with IQVIA PharMetrics® Plus claims. Patient characteristics were summarized by country. Patients were included if they were ≥18 years of age, diagnosed with HTN between 2018 and 2023, treated with ≥2 antihypertensive medications for ≥30 days, and had ≥1 day of follow-up. Patients were excluded if they had secondary causes of HTN. In US patients (N=41,994), controlled HTN (n=12,864; 31%) was defined as BP <130/80 mm Hg and inadequately controlled HTN (n=29,130; 69%) was defined as BP >130/80 mm Hg while concurrently treated with ≥2 antihypertensive medications for ≥30 days from index date. Hazard ratios adjusted for disease risk score for stroke (aHR 2.17; 95% CI: 1.79-2.64).</span>"
  },
  {
    id: 4,
    text: "Having hard-to-control hypertension* and not at blood pressure goal nearly doubles the risk of MI.",
    type: "boolean",
    options: ["True", "False"], 
    correctAnswer: "True",
    explanation: "Based on a recent real-world evidence study, US adults with hypertension not a goal (<130/80 mm Hg) despite treatment with 2+ antihypertensives had a 1.78x increased risk of MI compared to those not at goal<sup>1†</sup>",
    additionalInfo: "<b>Abbreviations:</b> BP=blood pressure; CI=confidence interval; EMR=electronic medical record; HTN=hypertension; HR=hazard ratio; MI=myocardial infarction; US=United States.<br><br></br><b>Reference:</b> <b>1.</b> McCormack T, Suárez Fernández C, Bhalla V, et al. Risk of cardiorenal and metabolic outcomes in inadequately controlled hypertension: insights from the EnligHTN study. Poster presented at: European Society of Cardiology (ESC) Congress; August 29-September 1, 2025; Madrid, Spain. ",
    preFinePrint:"<span class='sup-asterisk'>Hard-to-control hypertension is defined as a patient with hypertension, not at goal (<130/80 mm Hg), and taking 2+ antihypertensives.</span>",
    finePrint: "<span class='sup-cross'>EnligHTN is an observational, longitudinal, multinational, cohort study of over 240,000 patients with HTN that assessed clinical characteristics and real-world disease burden in patients with controlled or inadequately controlled HTN using secondary de-identified claims and EMR data of patients with HTN in the US from IQVIA ambulatory EMRs linked with IQVIA PharMetrics® Plus claims. Patient characteristics at index date were summarized by country. Patients were included if they were ≥18 years of age, diagnosed with HTN between 2018 and 2023, treated with ≥2 antihypertensive medications for ≥30 days, and had ≥1 day of follow-up. Patients were excluded if they had secondary causes of HTN. In US patients (N=41,994), controlled HTN (n=12,864; 31%) was defined as BP <130/80 mm Hg and inadequately controlled HTN (n=29,130; 69%) was defined as BP >130/80 mm Hg while concurrently treated with ≥2 antihypertensive medications for ≥30 days from index date. Hazard ratios adjusted for disease risk score for MI (HR 1.78; 95% CI: 1.48-2.12).</span>"
  },
  {
    id: 5,
    text: "In the US, hypertension was a primary or contributing cause of death in _____ people in 2023.",
    type: "multiple",
    options: ["~ 100,000", "~ 250,000", "~ 400,000", "~ 600,000"],
    correctAnswer: "~ 600,000", 
    explanation: "According to the CDC, in 2023, high blood pressure was a primary or contributing cause of 664,470 deaths in the US<sup>1</sup>",
    additionalInfo: "<b>Abbreviations:</b> CDC=Centers for Disease Control and Prevention; US=United States.<br><br><b>Reference:</b> <b>1.</b> Centers for Disease Control and Prevention. High blood pressure facts. Updated July 3, 2024. Accessed September 8, 2025. https://www.cdc.gov/high-blood-pressure/data-research/facts-stats/index.html",
    finePrint: ""
  },
  {
    id: 6,
    text: "Every 10 mm Hg reduction in SBP significantly reduces the risk of major CV events, CHD, stroke, HF, and all-cause mortality.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "Every 10 mm Hg reduction in SBP significantly reduces the risk of major CV events, CHD, stroke, HF, and all-cause mortality<sup>1*</sup>",
    additionalInfo: "<b>Abbreviations:</b> CHD=coronary heart disease; CI=confidence interval; CV=cardiovascular; HF=heart failure; RR=relative risk; SBP=systolic blood pressure.<br><br><b>Reference:</b> <b>1.</b> Ettehad D, Emdin CA, Kiran A, et al. Blood pressure lowering for prevention of cardiovascular disease and death: a systematic review and meta-analysis. <i>Lancet</i>. 2016;387(10022):957-967.",
    finePrint: "<span class='sup-asterisk'>Meta-analysis of 123 studies with 613,815 participants. Every 10 mm Hg reduction in systolic blood pressure significantly reduced the risk of major CV events (RR 0.80; 95% CI: 0.77-0.83), CHD (RR 0.83; 95% CI: 0.78-0.88), stroke (RR 0.73; 95% CI: 0.68-0.77), HF (RR 0.72; 95% CI: 0.67-0.78), and all-cause mortality (RR 0.87; 95% CI: 0.84-0.91).</span>"
  },
  {
    id: 7,
    text: "Every 10 mm Hg reduction in systolic blood pressure significantly reduces the risk of major CV events by _____.",
    type: "multiple",
    options: ["5%", "10%", "20%", "100%"],
    correctAnswer: "20%",
    explanation: "Every 10 mm Hg reduction in SBP reduces the risk of major CV events by 20%<sup>1*</sup>", 
    additionalInfo: "<b>Abbreviations:</b> Cl=confidence interval; CV=cardiovascular; RR=relative risk; SBP=systolic blood pressure.<br><br><b>Reference:</b> <b>1.</b> Ettehad D, Emdin CA, Kiran A, et al. Blood pressure lowering for prevention of cardiovascular disease and death: a systematic review and meta-analysis. <i>Lancet</i>. 2016;387(10022):957-967.",
    finePrint: "<span class='sup-asterisk'>Meta-analysis of 123 studies with 613,815 participants. Major CV events are defined as fatal and non-fatal myocardial infarction, sudden cardiac death, revascularization, fatal and non-fatal stroke, and fatal and non-fatal heart failure. Every 10 mm Hg reduction in SBP significantly reduced the risk of major CV events (RR 0.80, 95% CI: 0.77-0.83).</span>"
  },
  {  
    id: 8,
    text: "Every 10 mm Hg reduction in SBP reduces the risk of stroke by _____.",
    type: "multiple",
    options: ["7%", "17%", "27%", "37%"],
    correctAnswer: "27%",
    explanation: "Every 10 mm Hg reduction in SBP reduces the risk of stroke by 27%<sup>1*</sup>",
    additionalInfo: "<b>Abbreviations:</b> BP=blood pressure; Cl=confidence interval; CV=cardiovascular; RR=relative risk; SBP=systolic blood pressure; TIA=transient ischemic attack.<br><Br><b>Reference:</b> <b>1.</b> Ettehad D, Emdin CA, Kiran A, et al. Blood pressure lowering for prevention of cardiovascular disease and death: a systematic review and meta-analysis. <i>Lancet</i>. 2016;387(10022):957-967.",
    finePrint: "<span class='sup-asterisk'>Systematic review and meta-analysis of 123 randomized trials (published between 1966 and 2015) evaluated the effects of BP lowering on CV disease and mortality across various baseline BP levels and comorbidities in 613,815 participants. Data were extracted for stroke (fatal and nonfatal, excluding TIA) 27% (RR=0.73; 95% CI: 0.68-0.77).<span>"
  },
  {
    id: 9,
    text: "Every 10 mm Hg reduction in SBP reduces the risk of heart failure by _____.",
    type: "multiple", 
    options: ["8%", "18%", "28%", "38%"],
    correctAnswer: "28%",
    explanation: "Every 10 mm Hg reduction in SBP reduces the risk of heart failure by 28%<sup>1*</sup>",
    additionalInfo: "<b>Abbreviations:</b> BP=blood pressure; Cl=confidence interval; CV=cardiovascular; RR=relative risk; SBP=systolic blood pressure.<br><br><b>Reference:</b> <b>1.</b> Ettehad D, Emdin CA, Kiran A, et al. Blood pressure lowering for prevention of cardiovascular disease and death: a systematic review and meta-analysis. <i>Lancet</i>. 2016;387(10022):957-967.",
    finePrint: "<span class='sup-asterisk'>Systematic review and meta-analysis of 123 randomized trials (published between 1966 and 2015) evaluated the effects of BP lowering on CV disease and mortality across various baseline BP levels and comorbidities in 613,815 participants. Data were extracted for HF (new diagnosis of HF, hospital admission, or death) 28% (RR=0.72; 95% CI: 0.67-0.78)</span>"
  },
  {
    id: 10,
    text: "Aldosterone plays an important role in regulating BP by regulating balance of sodium, potassium, and water.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "Under normal physiology, aldosterone plays an important role in controlling BP by regulating balance of sodium, potassium, and water<sup>1-3</sup>",
    additionalInfo: "<b>Abbreviations:</b> BP=blood pressure.<br><br><b>References:</b> <b>1.</b> Scott JH, Menouar MA, Dunn RJ. Physiology, aldosterone. StatPearls [internet]. Updated May 1, 2023. Accessed August 25, 2025. https://www.ncbi.nlm.nih.gov/books/NBK470339/ <b>2.</b> Fountain JH, Kaur J, Lappin SL. Physiology, renin angiotensin system. StatPearls [internet]. Updated March 12, 2023. Accessed August 25, 2025. https://www.ncbi.nlm.nih.gov/books/NBK470410/ <b>3.</b> Hargovan M, Ferro A. Aldosterone synthase inhibitors in hypertension: current status and future possibilities. <i>JRSM Cardiovasc Dis.</i> 2014;3:2048004014522440.",
    finePrint: ""
  },
  {
    id: 11,
    text: "Excess circulating aldosterone contributes to inflammation and fibrosis of the heart, vasculature, and kidneys, leading to end-organ damage.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "Excess circulating aldosterone contributes to inflammation and fibrosis of the heart, vasculature, and kidneys, leading to end-organ damage<sup>1,2</sup>",
    additionalInfo: "<b>References:</b> <b>1.</b> Lin X, Ullah MHE, Wu X, et al. Cerebro-cardiovascular risk, target organ damage, and treatment outcomes in primary aldosteronism. <i>Front Cardiovasc Med.</i> 2022;8:798364. <b>2.</b> Brown JM. Adverse effects of aldosterone: beyond blood pressure. <i>J Am Heart Assoc.</i> 2024;13(7):e030142.",
    finePrint: ""
  },
  {
    id: 12,
    text: "Aldosterone production occurs in the ________.",
    type: "multiple",
    options: ["Adrenal glands", "Liver", "Small intestines", "Kidneys"],
    correctAnswer: "Adrenal glands",
    explanation: "Aldosterone production occurs in the adrenal glands<sup>1</sup>",
    additionalInfo: "<b>Reference:</b> <b>1.</b> Crompton M, Skinner LJ, Satchell SC, et al. Aldosterone: essential for life but damaging to the vascular endothelium. <i>Biomolecules.</i> 2023;13(6):1004.",
    finePrint: ""
  },
  {
    id: 13,
    text: "Current treatment options can directly address aldosterone production.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "False",
    explanation: "Existing therapies do not directly target aldosterone synthesis and do not fully address the effects of excess aldosterone<sup>1</sup>",
    additionalInfo: "<b>Reference:</b>  <b>1.</b> Leopold JA, Ingelfinger JR. Aldosterone and Treatment-Resistant Hypertension. <i>N Engl J Med.</i> 2023;388(5):464-467. ",
    finePrint: ""
  },
  {
    id: 14,
    text: "Existing therapies may cause a counterregulatory increase in aldosterone over time.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "MRAs have been associated with increased levels of aldosterone and may also induce a renin-dependent, counterregulatory increase in aldosterone levels<sup>1-3</sup> <br>\nACEi/ARBs may not uniformly suppress RAAS, with some patients (10%-53%) experiencing increases in serum aldosterone over time, a phenomenon known as aldosterone breakthrough<sup>4</sup>",
    additionalInfo: "<b>Abbreviations:</b> ACEi=angiotensin-converting enzyme inhibitor; ARB=angiotensin receptor blocker; MRA=mineralocorticoid receptor antagonist; RAAS=renin-angiotensin-aldosterone system.<br><br><b>References:</b> <b>1.</b> Kobayashi M, Stienen S, Ter Maaten JM, et al. Clinical determinants and prognostic implications of renin and aldosterone in patients with symptomatic heart failure. <i>ESC Heart Fail.</i> 2020;7(3):953-963. <b>2.</b> Azizi M. Decreasing the effects of aldosterone in resistant hypertension — a success story. <i>N Engl J Med.</i> 2023;388(5):461-463. <b>3.</b> Agarwal R, Kolkhof P, Bakris GL, et al. Steroidal and non-steroidal mineralocorticoid receptor antagonists in cardiorenal medicine. <i>Eur Heart J.</i> 2021;42(2):152-161. <b>4.</b> Bomback AS, Klemmer PJ. The incidence and implications of aldosterone breakthrough. <i>Nat Clin Pract Nephrol.</i> 2007;3(9):486-492.",
    finePrint: ""
  },
  {
    id: 15,
    text: "Aldosterone can be a driving force behind hypertension",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "While it does play an important role in controlling BP, aldosterone can also lead to elevated BP<sup>1</sup>",
    additionalInfo: "<b>Abbreviation:</b> BP=blood pressure.<br><br><b>Reference:</b> <b>1.</b> Crompton M, Skinner LJ, Satchell SC, Butler MJ. Aldosterone: essential for life but damaging to the vascular endothelium. <i>Biomolecules.</i> 2023;13(6):1004.", 
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
    //</br>const firstThree = questions.slice(0, 3);
    //const remaining = questions.slice(3);
    //const shuffled = remaining.sort(() => Math.random() - 0.5);
    //const randomFour = shuffled.slice(0, 4);
    //questionsList.value = [...firstThree, ...randomFour];
    
    // The temporary code that kept first 3 and added all remaining:
    const firstThree = questions.slice(0, 3);
    const remaining = questions.slice(3);
    questionsList.value = [...firstThree, ...remaining];
    
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