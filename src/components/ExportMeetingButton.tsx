import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadMeetingPDF } from '@/components/MeetingPDFExport';
import { useMeetingDetails } from '@/hooks/useMeetingDetails';
import { useMeetingParticipants } from '@/hooks/useMeetingParticipants';

interface ExportMeetingButtonProps {
  meetingId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showIcon?: boolean;
}

export const ExportMeetingButton = ({ 
  meetingId, 
  variant = 'outline',
  size = 'default',
  showIcon = true
}: ExportMeetingButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const { meeting, agenda, minutes, attachments } = useMeetingDetails(meetingId);
  const { participants } = useMeetingParticipants(meetingId);

  const handleExportPDF = async () => {
    if (!meeting) {
      toast({
        title: 'Erro',
        description: 'Dados da reunião não encontrados',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      await downloadMeetingPDF({
        meeting,
        agenda,
        minutes,
        attachments,
        participants
      });

      toast({
        title: 'Sucesso',
        description: 'PDF da reunião foi gerado e baixado com sucesso!',
        duration: 3000
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o PDF da reunião',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleExportPDF}
      disabled={isGenerating || !meeting}
      variant={variant}
      size={size}
      className="flex items-center gap-2"
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : showIcon ? (
        <Download className="w-4 h-4" />
      ) : null}
      {isGenerating ? 'Gerando PDF...' : 'Exportar PDF'}
    </Button>
  );
};