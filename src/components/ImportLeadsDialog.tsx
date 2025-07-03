import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import Papa from 'papaparse';
import { useToast } from '@/hooks/use-toast';

interface ImportLeadsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CSVLead {
  nome: string;
  email?: string;
  telefone?: string;
  status?: string;
  origem?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export const ImportLeadsDialog = ({ open, onOpenChange }: ImportLeadsDialogProps) => {
  const { importLeadsFromCSV } = useLeads();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [leads, setLeads] = useState<CSVLead[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: number;
    total: number;
  } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo CSV válido",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Normalizar nomes das colunas
        const normalized = header.toLowerCase().trim();
        if (normalized.includes('nome') || normalized.includes('name')) return 'nome';
        if (normalized.includes('email') || normalized.includes('e-mail')) return 'email';
        if (normalized.includes('telefone') || normalized.includes('phone') || normalized.includes('celular')) return 'telefone';
        if (normalized.includes('status')) return 'status';
        if (normalized.includes('origem') || normalized.includes('source')) return 'origem';
        return header;
      },
      complete: (results) => {
        const parsedLeads = results.data as CSVLead[];
        const errors: ValidationError[] = [];

        // Validar dados
        parsedLeads.forEach((lead, index) => {
          if (!lead.nome || lead.nome.trim() === '') {
            errors.push({
              row: index + 1,
              field: 'nome',
              message: 'Nome é obrigatório'
            });
          }

          if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
            errors.push({
              row: index + 1,
              field: 'email',
              message: 'Email inválido'
            });
          }
        });

        setLeads(parsedLeads);
        setValidationErrors(errors);
        setStep('preview');
      },
      error: (error) => {
        toast({
          title: "Erro",
          description: `Erro ao ler arquivo CSV: ${error.message}`,
          variant: "destructive"
        });
      }
    });
  };

  const handleImport = async () => {
    if (leads.length === 0) return;

    setImporting(true);
    setStep('importing');
    setProgress(0);

    try {
      const results = await importLeadsFromCSV(leads, (progress) => {
        setProgress(progress);
      });

      setImportResults(results);
      setStep('complete');

      toast({
        title: "Importação concluída",
        description: `${results.success} leads importados com sucesso${results.errors > 0 ? `, ${results.errors} com erro` : ''}`,
      });
    } catch (error) {
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro durante a importação dos leads",
        variant: "destructive"
      });
      setStep('preview');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = 'nome,email,telefone,status,origem\nJoão Silva,joao@email.com,(11) 99999-9999,Quente,Instagram\nMaria Santos,maria@email.com,(11) 88888-8888,Morno,Facebook';
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_leads.csv';
    link.click();
  };

  const resetDialog = () => {
    setFile(null);
    setLeads([]);
    setValidationErrors([]);
    setImporting(false);
    setProgress(0);
    setStep('upload');
    setImportResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Importar Leads via CSV</DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <div className="text-center border-2 border-dashed border-border rounded-lg p-8">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <div className="space-y-2">
                <Label htmlFor="csvFile" className="cursor-pointer">
                  <div className="text-lg font-medium">Selecione um arquivo CSV</div>
                  <div className="text-sm text-muted-foreground">
                    Clique aqui ou arraste um arquivo CSV
                  </div>
                </Label>
                <Input
                  ref={fileInputRef}
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">
                Formato esperado: nome, email, telefone, status, origem
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Baixar Template
              </Button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{leads.length} leads encontrados</div>
                {validationErrors.length > 0 && (
                  <div className="text-destructive text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.length} erro(s) encontrado(s)
                  </div>
                )}
              </div>
            </div>

            {validationErrors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="font-medium text-destructive mb-2">Erros encontrados:</div>
                <div className="space-y-1 text-sm">
                  {validationErrors.slice(0, 5).map((error, index) => (
                    <div key={index}>
                      Linha {error.row}, {error.field}: {error.message}
                    </div>
                  ))}
                  {validationErrors.length > 5 && (
                    <div className="text-muted-foreground">
                      ... e mais {validationErrors.length - 5} erro(s)
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="max-h-64 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Nome</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Telefone</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Origem</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.slice(0, 10).map((lead, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{lead.nome}</td>
                      <td className="p-2">{lead.email || '-'}</td>
                      <td className="p-2">{lead.telefone || '-'}</td>
                      <td className="p-2">{lead.status || 'Frio'}</td>
                      <td className="p-2">{lead.origem || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {leads.length > 10 && (
                <div className="p-2 text-center text-muted-foreground">
                  ... e mais {leads.length - 10} lead(s)
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="space-y-4 text-center">
            <div className="space-y-2">
              <div className="font-medium">Importando leads...</div>
              <Progress value={progress} className="w-full" />
              <div className="text-sm text-muted-foreground">
                {Math.round(progress)}% concluído
              </div>
            </div>
          </div>
        )}

        {step === 'complete' && importResults && (
          <div className="space-y-4 text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            <div>
              <div className="font-medium text-lg mb-2">Importação concluída!</div>
              <div className="space-y-1 text-sm">
                <div className="text-green-600">
                  ✓ {importResults.success} leads importados com sucesso
                </div>
                {importResults.errors > 0 && (
                  <div className="text-destructive">
                    ✗ {importResults.errors} leads com erro
                  </div>
                )}
                <div className="text-muted-foreground">
                  Total processado: {importResults.total}
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
          )}

          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                Voltar
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={leads.length === 0 || validationErrors.length > 0}
              >
                Importar {leads.length} Lead(s)
              </Button>
            </>
          )}

          {step === 'importing' && (
            <Button disabled>
              Importando...
            </Button>
          )}

          {step === 'complete' && (
            <Button onClick={handleClose}>
              Concluir
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};