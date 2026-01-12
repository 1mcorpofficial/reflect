export const TEMPLATES = {
  lesson: {
    id: 'lesson',
    name: 'Pamokos refleksija',
    icon: '📚',
    color: 'blue',
    description: 'Greita refleksija po pamokos',
    summary: 'Trumpas įsivertinimas ir pagalbos poreikis.',
    fields: [
      { key: 'subject', label: 'Dalykas', type: 'text', required: true },
      { key: 'topic', label: 'Tema / pamokos dalis', type: 'text', required: false },
      { key: 'learned', label: 'Ką šiandien tiksliai išmokau?', type: 'textarea', required: true },
      { key: 'practice', label: 'Ką dar reikia pasipraktikuoti?', type: 'textarea', required: true },
      { key: 'stuck', label: 'Kurioje vietoje „užstrigau“?', type: 'textarea', required: false },
      { key: 'understanding', label: 'Kaip gerai supratau temą? (1–5)', type: 'rating', required: true },
      { key: 'question_for_teacher', label: 'Klausimas mokytojui', type: 'textarea', required: false },
      { key: 'need_help', label: 'Ar reikia pagalbos?', type: 'yesno', required: true },
      { key: 'help_details', label: 'Kokios pagalbos reikia?', type: 'textarea', required: true, showIf: { field: 'need_help', equals: 'Taip' } },
    ]
  },
  week: {
    id: 'week',
    name: 'Savaitės refleksija',
    icon: '📅',
    color: 'green',
    description: 'Tikras savaitės vaizdas ir planas',
    summary: 'Pasiekimai, iššūkiai ir aiškus planas kitai savaitei.',
    fields: [
      { key: 'achievements', label: 'Didžiausias savaitės pasiekimas', type: 'textarea', required: true },
      { key: 'hardest', label: 'Kas buvo sunkiausia ir kodėl', type: 'textarea', required: true },
      { key: 'improve', label: 'Ką noriu pagerinti kitą savaitę', type: 'textarea', required: true },
      { key: 'goal_next_week', label: 'Vienas konkretus tikslas kitai savaitei', type: 'textarea', required: true },
      { key: 'small_step', label: 'Vienas mažas veiksmas, kurį padarysiu', type: 'text', required: true },
      { key: 'mood', label: 'Nuotaika (1–5)', type: 'rating', required: true },
      { key: 'energy', label: 'Energija (1–5)', type: 'rating', required: true },
      { key: 'stress', label: 'Stresas (1–5)', type: 'rating', required: false },
      { key: 'need_reaction', label: 'Ar noriu, kad mokytojas/kuratorius sureaguotų?', type: 'yesno', required: true },
      { key: 'reaction_note', label: 'Komentaras mokytojui/kuratoriui', type: 'textarea', required: true, showIf: { field: 'need_reaction', equals: 'Taip' } },
    ]
  },
  test: {
    id: 'test',
    name: 'Kontrolinio refleksija',
    icon: '📝',
    color: 'amber',
    description: 'Po kontrolinio – kas pavyko ir ką kartosiu',
    summary: 'Pamatyk savo pasiruošimą, sėkmes ir spragas.',
    fields: [
      { key: 'subject', label: 'Dalykas', type: 'text', required: true },
      { key: 'topic', label: 'Tema', type: 'text', required: true },
      { key: 'prep_methods', label: 'Kaip ruošiausi?', type: 'multi-select', required: true, options: ['Uždaviniai', 'Konspektas', 'Video', 'Su draugu', 'Kita'] },
      { key: 'prep_confidence', label: 'Kaip buvau pasiruošęs? (1–5)', type: 'rating', required: true },
      { key: 'went_best', label: 'Kas pavyko geriausiai', type: 'textarea', required: true },
      { key: 'gaps', label: 'Kur pritrūko / kas nustebino', type: 'textarea', required: true },
      { key: 'repeat', label: 'Ką konkrečiai kartosiu', type: 'textarea', required: true },
      { key: 'next_plan', label: 'Planui: ką darysiu iki kito atsiskaitymo', type: 'textarea', required: true },
    ]
  },
  project: {
    id: 'project',
    name: 'Projekto refleksija',
    icon: '🎯',
    color: 'rose',
    description: 'Komandinis darbas ir asmeninis indėlis',
    summary: 'Ką padarei, ką išmokai ir kur reikia pagalbos.',
    fields: [
      { key: 'project_name', label: 'Projekto pavadinimas', type: 'text', required: true },
      { key: 'role', label: 'Mano vaidmuo', type: 'text', required: true },
      { key: 'contribution', label: 'Ką aš konkrečiai padariau', type: 'textarea', required: true },
      { key: 'teamwork', label: 'Komandos darbas (1–5)', type: 'rating', required: true },
      { key: 'blockers', label: 'Kas stabdė / kliūtys', type: 'textarea', required: false },
      { key: 'learned', label: 'Ką išmokau', type: 'textarea', required: true },
      { key: 'next_time', label: 'Ką daryčiau kitaip kitą kartą', type: 'textarea', required: true },
      { key: 'need_feedback', label: 'Ar reikia pagalbos / grįžtamo ryšio?', type: 'yesno', required: true },
      { key: 'feedback_note', label: 'Komentaras apie reikalingą pagalbą', type: 'textarea', required: true, showIf: { field: 'need_feedback', equals: 'Taip' } },
    ]
  },
  mood: {
    id: 'mood',
    name: 'Savijautos tikrinimas',
    icon: '😊',
    color: 'slate',
    description: 'Greitas savijautos patikrinimas kuratoriui',
    summary: 'Nuotaika, energija, stresas ir poreikis susisiekti.',
    fields: [
      { key: 'mood', label: 'Nuotaika (1–5)', type: 'rating', required: true },
      { key: 'energy', label: 'Energija (1–5)', type: 'rating', required: true },
      { key: 'stress', label: 'Stresas (1–5)', type: 'rating', required: true },
      { key: 'thoughts', label: 'Kas šiuo metu labiausiai sukasi galvoje?', type: 'textarea', required: false },
      { key: 'want_contact', label: 'Ar noriu, kad su manimi susisiektų mokytojas/kuratorius?', type: 'yesno', required: true },
      { key: 'contact_person', label: 'Su kuo patogiausia susisiekti', type: 'select', required: true, options: ['Auklėtojas', 'Kuratorius', 'Psichologas', 'Kitas'], showIf: { field: 'want_contact', equals: 'Taip' } },
      { key: 'contact_message', label: 'Ką norėčiau pasakyti', type: 'textarea', required: true, showIf: { field: 'want_contact', equals: 'Taip' } },
    ]
  }
};

export function getTemplate(id) {
  return TEMPLATES[id] || null;
}

export function getAllTemplates() {
  return Object.values(TEMPLATES);
}
