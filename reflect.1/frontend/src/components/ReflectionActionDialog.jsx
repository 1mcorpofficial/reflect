import { Link } from "react-router-dom";
import { ROUTES } from "../routes";

export function ReflectionActionDialog({ onClose }) {
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 space-y-8 animate-in zoom-in-95 duration-200" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center">
          <div className="text-6xl mb-4">✍️</div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Refleksija</h2>
          <p className="text-base text-slate-600">
            Pasirinkite, ką norėtumėte daryti
          </p>
        </div>

        {/* Options */}
        <div className="grid gap-4">
          <Link to={ROUTES.STUDENT_NEW} onClick={onClose} className="block group">
            <div className="p-6 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:border-blue-400 hover:shadow-xl transition-all duration-200 cursor-pointer group-hover:scale-[1.02] transform">
              <div className="flex items-center gap-4">
                <div className="text-5xl">📝</div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-xl text-slate-900 mb-1">Refleksija</h3>
                  <p className="text-sm text-slate-600">Pasirinkti refleksijos tipą</p>
                </div>
                <div className="text-blue-600 text-3xl group-hover:translate-x-2 transition-transform">→</div>
              </div>
            </div>
          </Link>

          <Link to={ROUTES.STUDENT_HISTORY} onClick={onClose} className="block group">
            <div className="p-6 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-400 hover:shadow-xl transition-all duration-200 cursor-pointer group-hover:scale-[1.02] transform">
              <div className="flex items-center gap-4">
                <div className="text-5xl">📚</div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-xl text-slate-900 mb-1">Peržiūrėti ankstesnes</h3>
                  <p className="text-sm text-slate-600">Mano refleksijų istorija</p>
                </div>
                <div className="text-slate-600 text-3xl group-hover:translate-x-2 transition-transform">→</div>
              </div>
            </div>
          </Link>
        </div>

        {/* Cancel button */}
        <button 
          className="w-full py-4 text-base text-slate-500 hover:text-slate-900 transition-colors font-semibold rounded-lg hover:bg-slate-100"
          onClick={onClose}
        >
          Atšaukti
        </button>
      </div>
    </div>
  );
}
