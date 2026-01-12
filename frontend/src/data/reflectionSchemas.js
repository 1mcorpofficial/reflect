/**
 * Apple-inspired Reflection Schemas
 * Schema-driven questions with progressive disclosure
 */

export const REFLECTION_SCHEMAS = {
  lesson: {
    id: 'lesson',
    name: 'Pamokos refleksija',
    icon: '📚',
    steps: [
      {
        id: 'quick-check',
        type: 'traffic-light',
        label: 'Kaip sekėsi pamoka?',
        options: [
          { value: 'green', label: 'Supratau', icon: '🟢', color: 'green' },
          { value: 'yellow', label: 'Iš dalies', icon: '🟡', color: 'yellow' },
          { value: 'red', label: 'Nesupratau', icon: '🔴', color: 'red' },
        ],
        required: true,
        allowRefuse: true,
        allowDontKnow: true,
      },
      {
        id: 'factors',
        type: 'chips',
        label: 'Kas labiausiai įtakojo?',
        subtitle: 'Pasirinkite 1–3',
        chips: [
          { id: 'tempas', label: 'Tempas' },
          { id: 'tema', label: 'Tema' },
          { id: 'triukšmas', label: 'Triukšmas' },
          { id: 'užduotis', label: 'Užduotis' },
          { id: 'paaiškinimas', label: 'Mokytojo paaiškinimas' },
          { id: 'grupinis', label: 'Grupinis darbas' },
          { id: 'nuotaika', label: 'Nuotaika' },
          { id: 'miegas', label: 'Miegas' },
        ],
        min: 0,
        max: 3,
        required: false,
      },
      {
        id: 'one-sentence',
        type: 'sentence-completion',
        label: 'Užbaikite sakinį (nebūtina)',
        template: 'Šiandien supratau...',
        multiline: false,
        required: false,
      },
    ],
  },
  week: {
    id: 'week',
    name: 'Savaitės refleksija',
    icon: '📅',
    steps: [
      {
        id: 'achievements',
        type: 'text',
        label: 'Didžiausias savaitės pasiekimas',
        required: true,
      },
      {
        id: 'hardest',
        type: 'text',
        label: 'Kas buvo sunkiausia ir kodėl',
        required: true,
      },
      {
        id: 'factors',
        type: 'chips',
        label: 'Kas labiausiai įtakojo savaitę?',
        chips: [
          { id: 'tempas', label: 'Tempas' },
          { id: 'užduotys', label: 'Užduotys' },
          { id: 'komanda', label: 'Komanda' },
          { id: 'santykiai', label: 'Santykiai' },
          { id: 'sveikata', label: 'Sveikata' },
          { id: 'aplinka', label: 'Aplinka' },
        ],
        min: 0,
        max: 3,
        required: false,
      },
      {
        id: 'next-week',
        type: 'text',
        label: 'Ką norėtum pakeisti kitą savaitę?',
        required: true,
      },
    ],
  },
  test: {
    id: 'test',
    name: 'Kontrolinio refleksija',
    icon: '📝',
    steps: [
      {
        id: 'confidence',
        type: 'scale',
        label: 'Kaip buvau pasiruošęs?',
        scale: {
          min: 1,
          max: 5,
          labels: ['Nepasiruošęs', 'Silpnai', 'Vidutiniškai', 'Gerai', 'Puikiai'],
        },
        required: true,
      },
      {
        id: 'prep-methods',
        type: 'chips',
        label: 'Kaip ruošiausi?',
        chips: [
          { id: 'uždaviniai', label: 'Uždaviniai' },
          { id: 'konspektas', label: 'Konspektas' },
          { id: 'video', label: 'Video' },
          { id: 'draugas', label: 'Su draugu' },
          { id: 'kita', label: 'Kita' },
        ],
        min: 1,
        max: 5,
        required: true,
      },
      {
        id: 'went-best',
        type: 'text',
        label: 'Kas pavyko geriausiai',
        required: true,
      },
      {
        id: 'gaps',
        type: 'text',
        label: 'Kur pritrūko / kas nustebino',
        required: true,
      },
    ],
  },
  project: {
    id: 'project',
    name: 'Projekto refleksija',
    icon: '🎯',
    steps: [
      {
        id: 'teamwork',
        type: 'scale',
        label: 'Komandos darbas',
        scale: {
          min: 1,
          max: 5,
          labels: ['Blogai', 'Silpnai', 'Vidutiniškai', 'Gerai', 'Puikiai'],
        },
        required: true,
      },
      {
        id: 'contribution',
        type: 'text',
        label: 'Ką aš konkrečiai padariau',
        required: true,
      },
      {
        id: 'factors',
        type: 'chips',
        label: 'Kas įtakojo projekto eigą?',
        chips: [
          { id: 'planavimas', label: 'Planavimas' },
          { id: 'komunikacija', label: 'Komunikacija' },
          { id: 'laikas', label: 'Laikas' },
          { id: 'ištekliai', label: 'Ištekliai' },
          { id: 'motyvacija', label: 'Motyvacija' },
        ],
        min: 0,
        max: 3,
        required: false,
      },
      {
        id: 'next-time',
        type: 'text',
        label: 'Ką daryčiau kitaip kitą kartą',
        required: true,
      },
    ],
  },
  mood: {
    id: 'mood',
    name: 'Savijautos pasitikrinimas',
    icon: '😊',
    steps: [
      {
        id: 'mood',
        type: 'scale',
        label: 'Nuotaika',
        scale: {
          min: 1,
          max: 5,
          labels: ['Labai bloga', 'Bloga', 'Vidutinė', 'Gera', 'Puiki'],
        },
        required: true,
      },
      {
        id: 'energy',
        type: 'scale',
        label: 'Energija',
        scale: {
          min: 1,
          max: 5,
          labels: ['Labai mažai', 'Mažai', 'Vidutinė', 'Daug', 'Labai daug'],
        },
        required: true,
      },
      {
        id: 'stress',
        type: 'scale',
        label: 'Stresas',
        scale: {
          min: 1,
          max: 5,
          labels: ['Labai mažas', 'Mažas', 'Vidutinis', 'Didelis', 'Labai didelis'],
        },
        required: true,
      },
      {
        id: 'thoughts',
        type: 'text-optional',
        label: 'Kas šiuo metu labiausiai sukasi galvoje?',
        placeholder: 'Jei norite, parašykite...',
        required: false,
      },
      {
        id: 'want-contact',
        type: 'yesno',
        label: 'Ar noriu, kad su manimi susisiektų mokytojas/kuratorius?',
        required: true,
        allowRefuse: true,
      },
    ],
  },
};

export function getReflectionSchema(id) {
  return REFLECTION_SCHEMAS[id] || null;
}
