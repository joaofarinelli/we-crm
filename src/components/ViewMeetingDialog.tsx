
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Users, FileText, ExternalLink } from 'lucide-react';
import { Meeting } from '@/types/meeting';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ViewMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: Meeting | null;
}

export const ViewMeetingDialog = ({ open, onOpenChange, meeting }: ViewMeetingDialogProps) => {
  if (!meeting) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendada':
        return 'bg-blue-500';
      case 'Em andamento':
        return 'bg-green-500';
      case 'Finalizada':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Detalhes da Reunião
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Título e Status */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {meeting.title}
              </h3>
              <Badge className={getStatusColor(meeting.status)}>
                {meeting.status}
              </Badge>
            </div>
          </div>

          {/* Descrição */}
          {meeting.description && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 mt-1 text-gray-500" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Descrição</h4>
                    <p className="text-gray-600">{meeting.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações da Reunião */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">Data</h4>
                    <p className="text-gray-600">
                      {format(new Date(meeting.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">Horário</h4>
                    <p className="text-gray-600">
                      {formatTime(meeting.time)} ({meeting.duration} min)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Link da Reunião */}
          {meeting.meeting_url && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-purple-500" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">Link da Reunião</h4>
                    <a 
                      href={meeting.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {meeting.meeting_url}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
