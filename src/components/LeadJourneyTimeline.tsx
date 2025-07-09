import { 
  Clock, 
  MessageSquare, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Phone, 
  Mail, 
  Video, 
  MapPin,
  CheckSquare,
  TrendingUp,
  UserPlus
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JourneyEvent } from '@/hooks/useLeadJourney';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadJourneyTimelineProps {
  events: JourneyEvent[];
}

export const LeadJourneyTimeline = ({ events }: LeadJourneyTimelineProps) => {
  
  const getIcon = (event: JourneyEvent) => {
    switch (event.type) {
      case 'lead_created':
        return <UserPlus className="w-4 h-4" />;
      case 'appointment':
        return <Calendar className="w-4 h-4" />;
      case 'follow_up':
        switch (event.data?.channel) {
          case 'Telefone':
            return <Phone className="w-4 h-4" />;
          case 'WhatsApp':
            return <MessageSquare className="w-4 h-4" />;
          case 'Email':
            return <Mail className="w-4 h-4" />;
          case 'VideoCall':
            return <Video className="w-4 h-4" />;
          case 'Presencial':
            return <MapPin className="w-4 h-4" />;
          default:
            return <MessageSquare className="w-4 h-4" />;
        }
      case 'meeting':
        return <Video className="w-4 h-4" />;
      case 'task':
        return <CheckSquare className="w-4 h-4" />;
      case 'status_change':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (event: JourneyEvent) => {
    switch (event.type) {
      case 'lead_created':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'appointment':
        if (event.status === 'Cancelado') return 'bg-red-100 text-red-800 border-red-200';
        if (event.status === 'Concluído') return 'bg-green-100 text-green-800 border-green-200';
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'follow_up':
        if (event.status === 'Pendente') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        if (event.status === 'Fechou') return 'bg-green-100 text-green-800 border-green-200';
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'task':
        if (event.status === 'Concluída') return 'bg-green-100 text-green-800 border-green-200';
        if (event.status === 'Em Andamento') return 'bg-blue-100 text-blue-800 border-blue-200';
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIconBgColor = (event: JourneyEvent) => {
    switch (event.type) {
      case 'lead_created':
        return 'bg-blue-100';
      case 'appointment':
        return 'bg-green-100';
      case 'follow_up':
        return 'bg-yellow-100';
      case 'meeting':
        return 'bg-purple-100';
      case 'task':
        return 'bg-orange-100';
      case 'status_change':
        return 'bg-indigo-100';
      default:
        return 'bg-gray-100';
    }
  };

  if (events.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center text-gray-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm sm:text-base">Nenhum evento encontrado para este lead.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {events.map((event, index) => (
        <Card key={event.id} className="relative hover:shadow-md transition-shadow">
          {/* Linha conectora - visível apenas em desktop */}
          {index < events.length - 1 && (
            <div className="hidden sm:block absolute left-6 top-12 w-px h-8 bg-gray-200" />
          )}
          
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Ícone - Responsivo */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full ${getIconBgColor(event)} flex items-center justify-center self-start`}>
                {getIcon(event)}
              </div>
              
              <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                {/* Header do item */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base">{event.title}</h4>
                  {event.status && (
                    <Badge className={`${getStatusColor(event)} text-xs w-fit`}>
                      {event.status}
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 break-words">{event.description}</p>
                
                {/* Data e hora */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
                  <span>
                    {format(parseISO(event.date), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                  {event.time && (
                    <span>{event.time.substring(0, 5)}</span>
                  )}
                </div>

                {/* Detalhes específicos por tipo */}
                {event.type === 'follow_up' && event.data && (
                  <div className="pt-2 sm:pt-3 space-y-2 text-sm">
                    {event.data.response_received && (
                      <div className="break-words">
                        <strong>Resposta:</strong> {event.data.response_received}
                      </div>
                    )}
                    {event.data.notes && (
                      <div className="break-words">
                        <strong>Observações:</strong> {event.data.notes}
                      </div>
                    )}
                  </div>
                )}

                {event.type === 'task' && event.data && (
                  <div className="pt-2 sm:pt-3 space-y-2 text-sm">
                    {event.data.priority && (
                      <div>
                        <strong>Prioridade:</strong> {event.data.priority}
                      </div>
                    )}
                    {event.data.due_date && (
                      <div>
                        <strong>Prazo:</strong> {format(parseISO(event.data.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    )}
                  </div>
                )}

                {event.type === 'appointment' && event.data && (
                  <div className="pt-2 sm:pt-3 space-y-2 text-sm">
                    {event.data.meeting_url && (
                      <div className="break-words">
                        <strong>Link da Reunião:</strong> 
                        <a 
                          href={event.data.meeting_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-1 text-blue-600 hover:underline"
                        >
                          Acessar
                        </a>
                      </div>
                    )}
                    {event.data.duration && (
                      <div>
                        <strong>Duração:</strong> {event.data.duration} minutos
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};