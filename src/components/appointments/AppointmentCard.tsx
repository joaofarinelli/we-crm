
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, User, Eye, Edit, Trash2, CheckCircle, MessageSquare, History, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  const { getFollowUpsByAppointment } = useFollowUps();

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
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Confirmado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Realizado':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const shouldShowRecordButton = !hasRecord && appointment.status !== 'Cancelado';
  const shouldShowFollowUpButton = hasRecord;

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-200 group">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {appointment.title}
              </h3>
              <Badge className={`${getStatusColor(appointment.status)} text-xs`}>
                {appointment.status}
              </Badge>
            </div>
            
            {/* Mobile Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:hidden">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setViewDialogOpen(true)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Detalhes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimelineDialogOpen(true)}>
                  <History className="w-4 h-4 mr-2" />
                  Timeline
                </DropdownMenuItem>
                {shouldShowRecordButton && (
                  <DropdownMenuItem onClick={() => setRecordDialogOpen(true)}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Registrar
                  </DropdownMenuItem>
                )}
                {shouldShowFollowUpButton && (
                  <DropdownMenuItem onClick={() => setFollowUpDialogOpen(true)}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Follow-up
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Indicadores visuais - Responsivos */}
          <div className="flex flex-wrap gap-1 mt-2">
            {hasRecord && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Registrado</span>
                <span className="sm:hidden">✓</span>
              </Badge>
            )}
            {hasPendingFollowUps && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                <MessageSquare className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">{pendingFollowUps.length} Follow-up{pendingFollowUps.length > 1 ? 's' : ''}</span>
                <span className="sm:hidden">{pendingFollowUps.length}</span>
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between space-y-4">
          {/* Informações básicas */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{format(parseISO(appointment.date), 'dd/MM/yyyy', { locale: ptBR })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{appointment.time} ({appointment.duration}min)</span>
              </div>
            </div>

            {appointment.leads?.name && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="truncate font-medium">{appointment.leads.name}</span>
              </div>
            )}

            {appointment.assigned_closer && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Responsável:</span>
                <span className="ml-1 truncate block sm:inline">
                  {appointment.assigned_closer.full_name || appointment.assigned_closer.email}
                </span>
              </div>
            )}

            {appointment.description && (
              <p className="text-sm text-gray-600 line-clamp-3">
                {appointment.description}
              </p>
            )}
          </div>

          {/* Botões de Ação - Desktop */}
          <div className="hidden sm:flex flex-wrap gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewDialogOpen(true)}
              className="flex-1 min-w-0"
            >
              <Eye className="w-4 h-4 mr-1" />
              <span className="truncate">Ver</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
              className="flex-1 min-w-0"
            >
              <Edit className="w-4 h-4 mr-1" />
              <span className="truncate">Editar</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setTimelineDialogOpen(true)}
              className="flex-1 min-w-0"
            >
              <History className="w-4 h-4 mr-1" />
              <span className="truncate hidden lg:inline">Timeline</span>
              <span className="truncate lg:hidden">Linha</span>
            </Button>

            {shouldShowRecordButton && (
              <Button
                size="sm"
                onClick={() => setRecordDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700 flex-1 min-w-0"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                <span className="truncate">Registrar</span>
              </Button>
            )}

            {shouldShowFollowUpButton && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFollowUpDialogOpen(true)}
                className="flex-1 min-w-0"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                <span className="truncate">Follow-up</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 min-w-0"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              <span className="truncate">Excluir</span>
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
