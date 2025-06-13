
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppointments } from '@/hooks/useAppointments';
import { usePipelineColumns } from '@/hooks/usePipelineColumns';
import { Edit2, Trash2, Calendar, Clock, User, UserCheck, Settings } from 'lucide-react';
import { EditAppointmentKanbanDialog } from './EditAppointmentKanbanDialog';
import { PipelineColumnManager } from './PipelineColumnManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Appointment } from '@/types/appointment';

export const Kanban = () => {
  const { appointments, loading, deleteAppointment, updateAppointment } = useAppointments();
  const { columns, loading: columnsLoading } = usePipelineColumns();
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [manageColumnsOpen, setManageColumnsOpen] = useState(false);
  const [draggedAppointment, setDraggedAppointment] = useState<string | null>(null);

  const getAppointmentsByStatus = (status: string) => {
    return appointments.filter(appointment => appointment.status === status);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      await deleteAppointment(id);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setEditDialogOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, appointmentId: string) => {
    setDraggedAppointment(appointmentId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    
    if (!draggedAppointment) return;

    const appointmentToUpdate = appointments.find(appointment => appointment.id === draggedAppointment);
    if (!appointmentToUpdate || appointmentToUpdate.status === newStatus) {
      setDraggedAppointment(null);
      return;
    }

    await updateAppointment(draggedAppointment, { status: newStatus });
    setDraggedAppointment(null);
  };

  const handleDragEnd = () => {
    setDraggedAppointment(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5);
  };

  if (loading || columnsLoading) {
    return (
      <div className="py-8 flex items-center justify-center">
        <div className="text-lg">Carregando pipeline...</div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-6">
      <div className="flex justify-between items-center px-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pipeline de Agendamentos</h1>
          <p className="text-gray-600 mt-1">Visualize seus agendamentos por status - arraste para mover entre colunas</p>
        </div>
        <Dialog open={manageColumnsOpen} onOpenChange={setManageColumnsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Gerenciar Colunas
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Configurações do Pipeline</DialogTitle>
            </DialogHeader>
            <PipelineColumnManager />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 px-8" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(300px, 1fr))` }}>
        {columns.map((column) => {
          const columnAppointments = getAppointmentsByStatus(column.name);

          return (
            <div key={column.id} className="space-y-4">
              <div 
                className="p-4 rounded-lg border-2" 
                style={{ 
                  backgroundColor: `${column.color}15`, 
                  borderColor: column.color 
                }}
              >
                <h2 className="font-semibold text-lg">{column.name}</h2>
                <p className="text-sm text-gray-600">
                  {columnAppointments.length} agendamentos
                </p>
              </div>

              <div
                className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors border-2 border-dashed ${
                  draggedAppointment ? 'border-gray-300 bg-gray-50' : 'border-transparent'
                }`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.name)}
              >
                {columnAppointments.map((appointment) => (
                  <Card
                    key={appointment.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, appointment.id)}
                    onDragEnd={handleDragEnd}
                    className={`p-4 transition-all cursor-move ${
                      draggedAppointment === appointment.id 
                        ? 'opacity-50 rotate-2 shadow-lg' 
                        : 'hover:shadow-md'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{appointment.title}</h3>
                        {appointment.description && (
                          <p className="text-sm text-gray-600 mt-1">{appointment.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(appointment);
                          }}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(appointment.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(appointment.time)} ({appointment.duration} min)</span>
                      </div>
                      {appointment.leads && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{appointment.leads.name}</span>
                        </div>
                      )}
                      {appointment.assigned_closer && (
                        <div className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          <span>{appointment.assigned_closer.full_name || appointment.assigned_closer.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                      <Badge variant="outline" className="text-xs">
                        {appointment.status}
                      </Badge>
                    </div>
                  </Card>
                ))}

                {columnAppointments.length === 0 && (
                  <div className="p-6 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                    Nenhum agendamento neste status
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <EditAppointmentKanbanDialog
        appointment={editingAppointment}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  );
};
