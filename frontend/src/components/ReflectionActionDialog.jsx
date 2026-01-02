import { Link } from "react-router-dom";
import { ROUTES } from "../routes";

export function ReflectionActionDialog({ onClose }) {
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-scale-in" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-center p-6 relative overflow-hidden">
          <div className="text-4xl mb-2 animate-bounce-slow relative z-10">✍️</div>
          <h2 className="text-xl font-bold relative z-10">Ką norėtumėte daryti?</h2>
        </div>

        {/* Options */}
        <div className="p-4 space-y-3 overflow-hidden">
          <Link to={ROUTES.STUDENT_NEW} onClick={onClose} className="block">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-100 hover:shadow-md transition-all duration-200 ease-in-out cursor-pointer group transform-gpu hover:scale-[1.02] active:scale-[0.98] overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300 transform-gpu flex-shrink-0 overflow-hidden">😊</div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">Savijautos pasitikrinimas</h3>
                <p className="text-xs text-slate-500">Greitas savijautos patikrinimas kuratoriui</p>
              </div>
              <span className="text-blue-500 font-bold group-hover:translate-x-1 transition-transform duration-200">→</span>
            </div>
          </Link>

          <Link to={ROUTES.STUDENT_TASKS} onClick={onClose} className="block">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-md transition-all duration-200 ease-in-out cursor-pointer group transform-gpu hover:scale-[1.02] active:scale-[0.98] overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300 transform-gpu flex-shrink-0 overflow-hidden">📋</div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">Priskirtos refleksijos</h3>
                <p className="text-xs text-slate-500">Mokytojų paskirtos užduotys</p>
              </div>
              <span className="text-emerald-500 font-bold group-hover:translate-x-1 transition-transform duration-200">→</span>
            </div>
          </Link>

          <Link to={ROUTES.STUDENT_HISTORY} onClick={onClose} className="block">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border-2 border-slate-100 hover:border-slate-300 hover:bg-slate-100 hover:shadow-md transition-all duration-200 ease-in-out cursor-pointer group transform-gpu hover:scale-[1.02] active:scale-[0.98] overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-slate-500 text-white flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300 transform-gpu flex-shrink-0 overflow-hidden">📚</div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">Peržiūrėti ankstesnes</h3>
                <p className="text-xs text-slate-500">Mano refleksijų istorija</p>
              </div>
              <span className="text-slate-400 font-bold group-hover:translate-x-1 transition-transform duration-200">→</span>
            </div>
          </Link>
        </div>

        {/* Cancel */}
        <div className="px-4 pb-4">
          <button 
            className="w-full py-3 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition font-medium"
            onClick={onClose}
          >
            ✕ Atšaukti
          </button>
        </div>
      </div>
    </div>
  );
}
