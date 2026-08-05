export type Question = {
  id: string
  topic: string
  prompt: string
  choices: string[]
  correctAnswer: number
  explanation: string
  teachingPoints: string[]
  reference: string
}

export const mockQuestions: Question[] = [
  {
    id: 'ecg-stemi',
    topic: 'Acute coronary syndrome',
    prompt:
      'A patient with crushing chest pain has ST-segment elevation in leads II, III, and aVF. Which coronary artery is most likely occluded?',
    choices: [
      'Left anterior descending artery',
      'Right coronary artery',
      'Left circumflex artery',
      'Left main coronary artery',
    ],
    correctAnswer: 1,
    explanation:
      'Inferior ST-segment elevation localizes to the inferior wall, most commonly supplied by the right coronary artery.',
    teachingPoints: [
      'II, III, and aVF look at the inferior wall of the left ventricle.',
      'Consider right-sided leads when inferior STEMI is present to assess for right ventricular involvement.',
      'Reciprocal ST depression may appear in leads I and aVL.',
    ],
    reference: 'ACC/AHA guideline for the management of acute coronary syndromes',
  },
  {
    id: 'aortic-stenosis',
    topic: 'Valvular disease',
    prompt:
      'Which finding is most characteristic of severe aortic stenosis on cardiac examination?',
    choices: [
      'A continuous machinery murmur at the left upper sternal border',
      'A holosystolic murmur loudest at the apex',
      'A crescendo-decrescendo systolic murmur radiating to the carotids',
      'An early diastolic decrescendo murmur at the left sternal border',
    ],
    correctAnswer: 2,
    explanation:
      'Aortic stenosis produces a systolic ejection murmur that typically radiates to the carotid arteries.',
    teachingPoints: [
      'Classic symptoms are angina, syncope, and exertional dyspnea.',
      'A delayed and diminished carotid upstroke can support the diagnosis.',
      'Echocardiography confirms severity and guides management.',
    ],
    reference: '2020 ACC/AHA Guideline for the Management of Patients With Valvular Heart Disease',
  },
  {
    id: 'heart-failure',
    topic: 'Heart failure',
    prompt:
      'Which medication class improves survival in heart failure with reduced ejection fraction?',
    choices: [
      'Loop diuretics only',
      'Beta blockers with evidence for HFrEF',
      'Short-acting nitrates only',
      'Non-dihydropyridine calcium channel blockers',
    ],
    correctAnswer: 1,
    explanation:
      'Evidence-based beta blockers are a foundational therapy for HFrEF and improve survival when clinically appropriate.',
    teachingPoints: [
      'Guideline-directed medical therapy also includes RAAS inhibition, mineralocorticoid receptor antagonists, and SGLT2 inhibitors when appropriate.',
      'Loop diuretics improve congestion but have not been shown to provide the same survival benefit.',
      'Start and titrate therapy thoughtfully, considering blood pressure, volume status, and comorbidities.',
    ],
    reference: '2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure',
  },
]
