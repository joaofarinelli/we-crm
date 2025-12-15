import { useState } from 'react';
import { LeadFormSettings, LeadFormField } from '@/types/leadForm';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormPreviewProps {
  settings: LeadFormSettings;
  fields: Omit<LeadFormField, 'id' | 'form_id' | 'created_at'>[];
}

type PreviewStep = 'welcome' | 'success' | number;

export const FormPreview = ({ settings, fields }: FormPreviewProps) => {
  const [previewStep, setPreviewStep] = useState<PreviewStep>('welcome');
  
  const isGradient = settings.backgroundColor.includes('gradient');
  
  const backgroundStyle = {
    background: isGradient ? settings.backgroundColor : undefined,
    backgroundColor: !isGradient ? settings.backgroundColor : undefined,
  };

  const welcomeMessage = settings.welcomeMessage || `${settings.title}\n\n${settings.subtitle}`;
  const startButtonText = settings.startButtonText || 'Começar';
  const nextButtonText = settings.nextButtonText || 'Próximo';
  const backButtonText = settings.backButtonText || 'Voltar';

  const resetPreview = () => setPreviewStep('welcome');

  // Welcome screen preview
  if (previewStep === 'welcome') {
    return (
      <div
        className="min-h-[500px] rounded-lg p-6 flex items-center justify-center"
        style={backgroundStyle}
      >
        <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-2xl shadow-lg p-8 text-center">
          {/* Logo */}
          {settings.logoUrl && (
            <div className="mb-6">
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="h-14 mx-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Welcome Message */}
          <p className="text-base text-gray-700 whitespace-pre-line leading-relaxed mb-6">
            {welcomeMessage}
          </p>

          {/* Start Button */}
          <button
            onClick={() => fields.length > 0 && setPreviewStep(0)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: settings.primaryColor }}
          >
            {startButtonText}
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Field count */}
          <p className="mt-4 text-xs text-gray-500">
            {fields.length} {fields.length === 1 ? 'pergunta' : 'perguntas'}
          </p>
        </div>
      </div>
    );
  }

  // Success screen preview
  if (previewStep === 'success') {
    return (
      <div
        className="min-h-[500px] rounded-lg p-6 flex items-center justify-center"
        style={backgroundStyle}
      >
        <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold mb-4 text-gray-800">{settings.successMessage}</h2>
          <button
            onClick={resetPreview}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  // Step form preview
  const currentField = fields[previewStep];
  if (!currentField) {
    return (
      <div className="min-h-[500px] rounded-lg p-6 flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Adicione campos ao formulário</p>
      </div>
    );
  }

  const isLastStep = previewStep === fields.length - 1;
  const progress = ((previewStep + 1) / fields.length) * 100;

  return (
    <div
      className="min-h-[500px] rounded-lg p-6 flex items-center justify-center"
      style={backgroundStyle}
    >
      <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-2xl shadow-lg p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">
              Pergunta {previewStep + 1} de {fields.length}
            </span>
            <span className="text-xs text-gray-500">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Logo (small) */}
        {settings.logoUrl && (
          <div className="mb-3">
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="h-6 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Current Field */}
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-3 text-gray-800">
            {currentField.label}
            {currentField.is_required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          {currentField.field_type === 'textarea' ? (
            <Textarea
              placeholder={currentField.placeholder}
              className="w-full"
              disabled
            />
          ) : currentField.field_type === 'select' ? (
            <Select disabled>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={currentField.placeholder || 'Selecione...'} />
              </SelectTrigger>
              <SelectContent>
                {(currentField.options || []).map((opt, i) => (
                  <SelectItem key={i} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              type={currentField.field_type === 'email' ? 'email' : currentField.field_type === 'phone' ? 'tel' : 'text'}
              placeholder={currentField.placeholder}
              className="w-full py-5"
              disabled
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => previewStep === 0 ? setPreviewStep('welcome') : setPreviewStep(previewStep - 1)}
            className="flex-1 py-3 px-3 rounded-xl font-medium text-gray-600 bg-gray-100 transition-all hover:bg-gray-200 flex items-center justify-center gap-1 text-sm"
          >
            <ArrowLeft className="w-3 h-3" />
            {backButtonText}
          </button>
          
          {isLastStep ? (
            <button
              onClick={() => setPreviewStep('success')}
              className="flex-1 py-3 px-3 rounded-xl font-medium text-white transition-all hover:opacity-90 flex items-center justify-center gap-1 text-sm"
              style={{ backgroundColor: settings.primaryColor }}
            >
              {settings.buttonText}
            </button>
          ) : (
            <button
              onClick={() => setPreviewStep(previewStep + 1)}
              className="flex-1 py-3 px-3 rounded-xl font-medium text-white transition-all hover:opacity-90 flex items-center justify-center gap-1 text-sm"
              style={{ backgroundColor: settings.primaryColor }}
            >
              {nextButtonText}
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Reset link */}
        <p className="mt-3 text-center">
          <button
            onClick={resetPreview}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Reiniciar preview
          </button>
        </p>
      </div>
    </div>
  );
};
