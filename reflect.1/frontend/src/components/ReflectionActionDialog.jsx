import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card } from "./ui";
import { ROUTES } from "../routes";

export function ReflectionActionDialog({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Refleksija</h2>
          <p className="text-slate-600 mb-6">Ką norėtumėte daryti?</p>
        </div>

        <div className="space-y-3">
          <Link to={ROUTES.STUDENT_NEW} onClick={onClose} className="block">
            <Button variant="primary" size="lg" className="w-full">
              ✍️ Sukurti naują refleksiją
            </Button>
          </Link>

          <Link to={ROUTES.STUDENT_HISTORY} onClick={onClose} className="block">
            <Button variant="secondary" size="lg" className="w-full">
              📚 Peržiūrėti ankstesnes
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={onClose}
          >
            ✕ Atšaukti
          </Button>
        </div>
      </Card>
    </div>
  );
}
