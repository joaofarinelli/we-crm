
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, User, Eye, Edit, Trash2 } from 'lucide-react';
import { useAppointments } from '@/hooks/useAppointments';
import { usePipelineColumns } from '@/hooks/usePipelineColumns';
import { AddAppointmentDialog } from '@/components/AddAppointmentDialog';
import { EditAppointmentKanbanDialog } from '@/components/EditAppointmentKanbanDialog';
import { ViewAppointmentDialog } from '@/components/ViewAppointmentDialog';
import { PipelineStatusIndicator } from '@/components/PipelineStatusIndicator';
import { PipelineColumnManager } from '@/components/PipelineColumnManager';
import { Appointment } from '@/types/appointment';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Kanban = () => {
  const { appointments, updateAppointment, deleteAppointment, loading } = useAppointments();
  const { columns } = usePipelineColumns();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showColumnManager, setShowColumnManager] = useState(false);

  // Group appointments by status (column)
  const appointmentsByStatus = appointments.reduce((acc, appointment) => {
    const status = appointment.status || 'Agendado';
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(appointment);
    return acc;
  }, {} as Record<string, Appointment[]>);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const appointmentId = result.draggableId;
    const newStatus = result.destination.droppableId;

    try {
      await updateAppointment(appointmentId, { status: newStatus });
    } catch (error) {
      console.error('Erro ao atualizar status do agendamento:', error);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setEditDialogOpen(true);
  };

  const handleView = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setViewDialogOpen(true);
  };

  const handleDelete = async (appointment: Appointment) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      await deleteAppointment(appointment.id);
    }
  };

  const formatDateTime = (date: string, time: string) => {
    try {
      const dateTime = new Date(`${date}T${time}`);
      return format(dateTime, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return `${date} às ${time}`;
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando pipeline...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pipeline de Agendamentos</h1>
          <p className="text-gray-600 mt-1">Gerencie agendamentos por status</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowColumnManager(!showColumnManager)}
          >
            Gerenciar Colunas
          </Button>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      <PipelineStatusIndicator />

      {showColumnManager && (
        <PipelineColumnManager />
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    {column.name}
                    <Badge variant="secondary" className="ml-auto">
                      {appointmentsByStatus[column.name]?.length || 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </Card>

              <Droppable droppableId={column.name}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`min-h-[200px] space-y-3 p-2 rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-gray-100' : ''
                    }`}
                  >
                    {(appointmentsByStatus[column.name] || []).map((appointment, index) => (
                      <Draggable
                        key={appointment.id}
                        draggableId={appointment.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`cursor-move transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-md'
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                  <h3 className="font-medium text-sm line-clamp-2">
                                    {appointment.title}
                                  </h3>
                                  <div className="flex gap-1 ml-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleView(appointment);
                                      }}
                                    >
                                      <Eye className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(appointment);
                                      }}
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(appointment);
                                      }}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="space-y-2 text-xs text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-3 h-3" />
                                    {formatDateTime(appointment.date, appointment.time)}
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    {appointment.duration} min
                                  </div>

                                  {appointment.assigned_closer && (
                                    <div className="flex items-center gap-2">
                                      <User className="w-3 h-3" />
                                      {appointment.assigned_closer.full_name}
                                    </div>
                                  )}

                                  {appointment.leads && (
                                    <div className="flex items-center gap-2">
                                      <User className="w-3 h-3" />
                                      Lead: {appointment.leads.name}
                                    </div>
                                  )}
                                </div>

                                {appointment.description && (
                                  <p className="text-xs text-gray-500 line-clamp-2">
                                    {appointment.description}
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <AddAppointmentDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />

      <EditAppointmentKanbanDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        appointment={selectedAppointment}
      />

      <ViewAppointmentDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        appointment={selectedAppointment}
      />
    </div>
  );
};
