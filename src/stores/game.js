import { defineStore } from 'pinia';
import { ref, computed, onMounted, nextTick } from 'vue';
import { initDB, saveScore, getTopScores } from './db'; // Import DB functions

// Questions data
const questions = [
  {
    id: 1,
    text: "Among most patients with hypertension, what is the<br>recommended blood pressure target according to<br>the 2017 ACC/AHA Hypertension Guideline?",
    type: "multiple",
    options: ["<120/80 mm Hg", "<130/80 mm Hg<sup>1,2*†</sup>", "<140/90 mm Hg", "<160/100 mm Hg"],
    correctAnswer: "<130/80 mm Hg<sup>1,2*†</sup>",
    explanation: "According to the 2017 ACC/AHA Hypertension Guideline, the recommended blood pressure target for most patients with hypertension is <130/80 mm Hg<sup>1,2*†</sup>.",
    additionalInfo: "<b>Abbreviations:</b> ACC=American College of Cardiology; AHA=American Heart Association; ASCVD=atherosclerotic cardiovascular disease; BP=blood pressure; COR=class of recommendation; CV=cardiovascular; DBP=diastolic blood pressure; HTN=hypertension; LOE=level of evidence; RCTs=randomized controlled trials; SBP=systolic blood pressure.<br><br><b>References:</b> 1. Whelton PK, Carey RM, Aronow WS, et al. 2017 ACC/AHA/AAPA/ABC/ACPM/AGS/APhA/ASH/ASPC/NMA/PCNA guideline for the prevention, detection, evaluation, and management of high blood pressure in adults: executive summary: a report of the American College of Cardiology/American Heart Association Task Force on Clinical Practice Guidelines. Hypertension. 2018;71(6):1269-1324. 2. Vemu PL, Yang E, Ebinger J. 2023 ESH hypertension guideline update: bringing us closer together across the pond. Am Coll Cardiol. Published February 5, 2024. Accessed February 13, 2025. https://www.acc.org/Latest-in-Cardiology/Articles/2024/02/05/11/43/2023-ESH-Hypertension-Guideline-Update",
    finePrint: "*For adults with confirmed HTN and known CV disease or 10-year ASCVD event risk of 10% or higher, a BP target of <130/80 mm Hg is recommended (COR I, LOE SBP: B-R, LOE DBP: C-EO). For adults with confirmed HTN, without additional markers of increased CV disease risk, a BP target of <130/80 mm Hg may be reasonable (COR IIb, LOE SBP: B-NR, LOE DBP: C-EO).<br>1 COR I is a strong recommendation, while COR IIb is a weak recommendation. A LOE of B-R indicates a moderate-quality of evidence from RCTs or meta-analyses; B-NR indicates a moderate-quality of evidence from nonrandomized studies; and C-EO indicates consensus of expert opinion based on clinical experience.1"
  },
  {
    id: 2,
    text: "Patients with aldosterone dysregulation are at an<br>increased risk of _____ compared to<br>patients with hypertension.",
    type: "multiple",
    options: ["Coronary artery disease and heart failure", "Atrial fibrillation", "Stroke", "All of the above<sup>1*†</sup>"],
    correctAnswer: "All of the above<sup>1*†</sup>",
    explanation: "Patients with aldosterone dysregulation are at an increased risk of coronary artery disease and heart failure, atrial fibrillation, stroke, and other cardiovascular complications compared to patients with hypertension.<sup>1*†</sup>",
    additionalInfo: "<b>Abbreviations:</b> CI=confidence interval; HTN=hypertension; IQR=interquartile range; OR=odds ratio.<br><br><b>Reference:</b> 1. Monticone S, D'Ascenzo F, Moretti C, et al. Cardiovascular events and target organ damage in primary aldosteronism compared with essential hypertension: a systematic review and meta-analysis. Lancet Diabetes Endocrinol. 2018;6(1):41-50.",
    finePrint: "*Meta-analysis of 31 studies that evaluated cardiovascular risk in patients with primary aldosteronism (n=3838) compared to patients with essential HTN (n=9284). Median duration of HTN was 8.8 years (IQR 6.2–10.7).<br>OR (95% CI) for the outcomes of coronary artery disease=1.77 (1.10–2.83), heart failure=2.05 (1.11–3.78), atrial fibrillation=3.52 (2.06–5.99), and stroke=2.58 (1.93–3.45).†"
  },
  {
    id: 3,
    text: "True or false? Every 10 mm Hg reduction in systolic <br>blood pressure significantly reduces the risk of major<br> cardiovascular disease events, coronary heart <br>disease, stroke, heart failure, and all-cause mortality.",
    type: "boolean",
    options: ["True<sup>1*</sup>", "False"],
    correctAnswer: "True<sup>1*</sup>",
    explanation: "Every 10 mm Hg reduction in systolic blood pressure significantly reduces the risk of major cardiovascular disease events, coronary heart disease, stroke, heart failure, and all-cause mortality.<sup>1*</sup>",
    additionalInfo: "<b>Abbreviations:</b> CHD=coronary heart disease; CI=confidence interval; RR=relative risk.<br><br><b>Reference:</b>1. Ettehad D, Emdin CA, Kiran A, et al. Blood pressure lowering for prevention of cardiovascular disease and death: a systematic review and meta-analysis. Lancet. 2016;387(10022):957-967.",
    finePrint: "*Meta-analysis of 123 studies with 613,815 participants. Every 10 mm Hg reduction in systolic blood pressure significantly reduced the risk of major cardiovascular events (RR 0.80; 95% CI 0.77–0.83), CHD (RR 0.83; 95% CI 0.78–0.88), stroke (RR 0.73; 95% CI 0.68–0.77), heart failure (RR 0.72; 95% CI 0.67–0.78), and all-cause mortality (RR 0.87; 95% CI 0.84–0.91)."
  },
  {
    id: 4,
    text: "Aldosterone dysregulation is defined as abnormal <br>aldosterone production despite _____.",
    type: "multiple",
    options: ["Low renin and low sodium balance", "High renin and high sodium balance", "Low renin and high sodium balance<sup>1,2</sup>", "None of the above"],
    correctAnswer: "Low renin and high sodium balance<sup>1,2</sup>",
    explanation: "Aldosterone dysregulation is defined as abnormal aldosterone production despite low renin and high sodium balance.<sup>1,2</sup>",
    additionalInfo: "<b>References:</b> 1. Brown JM, Siddiqui M, Calhoun DA, et al. The unrecognized prevalence of primary aldosteronism: a cross-sectional study. Ann Intern Med. 2020;173(1):10-20.2. Papadopoulou-Marketou N, Vaidya A, Dluhy R, Chrousos GP. Hyperaldosteronism. In: Feingold KR, Anawalt B, Blackman MR, et al., eds. Endotext [Internet]. South Dartmouth (MA): MDText.com, Inc.; 2000-. Updated August 6, 2020. Accessed February 13, 2025. https://www.ncbi.nlm.nih.gov/books/NBK279065/",
    finePrint: ""
  },
  {
    id: 5,
    text: "Every 10 mm Hg reduction in systolic blood<br> pressure significantly reduces the risk of major<br> CVD events by _____.",
    type: "multiple",
    options: ["5%", "10%", "20%<sup>1*</sup>", "100%"],
    correctAnswer: "20%<sup>1*</sup>",
    explanation: "Every 10 mm Hg reduction in systolic blood pressure significantly reduces the risk of major CVD events by 20%.<sup>1*</sup>",
    additionalInfo: "<b>Abbreviations:</b> CI=confidence interval; CVD=cardiovascular disease; RR=relative risk.<br><br><b>Reference:</b> 1. Ettehad D, Emdin CA, Kiran A, et al. Blood pressure lowering for prevention of cardiovascular disease and death: a systematic review and meta-analysis. Lancet. 2016;387(10022):957-967.",
    finePrint: "Meta-analysis of 123 studies with 613,815 participants. Major CVD events defined as fatal and non-fatal myocardial infarction, sudden cardiac death, revascularization, fatal and non-fatal stroke, and fatal and non-fatal heart failure. Every 10 mm Hg reduction in systolic blood pressure significantly reduced the risk of major cardiovascular events (RR 0.80, 95% CI 0.77–0.83)."
  },
  {
    id: 6,
    text: "True or false? About half of US adults with high blood<br> pressure may not be at goal (less than 130/80 mm Hg) <br>despite taking 2 or more antihypertensive medications<br> of different classes.",
    type: "boolean",
    options: ["True<sup>1</sup>", "False"],
    correctAnswer: "True<sup>1</sup>",
    explanation: "About half of US adults with high blood pressure may not be at goal (less than 130/80 mm Hg) despite taking 2 or more antihypertensive medications of different classes.<sup>1</sup>",
    additionalInfo: "<b>Abbreviation:</b> US=United States.<br><br><b>Reference:</b> 1. Carey RM, Sakhuja S, Calhoun DA, Whelton PK, Muntner P. Prevalence of apparent treatment-resistant hypertension in the United States: comparison of the 2008 and 2018 American Heart Association Scientific Statements on resistant hypertension. Hypertension. 2019;73(2):424-431 [including online supplement].",
    finePrint: ""
  },
  {
    id: 7,
    text: "How does uncontrolled hypertension affect the <br>risk of mortality due to cardiovascular disease <br>compared to normal blood pressure?",
    type: "multiple",
    options: ["No significant impact on risk", "More than doubles the risk<sup>1*</sup>", "Quadruples the risk"],
    correctAnswer: "More than doubles the risk<sup>1*</sup>",
    explanation: "Uncontrolled hypertension more than doubles the risk of mortality due to cardiovascular disease compared to normal blood pressure.<sup>1*</sup>",
    additionalInfo: "<b>Abbreviations:</b> CI=confidence interval; CVD=cardiovascular disease; HR=hazard ratio; NHANES III=Third National Examination and Nutritional Health Survey; US=United States. <br><br><b>Reference:</b> 1. Zhou D, Xi B, Zhao M, Wang L, Veeranki SP. Uncontrolled hypertension increases risk of all-cause and cardiovascular disease mortality in US adults: the NHANES III Linked Mortality Study. Sci Rep. 2018;8(1):9418.",
    finePrint: "Prospective cohort study of US adults aged ≥18 years (N=13,947) enrolled in the NHANES III (1988–1994; median follow-up of 19.1 years). HR (95% CI) for the outcome of CVD-specific mortality was 2.23 (1.66–2.99)."
  },
  {
    id: 8,
    text: "How does uncontrolled hypertension affect the <br>risk of mortality due to cerebrovascular disease <br>compared to normal blood pressure?",
    type: "multiple",
    options: ["No significant impact on risk", "Doubles the risk", "Triples the risk<sup>1*</sup>"],
    correctAnswer: "Triples the risk<sup>1*</sup>",
    explanation: "Uncontrolled hypertension more than triples the mortality risk due to cerebrovascular disease compared to normal blood pressure.<sup>1*</sup>",
    additionalInfo: "<b>Abbreviations:</b> CI=confidence interval; HR=hazard ratio; NHANES III=Third National Examination and Nutritional Health Survey; US=United States.<br><br><b>Reference:</b> 1. Zhou D, Xi B, Zhao M, Wang L, Veeranki SP. Uncontrolled hypertension increases risk of all-cause and cardiovascular disease mortality in US adults: the NHANES III Linked Mortality Study. Sci Rep. 2018;8(1):9418.",
    finePrint: "Prospective cohort study of US adults aged ≥18 years (N=13,947) enrolled in the NHANES III (1988–1994; median follow-up of 19.1 years). HR (95% CI) for the outcome of cerebrovascular disease-specific deaths was 3.01 (1.91–4.73).<br>Defined as treated with antihypertensives, but not at goal of ≤140/90 mm Hg."
  },
  {
    id: 9,
    text: "Aldosterone production occurs in <br>the _____.",
    type: "multiple",
    options: ["Adrenal glands<sup>1</sup>", "Liver", "Small intestines", "Kidneys"],
    correctAnswer: "Adrenal glands<sup>1</sup>",
    explanation: "Aldosterone production occurs in the adrenal glands.<sup>1</sup>",
    additionalInfo: "<b>Reference:</b> 1. Crompton M, Skinner LJ, Satchell SC, et al. Aldosterone: essential for life but damaging to the vascular endothelium. Biomolecules. 2023;13(6):1004.",
    finePrint: ""
  },
  {
    id: 10,
    text: "About _____ of patients with hypertension<br> may have aldosterone dysregulation.",
    type: "multiple",
    options: ["One-twentieth", "One-tenth", "One-fifth", "One-third<sup>1</sup>"],
    correctAnswer: "One-third<sup>1</sup>",
    explanation: "About one-third of patients with hypertension may have aldosterone dysregulation.<sup>1</sup>",
    additionalInfo: "<b>Reference:</b> 1. Brown JM, Siddiqui M, Calhoun DA, et al. The unrecognized prevalence of primary aldosteronism: a cross-sectional study. Ann Intern Med. 2020;173(1):10-20.",
    finePrint: "*Based on diagnosis of primary aldosteronism."
  },
  {
    id: 11,
    text: "Once produced, aldosterone binds to <br>mineralocorticoid receptors in the kidneys. <Br>What is the result?",
    type: "multiple",
    options: [
      "Decreases sodium reabsorption and lowers blood pressure",
      "Increases potassium retention and lowers blood pressure",
      "Increases sodium reabsorption, which raises intravascular volume and blood pressure<sup>1,2</sup>"
    ],
    correctAnswer: "Increases sodium reabsorption, which raises intravascular volume and blood pressure<sup>1,2</sup>",
    explanation: "Once produced, aldosterone binds to mineralocorticoid receptors in the kidneys, increasing sodium reabsorption and raising intravascular volume and blood pressure.<sup>1,2</sup>",
    additionalInfo: "<b>References</b>: 1. Scott JH, Menouar MA, Dunn RJ. Physiology, aldosterone. StatPearls [internet]. Updated May 1, 2023. Accessed February 13, 2025. https://www.ncbi.nlm.nih.gov/books/NBK470339/2. Papadopoulou-Marketou N, Vaidya A, Dluhy R, Chrousos GP. Hyperaldosteronism. In: Feingold KR, Anawalt B, Blackman MR, et al., eds. Endotext [Internet]. South Dartmouth (MA): MDText.com, Inc.; 2000-. Updated August 6, 2020. Accessed January 27, 2025. https://www.ncbi.nlm.nih.gov/books/NBK279065/",
    finePrint: ""
  },
  {
    id: 12,
    text: "True or false? Excess aldosterone production leads<br> to ongoing plasma volume expansion and decreased<br> blood pressure, despite physiologic suppression of<br> the RAAS pathway.",
    type: "boolean",
    options: ["True", "False<sup>1,2</sup>"],
    correctAnswer: "False<sup>1,2</sup>",
    explanation: "Excess aldosterone production leads to expanding plasma volume expansion and increased blood pressure, despite physiologic suppression of the RAAS pathway.<sup>1,2</sup>",
    additionalInfo: "<b>Abbreviation</b>: RAAS=renin-angiotensin-aldosterone system.<br><br><b>References: </b>1. Papadopoulou-Marketou N, Vaidya A, Dluhy R, Chrousos GP. Hyperaldosteronism. In: Feingold KR, Anawalt B, Blackman MR, et al., eds. Endotext [Internet]. South Dartmouth (MA): MDText.com, Inc.; 2000-. Updated August 6, 2020. Accessed January 27, 2025. https://www.ncbi.nlm.nih.gov/books/NBK279065/ 2. Triebel H, Castrop H. The renin angiotensin aldosterone system. Pflugers Arch—Eur J Physiol. 2024;476(5):705-713.",
    finePrint: ""
  },
  {
    id: 13,
    text: "True or false? Aldosterone dysregulation may lead<br> to elevated blood pressure and increase the risk of <br>adverse cardiovascular and kidney outcomes, <br>which can occur independently of blood pressure.",
    type: "boolean",
    options: ["True<sup>1,2</sup>", "False"],
    correctAnswer: "True<sup>1,2</sup>",
    explanation: "Aldosterone dysregulation may lead to elevated blood pressure and increase the risk of adverse cardiovascular and kidney outcomes, which can occur independently of blood pressure.<sup>1,2</sup>",
    additionalInfo: "<b>References:</b> 1. Verhovez A, Williams TA, Monticone S, et al. Genomic and non-genomic effects of aldosterone. Curr Sign Transd Ther. 2012;7:132-141. 2.  Lin X, Ullah MHE, Wu X, et al. Cerebro-cardiovascular risk, target organ damage, and treatment outcomes in primary aldosteronism. Front Cardiovasc Med. 2022:8:798364.",
    finePrint: ""
  },
  {
    id: 14,
    text: "Patients with aldosterone dysregulation have nearly _____ <br>times higher risk of stroke, _____ times higher risk of atrial<br> fibrillation, and _____ times higher risk of heart failure<br> compared to patients with hypertension alone.",
    type: "multiple",
    options: [
      "1.5, 1.5, 1.5",
      "1.5, 1.5, 2",
      "3, 4, 2<sup>1*†</sup>"
    ],
    correctAnswer: "3, 4, 2<sup>1*†</sup>",
    explanation: "Patients with aldosterone dysregulation have nearly 3 times higher risk of stroke, 4 times higher risk of atrial fibrillation, and 2 times higher risk of heart failure compared to patients with hypertension alone.<sup>1*†</sup>",
    additionalInfo: "<b>Abbreviations:</b> CI=confidence interval; HTN=hypertension; IQR=interquartile range; OR=odds ratio.<br><br><b>Reference:</b> 1. Monticone S, D'Ascenzo F, Moretti C, et al. Cardiovascular events and target organ damage in primary aldosteronism compared with essential hypertension: a systematic review and meta-analysis. Lancet Diabetes Endocrinol. 2018;6(1):41-50.",
    finePrint: "Meta-analysis of 31 studies that evaluated cardiovascular risk in patients with primary aldosteronism (n=3838) compared to patients with essential HTN (n=9284). ​<br>OR (95% CI) for the outcomes of stroke=2.58 (1.93–3.45), atrial fibrillation=3.52 (2.06–5.99), heart failure=2.05 (1.11–3.78)."
  },
  {
    id: 15,
    text: "Aldosterone dysregulation is a _____ <br>and _____ cause of hypertension.",
    type: "multiple",
    options: [
      "Prevalent, underrecognized<sup>1</sup>",
      "Rare, overdiagnosed",
      "Rare, harmless"
    ],
    correctAnswer: "Prevalent, underrecognized<sup>1</sup>",
    explanation: "Aldosterone dysregulation is a prevalent and underrecognized cause of hypertension.<sup>1</sup>",
    additionalInfo: "<b>Reference:</b>1. Brown MJ, Siddiqui M, Calhoun DA, et al. The unrecognized prevalence of primary aldosteronism: a cross-sectional study. Ann Intern Med. 2020;173(1):10-20.",
    finePrint: ""
  },
  {
    id: 16,
    text: "Aldosterone is an important hormone involved <Br>in blood pressure regulation, acting <br>through _____, utilizing both classical <br>genomic and non-genomic mechanisms.",
    type: "multiple",
    options: [
      "A single pathway",
      "Multiple pathways<sup>1</sup>"
    ],
    correctAnswer: "Multiple pathways<sup>1</sup>",
    explanation: "Aldosterone is an important hormone involved in blood pressure regulation, acting through multiple pathways, utilizing both classical genomic and non-genomic mechanisms.<sup>1</sup>",
    additionalInfo: "<b>Reference:</b> 1. Crompton M, Skinner LJ, Satchell SC, Butler MJ. Aldosterone: essential for life but damaging to the vascular endothelium. Biomolecules. 2023;13(6):1004.",
    finePrint: ""
  },
  {
    id: 17,
    text: "In normal physiology, aldosterone is increased <br>by _____ sodium concentrations, _____ blood pressure,<br> and _____ renal perfusion.",
    type: "multiple",
    options: [
      "Low, low, low<sup>1,2</sup>",
      "Low, high, low",
      "Low, low, high",
      "High, high, high"
    ],
    correctAnswer: "Low, low, low<sup>1,2</sup>",
    explanation: "In normal physiology, aldosterone is increased by low sodium concentrations, low blood pressure, and low renal perfusion.<sup>1,2</sup>",
    additionalInfo: "<b>References:</b>1. Crompton M, Skinner LJ, Satchell SC, Butler MJ. Aldosterone: essential for life but damaging to the vascular endothelium. Biomolecules. 2023;13(6):1004. 2. Scott JH, Menouar MA, Dunn RJ. Physiology, aldosterone. StatPearls [internet]. Updated May 1, 2023. Accessed February 13, 2025. https://www.ncbi.nlm.nih.gov/books/NBK470339/",
    finePrint: ""
  },
  {
    id: 18,
    text: "Aldosterone dysregulation is common in which<br> groups of patients with hypertension?",
    type: "multiple",
    options: [
      "Resistant hypertension",
      "Obesity and sleep apnea",
      "Type 2 diabetes",
      "All of the above<sup>1-5</sup>"
    ],
    correctAnswer: "All of the above<sup>1-5</sup>",
    explanation: "Aldosterone dysregulation is common in patients with resistant hypertension, obesity, type 2 diabetes, and sleep apnea.<sup>1-5</sup>",
    additionalInfo: "<b>References:</b> 1.  Brown JM, Siddiqui M, Calhoun DA, et al. The unrecognized prevalence of primary aldosteronism: a cross-sectional study. Ann Intern Med. 2020;173(1):10-20. 2. Ruiz-Sánchez JG, Paja-Fano M, González Boillos M, et al. Effect of obesity on clinical characteristics of primary aldosteronism patients at diagnosis and postsurgical response. J Clin Endocrinol Metab. 2023;109(1):e379-e388. 3. Tyfoxylou E, Voulgaris N, Gravvanis C, et al. High prevalence of primary aldosteronism in patients with type 2 diabetes mellitus and hypertension. Biomedicines. 2022;10(9):2308. 4. Pratt-Ubunama MN, Nishizaka MK, Boedefeld RL, et al. Plasma aldosterone is related to severity of obstructive sleep apnea in subjects with resistant hypertension. Chest. 2007;131(2):453-459. 5. Funes Hernandez M, Bhalla V. Underdiagnosis of primary aldosteronism: a review of screening and detection. Am J Kidney Dis. 2023;82(3):333-346.",
    finePrint: "Based on diagnosis of primary aldosteronism."
  },
  {
    id: 19,
    text: "True or false? Aldosterone dysregulation increases<br> across hypertension stages.",
    type: "boolean",
    options: ["True<sup>1*†‡§</sup>", "False"],
    correctAnswer: "True<sup>1*†‡§</sup>",
    explanation: "Aldosterone dysregulation increases across hypertension stages.<sup>1*†‡§</sup>",
    additionalInfo: "<b>Abbreviations:</b> hr=hour; HTN=hypertension; rHTN=resistant hypertesion; UAldo=urinary aldosterone; US=United States.<br><br><b>Reference:</b> 1. Brown JM, Siddiqui M, Calhoun DA, et al. The unrecognized prevalence of primary aldosteronism: a cross-sectional study. Ann Intern Med. 2020;173(1):10-20.",
    finePrint: "Cross-sectional cohort study characterizing the prevalence of primary aldosteronism (renin-independent aldosterone production) in 1015 patients (patients with normotension [n=289], stage 1 HTN [n=115], stage 2 HTN [n=203], and rHTN [n=408]) across 5 studies and 4 testing sites in the US. UAldo was measured in patients in high sodium balance with suppressed renin (seated: <1.0 mcg/L/hr, supine: <0.6 mcg/L/hr).<br>In a subset of 691 patients with suppressed renin activity and high sodium balance, the adjusted aldosterone dysregulation prevalence was: 19.9% untreated nomotension, 27.4% untreated stage 1 HTN, 40.0% untreated stage 2 HTN, and 58.0% treated rHTN.<br>Adjusted for age, body mass index, race, sex, history of diabetes mellitus, and 24-hr urinary sodium excretion.<br>From untreated nomotension, untreated stage 1 and 2 HTN, and treated rHTN."
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