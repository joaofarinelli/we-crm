
import { Clock, MessageSquare, Phone, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AppointmentRecord, FollowUp } from '@/types/appointmentRecord';
import { Appointment } from '@/types/appointment';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimelineItem {
  id: string;
  type: 'appointment' | 'record' | 'followup';
  date: string;
  time?: string;
  title: string;
  description: string;
  status?: string;
  data: Appointment | AppointmentRecord | FollowUp;
}

interface AppointmentTimelineProps {
  appointment: Appointment;
  records: AppointmentRecord[];
  followUps: FollowUp[];
  onRecordAttendance: () => void;
  onAddFollowUp: () => void;
  onCompleteFollowUp: (followUp: FollowUp) => void;
}

export const AppointmentTimeline = ({ 
  appointment, 
  records, 
  followUps,
  onRecordAttendance,
  onAddFollowUp,
  onCompleteFollowUp
}: AppointmentTimelineProps) => {
  
  const createTimelineItems = (): TimelineItem[] => {
    const items: TimelineItem[] = [];

    // Adicionar agendamento
    items.push({
      id: appointment.id,
      type: 'appointment',
      date: appointment.date,
      time: appointment.time,
      title: appointment.title,
      description: appointment.description || 'Agendamento inicial',
      status: appointment.status,
      data: appointment
    });

    // Adicionar registros de atendimento
    records.forEach(record => {
      items.push({
        id: record.id,
        type: 'record',
        date: record.start_time.split('T')[0],
        time: format(parseISO(record.start_time), 'HH:mm'),
        title: 'Atendimento Realizado',
        description: record.summary,
        status: record.outcome || 'Registrado',
        data: record
      });
    });

    // Adicionar follow-ups
    followUps.forEach(followUp => {
      items.push({
        id: followUp.id,
        type: 'followup',
        date: followUp.scheduled_date,
        time: followUp.scheduled_time,
        title: `Follow-up #${followUp.sequence_number} - ${followUp.channel}`,
        description: followUp.message_sent || 'Follow-up agendado',
        status: followUp.completed ? (followUp.result || 'Concluído') : 'Pendente',
        data: followUp
      });
    });

    // Ordenar por data e hora
    return items.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
      const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const timelineItems = createTimelineItems();

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-4 h-4" />;
      case 'record':
        return <CheckCircle className="w-4 h-4" />;
      case 'followup':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (type: string, status?: string) => {
    if (type === 'followup' && status === 'Pendente') return 'bg-yellow-100 text-yellow-800';
    if (type === 'followup' && status === 'Fechou') return 'bg-green-100 text-green-800';
    if (type === 'record' && status === 'Fechou') return 'bg-green-100 text-green-800';
    if (status === 'Cancelado') return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  };

  const hasRecord = records.length > 0;
  const hasPendingFollowUps = followUps.some(f => !f.completed);

  return (
    <div className="space-y-6">
      {/* Botões de Ação */}
      <div className="flex gap-2 flex-wrap">
        {!hasRecord && appointment.status !== 'Cancelado' && (
          <Button onClick={onRecordAttendance} size="sm">
            <CheckCircle className="w-4 h-4 mr-2" />
            Registrar Atendimento
          </Button>
        )}
        
        {hasRecord && (
          <Button onClick={onAddFollowUp} variant="outline" size="sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            Adicionar Follow-up
          </Button>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {timelineItems.map((item, index) => (
          <Card key={item.id} className="relative">
            {index < timelineItems.length - 1 && (
              <div className="absolute left-6 top-12 w-px h-8 bg-gray-200" />
            )}
            
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  {getIcon(item.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    {item.status && (
                      <Badge className={getStatusColor(item.type, item.status)}>
                        {item.status}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>
                      {format(parseISO(item.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                    {item.time && (
                      <span>{item.time}</span>
                    )}
                  </div>

                  {/* Ações específicas para follow-ups pendentes */}
                  {item.type === 'followup' && item.status === 'Pendente' && (
                    <div className="mt-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onCompleteFollowUp(item.data as FollowUp)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Marcar como Concluído
                      </Button>
                    </div>
                  )}

                  {/* Detalhes adicionais para registros */}
                  {item.type === 'record' && (
                    <div className="mt-3 space-y-2 text-sm">
                      {(item.data as AppointmentRecord).objections && (
                        <div>
                          <strong>Objeções:</strong> {(item.data as AppointmentRecord).objections}
                        </div>
                      )}
                      {(item.data as AppointmentRecord).next_steps && (
                        <div>
                          <strong>Próximos Passos:</strong> {(item.data as AppointmentRecord).next_steps}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Detalhes adicionais para follow-ups */}
                  {item.type === 'followup' && (
                    <div className="mt-3 space-y-2 text-sm">
                      {(item.data as FollowUp).response_received && (
                        <div>
                          <strong>Resposta:</strong> {(item.data as FollowUp).response_received}
                        </div>
                      )}
                      {(item.data as FollowUp).notes && (
                        <div>
                          <strong>Observações:</strong> {(item.data as FollowUp).notes}
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

      {timelineItems.length === 1 && (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center text-gray-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>Nenhum atendimento ou follow-up registrado ainda.</p>
            <p className="text-sm">Registre o atendimento para iniciar o acompanhamento.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
