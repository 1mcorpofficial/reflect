import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { getTemplate } from "../../data/templates";
import { getRoute, ROUTES } from "../../routes";
import { Card } from "../../components/ui";

export default function StudentNewReflection() {
  const navigate = useNavigate();
  // Studentas gali daryti tik "Savijautos pasitikrinimas" pats
  // Kitos refleksijos priskiriamos mokytojo per užduotis
  const moodTemplate = getTemplate('mood');

  const handleSelect = () => {
    if (moodTemplate) {
      navigate(getRoute(ROUTES.STUDENT_NEW_TEMPLATE, { templateId: moodTemplate.id }));
    }
  };


  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <button 
            onClick={() => navigate(ROUTES.STUDENT_HOME)}
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-3 transition"
          >
            ← Grįžti
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Savijautos pasitikrinimas</h1>
          <p className="text-sm text-slate-500 mt-1">Greitas savijautos patikrinimas kuratoriui</p>
        </div>

        {/* Mood Template Card */}
        {!moodTemplate ? (
          <Card className="text-center py-12">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-slate-600">Savijautos pasitikrinimas nerastas</p>
          </Card>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="hover:shadow-lg transition-all duration-200">
              <button
                onClick={handleSelect}
                className="w-full flex items-center gap-4 p-6 text-left"
              >
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-3xl flex-shrink-0 hover:scale-110 transition-transform duration-200 icon-bounce">
                  {moodTemplate.icon}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-xl text-slate-900">{moodTemplate.name}</h3>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                      {moodTemplate.fields.length} klausimų
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{moodTemplate.description}</p>
                  <p className="text-xs text-slate-500">Nuotaika, energija, stresas ir poreikis susisiekti</p>
                </div>

                {/* Arrow */}
                <div className="text-slate-400 text-xl flex-shrink-0 hover:translate-x-1 transition-transform duration-200">
                  →
                </div>
              </button>
            </Card>

            {/* Info about other reflections */}
            <Card className="mt-6 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <div className="text-2xl">ℹ️</div>
                <div>
                  <h4 className="font-semibold text-sm text-blue-900 mb-1">Kitos refleksijos</h4>
                  <p className="text-xs text-blue-700">
                    Kitos refleksijų tipai (Pamokos, Savaitės, Kontrolinio, Projekto) yra priskiriamos mokytojo. 
                    Peržiūrėkite <button onClick={() => navigate(ROUTES.STUDENT_TASKS)} className="underline font-medium">Mano užduotis</button> puslapį.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

      </div>
    </Layout>
  );
}
