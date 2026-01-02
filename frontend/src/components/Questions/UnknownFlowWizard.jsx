import { useState } from "react";
import { Button, Textarea, Card } from "../ui";

/**
 * Unknown Flow Wizard - displayed when student clicks "Nežinau"
 * Shows 1-3 redirecting questions, then returns to original question
 */
export default function UnknownFlowWizard({ 
  onComplete, 
  onCancel,
  steps = [] // Array of { id, question, type }
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [resolvedTo, setResolvedTo] = useState(null);

  const currentQuestion = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = (value) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (isLastStep) {
      // Show resolution choice
      setResolvedTo('choice');
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleResolve = (choice) => {
    // choice: 'answered' or 'skip'
    onComplete({
      steps: steps.map(s => ({
        stepId: s.id,
        question: s.question,
        value: answers[s.id],
      })),
      resolvedTo: choice,
    });
  };

  if (resolvedTo === 'choice') {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <h3 className="font-semibold text-lg mb-4">Ką daryti toliau?</h3>
        <p className="text-sm text-slate-600 mb-6">
          Dabar grįžkite prie pradinio klausimo ir pasirinkite, kaip norite tęsti.
        </p>
        <div className="space-y-3">
          <Button
            onClick={() => handleResolve('answered')}
            className="w-full"
          >
            Grįžti ir atsakyti
          </Button>
          <Button
            onClick={() => handleResolve('skip')}
            variant="secondary"
            className="w-full"
          >
            Nenoriu atsakyti
          </Button>
          <Button
            onClick={() => setResolvedTo(null)}
            variant="ghost"
            className="w-full"
          >
            Grįžti prie pagalbos klausimų
          </Button>
        </div>
      </Card>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <Card className="p-6 max-w-md mx-auto">
      {/* Progress indicator */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>Klausimas {currentStep + 1} iš {steps.length}</span>
          <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h3 className="font-semibold text-lg mb-4">{currentQuestion.question}</h3>

      {/* Answer input */}
      <div className="space-y-4">
        {currentQuestion.type === 'textarea' || currentQuestion.type === 'text' ? (
          <Textarea
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
            placeholder="Jūsų atsakymas..."
            rows={4}
          />
        ) : (
          <Textarea
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
            placeholder="Jūsų atsakymas..."
            rows={4}
          />
        )}

        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              ← Atgal
            </Button>
          )}
          <Button
            onClick={() => handleNext(answers[currentQuestion.id])}
            disabled={!answers[currentQuestion.id]}
            className="flex-1"
          >
            {isLastStep ? 'Pabaigti' : 'Toliau →'}
          </Button>
        </div>

        <Button
          variant="ghost"
          onClick={onCancel}
          className="w-full text-sm"
        >
          Atšaukti ir grįžti
        </Button>
      </div>
    </Card>
  );
}

