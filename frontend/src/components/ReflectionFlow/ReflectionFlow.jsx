/**
 * Apple-inspired Reflection Flow
 * Progressive disclosure: one question per screen (Quick Check → Factors → Optional Text → Saved + Insight)
 */
import { useState, useEffect } from 'react';
import { Scale, Chips, Toast, Sheet, TrafficLight, Emotions, Thermometer, SentenceCompletion } from '../Apple';
import { Button, Card, Textarea, Input } from '../ui';
import { getReflectionSchema } from '../../data/reflectionSchemas';
import UnknownFlowWizard from '../Questions/UnknownFlowWizard';

export default function ReflectionFlow({ 
  schemaId, 
  onSubmit, 
  onCancel,
  taskId = null 
}) {
  const schema = getReflectionSchema(schemaId);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [answerStatuses, setAnswerStatuses] = useState({}); // 'answered', 'skip', 'unknown'
  const [unknownFlows, setUnknownFlows] = useState({});
  const [activeUnknownFlow, setActiveUnknownFlow] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!schema) {
    return <div className="p-6 text-center text-slate-600">Schema nerasta</div>;
  }

  const steps = schema.steps || [];
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Check if current step is filled
  const isCurrentStepFilled = () => {
    if (!currentStepData) return false;
    const stepId = currentStepData.id;
    const status = answerStatuses[stepId];

    if (status === 'skip' || status === 'unknown') return true;
    if (currentStepData.type === 'scale' || currentStepData.type === 'thermometer' || currentStepData.type === 'traffic-light') {
      return answers[stepId] !== undefined;
    }
    if (currentStepData.type === 'chips' || currentStepData.type === 'emotions') {
      const selected = answers[stepId] || [];
      if (currentStepData.min !== undefined) return selected.length >= currentStepData.min;
      return selected.length > 0;
    }
    if (currentStepData.type === 'text' || currentStepData.type === 'text-optional' || currentStepData.type === 'sentence-completion') {
      return answers[stepId] && answers[stepId].trim() !== '';
    }
    if (currentStepData.type === 'yesno') {
      return answers[stepId] !== undefined;
    }
    return false;
  };

  const handleNext = () => {
    if (!isCurrentStepFilled() && currentStepData.required) {
      setError('Prašome užpildyti šį lauką');
      return;
    }

    setError('');
    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setError('');
    }
  };

  const handleAnswer = (stepId, value, status = 'answered') => {
    setAnswers(prev => ({ ...prev, [stepId]: value }));
    setAnswerStatuses(prev => ({ ...prev, [stepId]: status }));
    setError('');
  };

  const handleUniversalChoice = (stepId, choice, flowData = null) => {
    setAnswerStatuses(prev => ({ ...prev, [stepId]: choice }));
    if (choice === 'unknown' && flowData) {
      setUnknownFlows(prev => ({ ...prev, [stepId]: flowData }));
      setAnswers(prev => ({ ...prev, [stepId]: null }));
    } else if (choice === 'skip') {
      setAnswers(prev => ({ ...prev, [stepId]: null }));
      setUnknownFlows(prev => {
        const newFlows = { ...prev };
        delete newFlows[stepId];
        return newFlows;
      });
    }
    setActiveUnknownFlow(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Transform answers to API format
      const submissionData = {
        templateId: schemaId,
        taskId,
        answers: {},
        answerStatuses: {},
        unknownFlows: {},
      };

      steps.forEach(step => {
        const stepId = step.id;
        submissionData.answers[stepId] = answers[stepId];
        submissionData.answerStatuses[stepId] = answerStatuses[stepId] || 'answered';
        if (unknownFlows[stepId]) {
          submissionData.unknownFlows[stepId] = unknownFlows[stepId];
        }
      });

      await onSubmit(submissionData);
      setShowToast(true);
      
      // Show success for 2 seconds, then callback
      setTimeout(() => {
        if (onSubmit) {
          // onSubmit callback will handle navigation
        }
      }, 2000);
    } catch (err) {
      setError('Nepavyko išsaugoti refleksijos');
      setLoading(false);
    }
  };

  const renderStep = () => {
    if (!currentStepData) return null;

    const stepId = currentStepData.id;
    const status = answerStatuses[stepId];
    const isSkipped = status === 'skip';
    const isUnknown = status === 'unknown';

    // Handle unknown flow wizard
    if (activeUnknownFlow === stepId) {
      const clarifierSteps = [
        {
          id: 'clarifier_1',
          question: 'Kas labiau tinka?',
          type: 'textarea',
        },
        {
          id: 'clarifier_2',
          question: 'Kiek supratai?',
          type: 'textarea',
        },
      ];

      return (
        <UnknownFlowWizard
          steps={clarifierSteps}
          onComplete={(flowData) => handleUniversalChoice(stepId, 'unknown', flowData)}
          onCancel={() => setActiveUnknownFlow(null)}
        />
      );
    }

    switch (currentStepData.type) {
      case 'scale':
        return (
          <div className="space-y-6">
            <Scale
              value={answers[stepId]}
              onChange={(value) => handleAnswer(stepId, value)}
              min={currentStepData.scale?.min || 1}
              max={currentStepData.scale?.max || 5}
              labels={currentStepData.scale?.labels || []}
              label={currentStepData.label}
            />
            
            {(currentStepData.allowRefuse || currentStepData.allowDontKnow) && (
              <div className="flex gap-3 pt-4">
                {currentStepData.allowRefuse && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUniversalChoice(stepId, 'skip')}
                    className={isSkipped ? 'bg-slate-100' : ''}
                  >
                    Nenoriu atsakyti
                  </Button>
                )}
                {currentStepData.allowDontKnow && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveUnknownFlow(stepId)}
                    className={isUnknown ? 'bg-slate-100' : ''}
                  >
                    Nežinau
                  </Button>
                )}
              </div>
            )}
          </div>
        );

      case 'chips':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                {currentStepData.label}
              </h3>
              {currentStepData.subtitle && (
                <p className="text-sm text-slate-600">{currentStepData.subtitle}</p>
              )}
            </div>
            
            <Chips
              options={currentStepData.chips || []}
              selected={answers[stepId] || []}
              onChange={(selected) => handleAnswer(stepId, selected)}
              multiple={true}
            />
            
            {currentStepData.min && (
              <p className="text-xs text-slate-500 mt-2">
                Pasirinkite bent {currentStepData.min} {currentStepData.min === 1 ? 'faktorių' : 'faktorius'}
              </p>
            )}
          </div>
        );

      case 'text':
      case 'text-optional':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-lg font-semibold text-slate-900 block mb-1">
                {currentStepData.label}
                {currentStepData.required && <span className="text-rose-500 ml-1">*</span>}
              </label>
              {currentStepData.placeholder && (
                <p className="text-sm text-slate-600 mb-3">{currentStepData.placeholder}</p>
              )}
            </div>
            
            <Textarea
              value={answers[stepId] || ''}
              onChange={(e) => handleAnswer(stepId, e.target.value)}
              placeholder={currentStepData.placeholder || 'Įveskite...'}
              rows={6}
              className="resize-none"
            />
            
            {!currentStepData.required && (
              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUniversalChoice(stepId, 'skip')}
                  className={isSkipped ? 'bg-slate-100' : ''}
                >
                  Nenoriu atsakyti
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveUnknownFlow(stepId)}
                  className={isUnknown ? 'bg-slate-100' : ''}
                >
                  Nežinau
                </Button>
              </div>
            )}
          </div>
        );

      case 'yesno':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {currentStepData.label}
              {currentStepData.required && <span className="text-rose-500 ml-1">*</span>}
            </h3>
            
            <div className="flex gap-4">
              <Button
                variant={answers[stepId] === 'Taip' ? 'primary' : 'secondary'}
                onClick={() => handleAnswer(stepId, 'Taip')}
                className="flex-1 min-h-[60px]"
              >
                Taip
              </Button>
              <Button
                variant={answers[stepId] === 'Ne' ? 'primary' : 'secondary'}
                onClick={() => handleAnswer(stepId, 'Ne')}
                className="flex-1 min-h-[60px]"
              >
                Ne
              </Button>
            </div>
            
            {(currentStepData.allowRefuse || currentStepData.allowDontKnow) && (
              <div className="flex gap-3 pt-2">
                {currentStepData.allowRefuse && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUniversalChoice(stepId, 'skip')}
                    className={isSkipped ? 'bg-slate-100' : ''}
                  >
                    Nenoriu atsakyti
                  </Button>
                )}
                {currentStepData.allowDontKnow && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveUnknownFlow(stepId)}
                    className={isUnknown ? 'bg-slate-100' : ''}
                  >
                    Nežinau
                  </Button>
                )}
              </div>
            )}
          </div>
        );

      case 'traffic-light':
        return (
          <div className="space-y-4">
            <TrafficLight
              value={answers[stepId]}
              onChange={(value) => handleAnswer(stepId, value)}
              options={currentStepData.options || undefined}
              label={currentStepData.label}
            />
            
            {(currentStepData.allowRefuse || currentStepData.allowDontKnow) && (
              <div className="flex gap-3 pt-4">
                {currentStepData.allowRefuse && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUniversalChoice(stepId, 'skip')}
                    className={isSkipped ? 'bg-slate-100' : ''}
                  >
                    Nenoriu atsakyti
                  </Button>
                )}
                {currentStepData.allowDontKnow && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveUnknownFlow(stepId)}
                    className={isUnknown ? 'bg-slate-100' : ''}
                  >
                    Nežinau
                  </Button>
                )}
              </div>
            )}
          </div>
        );

      case 'emotions':
        return (
          <div className="space-y-4">
            <Emotions
              value={answers[stepId]}
              onChange={(value) => handleAnswer(stepId, value)}
              emotions={currentStepData.emotions || undefined}
              multiple={currentStepData.multiple !== false}
              label={currentStepData.label}
            />
            
            {(currentStepData.allowRefuse || currentStepData.allowDontKnow) && (
              <div className="flex gap-3 pt-4">
                {currentStepData.allowRefuse && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUniversalChoice(stepId, 'skip')}
                    className={isSkipped ? 'bg-slate-100' : ''}
                  >
                    Nenoriu atsakyti
                  </Button>
                )}
                {currentStepData.allowDontKnow && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveUnknownFlow(stepId)}
                    className={isUnknown ? 'bg-slate-100' : ''}
                  >
                    Nežinau
                  </Button>
                )}
              </div>
            )}
          </div>
        );

      case 'thermometer':
        return (
          <div className="space-y-4">
            <Thermometer
              value={answers[stepId]}
              onChange={(value) => handleAnswer(stepId, value)}
              min={currentStepData.thermometer?.min || 1}
              max={currentStepData.thermometer?.max || 10}
              labels={currentStepData.thermometer?.labels || []}
              label={currentStepData.label}
              orientation={currentStepData.thermometer?.orientation || 'vertical'}
            />
            
            {(currentStepData.allowRefuse || currentStepData.allowDontKnow) && (
              <div className="flex gap-3 pt-4">
                {currentStepData.allowRefuse && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUniversalChoice(stepId, 'skip')}
                    className={isSkipped ? 'bg-slate-100' : ''}
                  >
                    Nenoriu atsakyti
                  </Button>
                )}
                {currentStepData.allowDontKnow && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveUnknownFlow(stepId)}
                    className={isUnknown ? 'bg-slate-100' : ''}
                  >
                    Nežinau
                  </Button>
                )}
              </div>
            )}
          </div>
        );

      case 'sentence-completion':
        return (
          <div className="space-y-4">
            <SentenceCompletion
              value={answers[stepId]}
              onChange={(value) => handleAnswer(stepId, value)}
              template={currentStepData.template || "Šiandien supratau..."}
              label={currentStepData.label}
              multiline={currentStepData.multiline || false}
            />
            
            {!currentStepData.required && (
              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUniversalChoice(stepId, 'skip')}
                  className={isSkipped ? 'bg-slate-100' : ''}
                >
                  Nenoriu atsakyti
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveUnknownFlow(stepId)}
                  className={isUnknown ? 'bg-slate-100' : ''}
                >
                  Nežinau
                </Button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
            <span>Žingsnis {currentStep + 1} iš {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <Card className="mb-6 min-h-[400px] flex flex-col">
          <div className="flex-1 py-8 px-6">
            {renderStep()}
          </div>
        </Card>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={currentStep > 0 ? handleBack : onCancel}
            disabled={loading}
          >
            {currentStep > 0 ? '← Atgal' : 'Atšaukti'}
          </Button>
          
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={loading || (!isCurrentStepFilled() && currentStepData?.required)}
            className="min-w-[120px]"
          >
            {loading ? 'Saugoma...' : isLastStep ? 'Pateikti' : 'Toliau →'}
          </Button>
        </div>
      </div>

      {/* Toast notification */}
      <Toast
        show={showToast}
        message="Išsaugota"
        subtitle="Jūsų refleksija sėkmingai pateikta"
        variant="success"
        onClose={() => setShowToast(false)}
        duration={2000}
      />
    </>
  );
}
