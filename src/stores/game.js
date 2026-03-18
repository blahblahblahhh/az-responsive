import { defineStore } from 'pinia';
import { ref, computed, onMounted, nextTick } from 'vue';
import { initDB, saveScore, getTopScores } from './db.js'; // Import DB functions

// Questions data
const questions = [
  {
    id: 1,
    text: "According to the 2025 AHA/ACC Guideline, what is the recommended blood pressure goal for most adults with hypertension?",
    type: "multiple",
    options: ["<span class='no-wrap'><120/80 mm Hg</span>", "<span class='no-wrap'><130/80 mm Hg</span>", "<span class='no-wrap'><140/90 mm Hg</span>", "<span class='no-wrap'><160/100 mm Hg</span>"],
    correctAnswer: "<span class='no-wrap'><130/80 mm Hg</span>",
    explanation: "The 2025 AHA/ACC Guideline recommends a blood pressure goal of <span class='no-wrap'><130/80 mm Hg</span> for most adults with hypertension to help reduce the risk of CV events and all-cause mortality. It is recommended to encourage an SBP of <span class='no-wrap'><120 mm Hg</span> in adults at increased risk for CVD events.*",
    additionalInfo: "<b>Abbreviations:</b>  ACC=American College of Cardiology; AHA=American Heart Association; COR=Class of Recommendation; CV=cardiovascular; CVD=cardiovascular disease; DBP=diastolic blood pressure; HTN=hypertension; LOE=level of evidence; NR=nonrandomized; PREVENT=Predicting Risk of Cardiovascular Disease EVENTs; R=randomized; RCT=randomized controlled trial; SBP=systolic blood pressure.<br><br><b>Reference:</b> Jones DW, Ferdinand KC, Taler SJ, et al; Peer Review Committee Members. 2025 AHA/ACC/AANP/AAPA/ABC/ACCP/ACPM/AGS/AMA/ASPC/NMA/PCNA/SGIM guideline for the prevention, detection, evaluation, and management of high blood pressure in adults: a report of the American College of Cardiology/American Heart Association Joint Committee on Clinical Practice Guidelines. <i>J Am Coll Cardiol</i>. 2025;86(18):1567-1678. ",
    finePrint: "<span class='sup-asterisk'>An SBP goal of <span class='no-wrap'><130 mm Hg</span> is a COR 1 recommendation, with LOE A, for adults with confirmed hypertension who are at increased risk for CVD. An SBP goal of <span class='no-wrap'><130 mm Hg</span> is a COR 2b recommendation, with LOE B-NR, for adults with confirmed hypertension who are not at increased risk for CVD. For patients at increased risk, it is recommended to encourage an SBP goal of <span class='no-wrap'>120 mm Hg</span>, while for those not at increased risk, it may be reasonable to encourage a goal of <span class='no-wrap'><120 mm Hg</span>. A DBP goal of <span class='no-wrap'><80 mm Hg</span> is a COR 1 recommendation, with LOE B-R, for adults with confirmed hypertension who are at increased risk for CVD. A DBP goal of <span class='no-wrap'><80 mm Hg</span> is a COR 2b recommendation, with LOE B-NR, for adults with confirmed hypertension who are not at increased risk for CVD. Increased risk is defined as a 10-year predicted risk for CVD events of ≥7.5% using PREVENT. COR 1 is a strong recommendation, while 2b is a weak recommendation. LOE A is derived from high-quality evidence from >1 RCT, or meta-analysis of high-quality RCTs, or ≥1 RCTs corroborated by high-quality registry studies; LOE B-R is derived from moderate quality of evidence from ≥1 RCT or meta-analysis of moderate-quality RCTs; LOE B-NR is derived from moderate quality of evidence from 1 or more well-designed, well-executed nonrandomized studies, observational studies, registry studies or meta-analysis of such studies.</span>"
  },
  {
    id: 2,
    text: "How many adults in the US may have uncontrolled hypertension (<span class='no-wrap'>BP ≥130/80 mm Hg)</span> even with ≥2 antihypertensives?",
    type: "multiple", 
    options: ["~1 in 10", "~3 in 10", "~1 in 2", "~9 in 10"],
    correctAnswer: "~1 in 2",
    explanation: "~1 in 2 adults in the US with hypertension may be uncontrolled (<span class='no-wrap'>≥130/80 mm Hg</span>) despite taking 2 or more antihypertensives of different classes.*",
    additionalInfo: "<b>Abbreviations:</b> AHA=American Heart Association; aTRH=apparent treatment-resistant hypertension; BP=blood pressure; HTN=hypertension; US=United States.<br><br><b>Reference:</b> Carey RM, Sakhuja S, Calhoun DA, Whelton PK, Muntner P. Prevalence of apparent treatment-resistant hypertension in the United States [including online supplement]. <i>Hypertension</i>. 2019;73(2):424-431.",
    finePrint: "<span class='sup-asterisk'>Based on an analysis of data from the 2009-2014 US National Health and Nutrition Examination Survey (NHANES). Analysis was restricted to participants aged ≥20 years who self-reported taking antihypertensive medication, had ≥1 class of antihypertensive medication identified during a pill bottle review conducted as part of the NHANES examination, and had ≥3 BP measurements obtained during their study exam (N=4158). The primary purpose of the study was to compare the prevalence and characteristics of adults with aTRH using the definitions in the 2018 versus the 2008 AHA Scientific Statement. The data used above are based on the definition of uncontrolled HTN (defined as BP <span class='no-wrap'>≥130/80 mm Hg</span>) from the 2018 AHA Scientific Statement.</span>"
  },
  {
    id: 3,
    text: "Having uncontrolled hypertension <span class='no-wrap'>(BP ≥130/80 mm Hg)</span> nearly doubles the risk of MI.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "Based on a recent real-world evidence study, US adults with uncontrolled hypertension despite treatment with 2 or more antihypertensives had an approximately 1.8x increased risk of MI compared to those with controlled hypertension.*",
    additionalInfo: "<b>Abbreviations:</b> aHR=adjusted hazard ratio; BP=blood pressure; CI=confidence interval; EMR=electronic medical record; HTN=hypertension; MI=myocardial infarction; US=United States.<br><br><b>Reference:</b> McCormack T, Suárez Fernández C, Bhalla V, et al. Risk of cardiorenal and metabolic outcomes in inadequately controlled hypertension: insights from the EnligHTN study. Poster presented at: European Society of Cardiology (ESC) Congress; August 29–September 1, 2025; Madrid, Spain.",
    finePrint: "<span class='sup-asterisk'>EnligHTN is an observational, longitudinal, multinational, cohort study of over 240,000 patients with HTN that assessed clinical characteristics and real-world disease burden in patients with controlled or inadequately controlled HTN using secondary de-identified claims and EMR data of patients with HTN in the US from IQVIA ambulatory EMRs linked with IQVIA PharMetrics® Plus claims. Patient characteristics were summarized by country. Patients were included if they were ≥18 years of age, diagnosed with HTN between 2018 and 2023, treated with ≥2 antihypertensive medications for ≥30 days, and had ≥1 day of follow-up. Patients were excluded if they had secondary causes of HTN. In US patients (N=41,994), controlled HTN (n=12,864; 31%) was defined as BP <span class='no-wrap'><130/80 mm Hg</span>, and inadequately controlled HTN (n=29,130; 69%) was defined as BP <span class='no-wrap'>≥130/80 mm Hg</span> while concurrently treated with ≥2 antihypertensive medications for ≥30 days from index date. Hazard ratio adjusted for disease risk score for MI was: aHR 1.78; 95% CI: 1.48–2.12.</span>"
  },
  {
    id: 4,
    text: "Having uncontrolled hypertension <span class='no-wrap'>(BP ≥130/80 mm Hg)</span> more than doubles the risk of stroke.",
    type: "boolean",
    options: ["True", "False"], 
    correctAnswer: "True",
    explanation: "Based on a recent real-world evidence study, US adults with uncontrolled hypertension despite treatment with 2 or more antihypertensives had an approximately 2.2x increased risk of stroke compared to those with controlled hypertension.*",
    additionalInfo: "<b>Abbreviations:</b> aHR=adjusted hazard ratio; BP=blood pressure; CI=confidence interval; EMR=electronic medical record; HTN=hypertension; US=United States.<br><br><b>Reference:</b> McCormack T, Suárez Fernández C, Bhalla V, et al. Risk of cardiorenal and metabolic outcomes in inadequately controlled hypertension: insights from the EnligHTN study. Poster presented at: European Society of Cardiology (ESC) Congress; August 29–September 1, 2025; Madrid, Spain.",
    finePrint: "<span class='sup-asterisk'>EnligHTN is an observational, longitudinal, multinational, cohort study of over 240,000 patients with HTN that assessed clinical characteristics and real-world disease burden in patients with controlled or inadequately controlled HTN using secondary de-identified claims and EMR data of patients with HTN in the US from IQVIA ambulatory EMRs linked with IQVIA PharMetrics® Plus claims. Patient characteristics were summarized by country. Patients were included if they were ≥18 years of age, diagnosed with HTN between 2018 and 2023, treated with ≥2 antihypertensive medications for ≥30 days, and had ≥1 day of follow-up. Patients were excluded if they had secondary causes of HTN. In US patients (N=41,994), controlled HTN (n=12,864; 31%) was defined as BP <span class='no-wrap'><130/80 mm Hg</span>, and inadequately controlled HTN (n=29,130; 69%) was defined as BP <span class='no-wrap'>≥130/80 mm Hg</span> while concurrently treated with ≥2 antihypertensive medications for ≥30 days from index date. Hazard ratio adjusted for disease risk score for stroke was: aHR 2.17; 95% CI: 1.79–2.64.</span>"
  },
  {
    id: 5,
    text: "Hypertension is a leading modifiable risk factor for dementia.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "Per the 2025 AHA/ACC Guideline, an SBP of <span class='no-wrap'><130 mm Hg</span> is recommended in adults with hypertension to prevent mild cognitive impairment and dementia.",
    additionalInfo: "<b>Abbreviations:</b> ACC=American College of Cardiology; AHA=American Heart Association; SBP=systolic blood pressure.<br><br><b>Reference:</b> Jones DW, Ferdinand KC, Taler SJ, et al; Peer Review Committee Members. 2025 AHA/ACC/AANP/AAPA/ABC/ACCP/ACPM/AGS/AMA/ASPC/NMA/PCNA/SGIM guideline for the prevention, detection, evaluation, and management of high blood pressure in adults: a report of the American College of Cardiology/American Heart Association Joint Committee on Clinical Practice Guidelines. <i>J Am Coll Cardiol.</i> 2025;86(18):1567-1678.",
    finePrint: ""
  },
  {
    id: 6,
    text: "Every <span class='no-wrap'>10 mm Hg</span> reduction in SBP significantly reduces the risk of major CV events, HF, and stroke.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "Every <span class='no-wrap'>10 mm Hg</span> reduction in SBP significantly reduces the risk of major CV events, HF, and stroke.*",
    additionalInfo: "<b>Abbreviations:</b> BP=blood pressure; CI=confidence interval; CV=cardiovascular; HF=heart failure; MI=myocardial infarction; RR=relative risk; SBP=systolic blood pressure; TIA=transient ischemic attack.<br><br><b>Reference:</b> Ettehad D, Emdin CA, Kiran A, et al. Blood pressure lowering for prevention of cardiovascular disease and death: a systematic review and meta-analysis. <i>Lancet.</i> 2016;387(10022):957-967.",
    finePrint: "<span class='sup-asterisk'>Systematic review and meta-analysis of 123 randomized trials (published between 1966 and 2015) that evaluated the effects of BP lowering on CV disease and mortality across various baseline BP levels and comorbidities in 613,815 participants. Data were also extracted for major CV disease events (defined as fatal and nonfatal MI, sudden cardiac death, revascularization, fatal and nonfatal stroke, and fatal and nonfatal HF), stroke (fatal and nonfatal, excluding TIA), and HF (new diagnosis of HF, hospital admission, or death). The relative risks for events were as follows: major CV events: 20% (RR=0.80; 95% CI: 0.77–0.83); stroke: 27% (RR=0.73; 95% CI: 0.68–0.77); HF: 28% (RR=0.72; 95% CI: 0.67–0.78).</span>"
  },
  {
    id: 7,
    text: "Every <span class='no-wrap'>10 mm Hg</span> reduction in systolic blood pressure significantly reduces the risk of major CV events by _____.",
    type: "multiple",
    options: ["5%", "10%", "20%", "100%"],
    correctAnswer: "20%",
    explanation: "Every <span class='no-wrap'>10 mm Hg</span> reduction in systolic blood pressure significantly reduces the risk of major CV events by 20%.*",
    additionalInfo: "<b>Abbreviations:</b> BP=blood pressure; CI=confidence interval; CV=cardiovascular; HF=heart failure; MI=myocardial infarction; RR=relative risk; TIA=transient ischemic attack.<br><br><b>Reference:</b> Ettehad D, Emdin CA, Kiran A, et al. Blood pressure lowering for prevention of cardiovascular disease and death: a systematic review and meta-analysis. <i>Lancet</i>. 2016;387(10022):957-967.",
    finePrint: "<span class='sup-asterisk'>Systematic review and meta-analysis of 123 randomized trials (published between 1966 and 2015) that evaluated the effects of BP lowering on CV disease and mortality across various baseline BP levels and comorbidities in 613,815 participants. Data were also extracted for major CV disease events (defined as fatal and nonfatal MI, sudden cardiac death, revascularization, fatal and nonfatal stroke, and fatal and nonfatal HF), stroke (fatal and nonfatal, excluding TIA), and HF (new diagnosis of HF, hospital admission, or death). The relative risk for major CV events was: 20% (RR=0.80; 95% CI: 0.77–0.83).</span>"
  },
  {
    id: 8,
    text: "Every <span class='no-wrap'>10 mm Hg</span> reduction in systolic blood pressure significantly reduces the risk of stroke by ______.",
    type: "multiple",
    options: ["7%", "17%", "27%", "37%"],
    correctAnswer: "27%",
    explanation: "Every <span class='no-wrap'>10 mm Hg</span> reduction in systolic blood pressure significantly reduces the risk of stroke by 27%.*",
    additionalInfo: "<b>Abbreviations:</b> BP=blood pressure; CI=confidence interval; CV=cardiovascular; HF=heart failure; MI=myocardial infarction; RR=relative risk; TIA=transient ischemic attack.<br><br><b>Reference:</b> Ettehad D, Emdin CA, Kiran A, et al. Blood pressure lowering for prevention of cardiovascular disease and death: a systematic review and meta-analysis. <i>Lancet.</i> 2016;387(10022):957-967.",
    finePrint: "<span class='sup-asterisk'>Systematic review and meta-analysis of 123 randomized trials (published between 1966 and 2015) that evaluated the effects of BP lowering on CV disease and mortality across various baseline BP levels and comorbidities in 613,815 participants. Data were also extracted for major CV disease events (defined as fatal and nonfatal MI, sudden cardiac death, revascularization, fatal and nonfatal stroke, and fatal and nonfatal HF), stroke (fatal and nonfatal, excluding TIA), and HF (new diagnosis of HF, hospital admission, or death). The relative risk for stroke was: 27% (RR=0.73; 95% CI: 0.68–0.77).</span>"
  },
  {
    id: 9,
    text: "Every <span class='no-wrap'>10 mm Hg</span> reduction in systolic blood pressure significantly reduces the risk of heart failure by ______.",
    type: "multiple",
    options: ["8%", "18%", "28%", "38%"],
    correctAnswer: "28%",
    explanation: "Every <span class='no-wrap'>10 mm Hg</span> reduction in systolic blood pressure significantly reduces the risk of heart failure by 28%.*",
    additionalInfo: "<b>Abbreviations:</b> BP=blood pressure; CI=confidence interval; CV=cardiovascular; HF=heart failure; MI=myocardial infarction; RR=relative risk; TIA=transient ischemic attack.<br><br><b>Reference:</b> Ettehad D, Emdin CA, Kiran A, et al. Blood pressure lowering for prevention of cardiovascular disease and death: a systematic review and meta-analysis. <i>Lancet.</i> 2016;387(10022):957-967.",
    finePrint: "<span class='sup-asterisk'>Systematic review and meta-analysis of 123 randomized trials (published between 1966 and 2015) that evaluated the effects of BP lowering on CV disease and mortality across various baseline BP levels and comorbidities in 613,815 participants. Data were also extracted for major CV disease events (defined as fatal and nonfatal MI, sudden cardiac death, revascularization, fatal and nonfatal stroke, and fatal and nonfatal HF), stroke (fatal and nonfatal, excluding TIA), and HF (new diagnosis of HF, hospital admission, or death). The relative risk for HF was: 28% (RR=0.72; 95% CI: 0.67–0.78).</span>"
  },
  {
    id: 10,
    text: "Aldosterone plays an important role in BP regulation.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "Under normal physiology, aldosterone plays an important role in controlling BP by regulating the balance of sodium, potassium, and water.<sup>1-3</sup>",
    additionalInfo: "<b>Abbreviation:</b> BP=blood pressure.<br><br><b>References:</b> <b>1.</b> Scott JH, Menouar MA, Dunn RJ. Physiology, aldosterone. In: <i>StatPearls</i> [Internet]. Treasure Island (FL): StatPearls Publishing. Updated May 1, 2023. Accessed February 9, 2026. https://www.ncbi.nlm.nih.gov/books/NBK470339/  <b>2.</b> Fountain JH, Kaur J, Lappin SL. Physiology, renin angiotensin system. In: <i>StatPearls</i> [Internet].  Treasure Island (FL): StatPearls Publishing. Updated March 12, 2023. Accessed February 9, 2026. https://www.ncbi.nlm.nih.gov/books/NBK470410/ <b>3.</b> Hargovan M, Ferro A. Aldosterone synthase inhibitors in hypertension: current status and future possibilities. <i>JRSM Cardiovasc Dis.</i> 2014;3:2048004014522440.",
    finePrint: ""
  },
  {
    id: 11,
    text: "Excess circulating aldosterone leads to end-organ damage.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "Excess circulating aldosterone contributes to inflammation and fibrosis of the heart, vasculature, and kidneys, leading to end-organ damage.<sup>1,2</sup>",
    additionalInfo: "<b>References:</b> <b>1.</b> Lin X, Ullah MHE, Wu X, et al. Cerebro-cardiovascular risk, target organ damage, and treatment outcomes in primary aldosteronism. <i>Front Cardiovasc Med.</i> 2022;8:798364. <b>2.</b> Brown NJ. Contribution of aldosterone to cardiovascular and renal inflammation and fibrosis. <i>Nat Rev Nephrol.</i> 2013;9(8):459-469.",
    finePrint: ""
  },
  {
    id: 12,
    text: "Current treatment options can directly address aldosterone production.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "False",
    explanation: "Existing therapies do not directly target aldosterone synthesis and do not fully address the effects of excess aldosterone.",
    additionalInfo: "<b>Reference:</b> Leopold JA, Ingelfinger JR. Aldosterone and treatment-resistant hypertension.<i> N Engl J Med.</i> 2023;388(5):464-467.",
    finePrint: ""
  },
  {
    id: 13,
    text: "Aldosterone production occurs in the ______________.",
    type: "multiple",
    options: ["Adrenal glands", "Liver", "Small intestine", "Kidneys"],
    correctAnswer: "Adrenal glands",
    explanation: "Aldosterone production occurs in the adrenal glands.",
    additionalInfo: "<b>Reference:</b> Crompton M, Skinner LJ, Satchell SC, et al. Aldosterone: essential for life but damaging to the vascular endothelium. <i>Biomolecules.</i> 2023;13(6):1004.",
    finePrint: ""
  },
  {
    id: 14,
    text: "Existing therapies may cause a counterregulatory increase in aldosterone over time.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "MRAs have been associated with increased levels of aldosterone and may also induce a renin-dependent, counterregulatory increase in aldosterone.<sup>1-3</sup><br><br>ACEi/ARBs may not uniformly suppress RAAS, with some patients (10%-53%) experiencing increases in serum aldosterone over time, a phenomenon known as aldosterone breakthrough.<sup>4</sup>",
    additionalInfo: "<b>Abbreviations:</b> ACEi=angiotensin-converting enzyme inhibitor; ARB=angiotensin receptor blocker; MRA=mineralocorticoid receptor antagonist; RAAS=renin-angiotensin-aldosterone system.<br><Br><b>References:</b> <b>1.</b> Kobayashi M, Stienen S, Ter Maaten JM, et al. Clinical determinants and prognostic implications of renin and aldosterone in patients with symptomatic heart failure. <i>ESC Heart Fail.</i> 2020;7(3):953-963. <b>2.</b> Azizi M. Decreasing the effects of aldosterone in resistant hypertension — a success story. <i>N Engl J Med.</i> 2023;388(5):461‑463. <b>3.</b> Agarwal R, Kolkhof P, Bakris G, et al. Steroidal and non‑steroidal mineralocorticoid receptor antagonists in cardiorenal medicine. <i>Eur Heart J.</i> 2021;42(2):152‑161. <b>4.</b> Bomback AS, Klemmer PJ. The incidence and implications of aldosterone breakthrough. <i>Nat Clin Pract Nephrol.</i> 2007;3(9):486‑492.",
    finePrint: ""
  },
  {
    id: 15,
    text: "Aldosterone can be a driving force behind hypertension.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "While it does play an important role in controlling BP, aldosterone can also lead to elevated BP.",
    additionalInfo: "<b>Abbreviation:</b> BP=blood pressure.<br><br><b>Reference:</b> Crompton M, Skinner LJ, Satchell SC, Butler MJ. Aldosterone: essential for life but damaging to the vascular endothelium. <i>Biomolecules.</i> 2023;13(6):1004. ​",
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
    isFromResultsScreen: false,
    questionResponses: [] // Track all question responses for CSV export
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
    console.log('=== INITIALIZING DATABASE ===');
    console.log('Database already initialized?', dbInitialized);
    if (!dbInitialized) {
      try {
        console.log('Calling initDB()...');
        await initDB();
        dbInitialized = true;
        console.log('Database initialized successfully, dbInitialized =', dbInitialized);
        await loadLeaderboard(); // Load the leaderboard after DB init
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    } else {
      console.log('Database already initialized, skipping...');
    }
    console.log('=== DATABASE INITIALIZATION COMPLETE ===');
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
    // const firstThree = questions.slice(0, 3);
    // const remaining = questions.slice(3);
    // const shuffled = remaining.sort(() => Math.random() - 0.5);
    // const randomFour = shuffled.slice(0, 4);
    // questionsList.value = [...firstThree, ...randomFour];
    
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
    
    const isCorrect = answer === currentQuestion.value?.correctAnswer;
    
    // Record the question response
    const questionResponse = {
      questionId: currentQuestion.value?.id,
      questionText: currentQuestion.value?.text,
      selectedAnswer: answer,
      correctAnswer: currentQuestion.value?.correctAnswer,
      isCorrect: isCorrect,
      timeRemaining: state.value.timeRemaining,
      timestamp: new Date().toISOString()
    };
    
    state.value.questionResponses.push(questionResponse);
    
    if (isCorrect) {
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

  // Updated to include correctAnswers and questionResponses in the leaderboard entry
  async function addToLeaderboard() {
    console.log('=== STARTING addToLeaderboard ===');
    console.log('Current state:', state.value);
    console.log('Player type:', playerType.value);
    console.log('Database initialized:', dbInitialized);
    
    const entry = {
      initials: state.value.playerInitials || 'AAA',
      score: state.value.score,
      type: playerType.value,
      bonusTimeScore: state.value.totalBonusTime, // Use the accumulated total bonus time
      correctAnswers: state.value.correctAnswers, // Add correct answers count
      questionResponses: JSON.parse(JSON.stringify(state.value.questionResponses)), // Convert proxy to plain object
      region: null, // Can be set later if needed
      date: new Date().toISOString()
    };
    
    console.log('Entry to save:', entry);
    
    try {
      console.log('Attempting to save score...');
      await saveScore(entry);
      console.log('Score saved successfully, refreshing leaderboard...');
      await loadLeaderboard(); // Refresh the leaderboard after adding a new score
      console.log('Leaderboard refreshed successfully');
    } catch (error) {
      console.error('Error saving score:', error);
      console.log('Falling back to in-memory leaderboard');
      // Fallback to in-memory leaderboard if database fails
      leaderboard.value.push(entry);
      leaderboard.value.sort((a, b) => b.score - a.score);
      leaderboard.value.forEach((entry, index) => {
        entry.rank = index + 1;
      });
    }
    console.log('=== FINISHED addToLeaderboard ===');
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
      isFromResultsScreen: false,
      questionResponses: [] // Reset question responses
    };
    initializeQuestions();
  }

  // Initialize questions when store is created (database initialization happens in App.vue)
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