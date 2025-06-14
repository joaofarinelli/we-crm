
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, User, Eye, Edit, Trash2, CheckCircle, MessageSquare, Timeline } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppointments } from '@/hooks/useAppointments';
import { ViewAppointmentDialog } from '@/components/ViewAppointmentDialog';
import { EditAppointmentDialog } from '@/components/EditAppointmentDialog';
import { ViewAppointmentTimelineDialog } from '@/components/ViewAppointmentTimelineDialog';
import { RecordAttendanceDialog } from '@/components/RecordAttendanceDialog';
import { AddFollowUpDialog } from '@/components/AddFollowUpDialog';
import { useAppointmentRecords } from '@/hooks/useAppointmentRecords';
import { useFollowUps } from '@/hooks/useFollowUps';
import { Appointment } from '@/types/appointment';

interface AppointmentCardProps {
  appointment: Appointment;
}

export const AppointmentCard = ({ appointment }: AppointmentCardProps) => {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [timelineDialogOpen, setTimelineDialogOpen] = useState(false);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);

  const { deleteAppointment } = useAppointments();
  const { getRecordsByAppointment } = useAppointmentRecords();
  const { getFollowUpsByAppointment, getPendingFollowUps } = useFollowUps();

  const appointmentRecords = getRecordsByAppointment(appointment.id);
  const appointmentFollowUps = getFollowUpsByAppointment(appointment.id);
  const pendingFollowUps = appointmentFollowUps.filter(f => !f.completed);

  const hasRecord = appointmentRecords.length > 0;
  const hasPendingFollowUps = pendingFollowUps.length > 0;

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      await deleteAppointment(appointment.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendado':
        return 'bg-blue-100 text-blue-800';
      case 'Confirmado':
        return 'bg-green-100 text-green-800';
      case 'Realizado':
        return 'bg-purple-100 text-purple-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const shouldShowRecordButton = !hasRecord && appointment.status !== 'Cancelado';
  const shouldShowFollowUpButton = hasRecord;

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                {appointment.title}
              </h3>
              <Badge className={getStatusColor(appointment.status)}>
                {appointment.status}
              </Badge>
            </div>
            
            {/* Indicadores visuais */}
            <div className="flex gap-1">
              {hasRecord && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Registrado
                </Badge>
              )}
              {hasPendingFollowUps && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {pendingFollowUps.length} Follow-up{pendingFollowUps.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{format(parseISO(appointment.date), 'dd/MM/yyyy', { locale: ptBR })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{appointment.time} ({appointment.duration}min)</span>
            </div>
          </div>

          {appointment.leads?.name && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{appointment.leads.name}</span>
            </div>
          )}

          {appointment.assigned_closer && (
            <div className="text-sm text-gray-600">
              <strong>Responsável:</strong> {appointment.assigned_closer.full_name || appointment.assigned_closer.email}
            </div>
          )}

          {appointment.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {appointment.description}
            </p>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewDialogOpen(true)}
            >
              <Eye className="w-4 h-4 mr-1" />
              Ver
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setTimelineDialogOpen(true)}
            >
              <Timeline className="w-4 h-4 mr-1" />
              Timeline
            </Button>

            {shouldShowRecordButton && (
              <Button
                size="sm"
                onClick={() => setRecordDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Registrar
              </Button>
            )}

            {shouldShowFollowUpButton && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFollowUpDialogOpen(true)}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Follow-up
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Excluir
            </Button>
          </div>
        </CardContent>
      </Card>

      <ViewAppointmentDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        appointment={appointment}
      />

      <EditAppointmentDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        appointment={appointment}
      />

      <ViewAppointmentTimelineDialog
        open={timelineDialogOpen}
        onOpenChange={setTimelineDialogOpen}
        appointment={appointment}
      />

      <RecordAttendanceDialog
        open={recordDialogOpen}
        onOpenChange={setRecordDialogOpen}
        appointment={appointment}
      />

      <AddFollowUpDialog
        open={followUpDialogOpen}
        onOpenChange={setFollowUpDialogOpen}
        appointment={appointment}
        appointmentRecordId={appointmentRecords[0]?.id}
      />
    </>
  );
};
