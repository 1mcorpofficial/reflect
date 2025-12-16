export const TEMPLATES = {
  lesson: {
    id: 'lesson',
    name: 'Pamokos refleksija',
    icon: '📚',
    color: 'blue',
    fields: [
      { key: 'subject', label: 'Dalykas', type: 'text', required: true },
      { key: 'topic', label: 'Tema', type: 'text', required: true },
      { key: 'learned', label: 'Ką išmokau?', type: 'textarea', required: true },
      { key: 'difficult', label: 'Kas buvo sudėtinga?', type: 'textarea', required: false },
      { key: 'questions', label: 'Kokie klausimai liko?', type: 'textarea', required: false },
    ]
  },
  week: {
    id: 'week',
    name: 'Savaitės refleksija',
    icon: '📅',
    color: 'green',
    fields: [
      { key: 'achievements', label: 'Savaitės pasiekimai', type: 'textarea', required: true },
      { key: 'challenges', label: 'Sunkumai', type: 'textarea', required: false },
      { key: 'goals', label: 'Tikslai kitai savaitei', type: 'textarea', required: true },
      { key: 'mood', label: 'Nuotaika (1-5)', type: 'number', required: true, min: 1, max: 5 },
    ]
  },
  test: {
    id: 'test',
    name: 'Kontrolinio refleksija',
    icon: '📝',
    color: 'amber',
    fields: [
      { key: 'subject', label: 'Dalykas', type: 'text', required: true },
      { key: 'preparation', label: 'Kaip ruošiausi?', type: 'textarea', required: true },
      { key: 'went_well', label: 'Kas sekėsi?', type: 'textarea', required: false },
      { key: 'went_poorly', label: 'Kas nesisekė?', type: 'textarea', required: false },
      { key: 'improvement', label: 'Ką galėčiau tobulinti?', type: 'textarea', required: true },
    ]
  },
  project: {
    id: 'project',
    name: 'Projekto refleksija',
    icon: '🎯',
    color: 'rose',
    fields: [
      { key: 'project_name', label: 'Projekto pavadinimas', type: 'text', required: true },
      { key: 'role', label: 'Mano vaidmuo', type: 'text', required: true },
      { key: 'learned', label: 'Ko išmokau?', type: 'textarea', required: true },
      { key: 'teamwork', label: 'Kaip sekėsi komandinis darbas?', type: 'textarea', required: false },
      { key: 'next_time', label: 'Ką daryt kitą kartą kitaip?', type: 'textarea', required: true },
    ]
  },
  mood: {
    id: 'mood',
    name: 'Savijautos tikrinimas',
    icon: '😊',
    color: 'slate',
    fields: [
      { key: 'mood', label: 'Nuotaika (1-5)', type: 'number', required: true, min: 1, max: 5 },
      { key: 'energy', label: 'Energijos lygis (1-5)', type: 'number', required: true, min: 1, max: 5 },
      { key: 'thoughts', label: 'Mintys', type: 'textarea', required: false },
    ]
  }
};

export function getTemplate(id) {
  return TEMPLATES[id] || null;
}

export function getAllTemplates() {
  return Object.values(TEMPLATES);
}
