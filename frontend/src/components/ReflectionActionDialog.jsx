import { Link } from "react-router-dom";
import { ROUTES } from "../routes";

export function ReflectionActionDialog({ onClose }) {
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-center p-6">
          <div className="text-4xl mb-2">✍️</div>
          <h2 className="text-xl font-bold">Ką norėtumėte daryti?</h2>
        </div>

        {/* Options */}
        <div className="p-4 space-y-3">
          <Link to={ROUTES.STUDENT_NEW} onClick={onClose} className="block">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-100 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center text-xl">📝</div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">Sukurti naują refleksiją</h3>
                <p className="text-xs text-slate-500">Pasirinkti tipą ir pildyti</p>
              </div>
              <span className="text-blue-500 font-bold">→</span>
            </div>
          </Link>

          <Link to={ROUTES.STUDENT_HISTORY} onClick={onClose} className="block">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border-2 border-slate-100 hover:border-slate-300 hover:bg-slate-100 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-slate-500 text-white flex items-center justify-center text-xl">📚</div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">Peržiūrėti ankstesnes</h3>
                <p className="text-xs text-slate-500">Mano refleksijų istorija</p>
              </div>
              <span className="text-slate-400 font-bold">→</span>
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
