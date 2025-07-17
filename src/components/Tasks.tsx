import { useState } from 'react';
import { Plus, Search, Filter, Calendar, Clock, User, CheckCircle2, AlertCircle, Trash2, Eye, Edit, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useTasks } from '@/hooks/useTasks';
import { useProfiles } from '@/hooks/useProfiles';
import { AddTaskDialog } from './AddTaskDialog';
import { EditTaskDialog } from './EditTaskDialog';
import { ViewTaskDialog } from './ViewTaskDialog';
import { PermissionGuard } from './PermissionGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';

export const Tasks = () => {
  const { hasPermission } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterPriority, setFilterPriority] = useState('Todos');
  const [filterAssignee, setFilterAssignee] = useState('Todos');
  const [editingTask, setEditingTask] = useState<any>(null);
  const [viewingTask, setViewingTask] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const { tasks, users, loading, isUpdating, createTask, updateTask, deleteTask } = useTasks();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Média':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Baixa':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Concluída':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'Em Andamento':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'Pendente':
        return <Circle className="w-4 h-4 text-gray-400" />;
      case 'Atrasada':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const toggleTaskComplete = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Concluída' ? 'Pendente' : 'Concluída';
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await updateTask(task.id, {
        ...task,
        status: newStatus
      });
    }
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setEditDialogOpen(true);
  };

  const handleViewTask = (task: any) => {
    setViewingTask(task);
    setViewDialogOpen(true);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignee?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'Todos' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'Todos' || task.priority === filterPriority;
    const matchesAssignee = filterAssignee === 'Todos' || task.assigned_to === filterAssignee;

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      await deleteTask(id);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg">Carregando tarefas...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-gray-600 mt-1">Gerencie suas tarefas e acompanhe o progresso</p>
        </div>
        <AddTaskDialog onAddTask={createTask} users={users} />
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar tarefas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos Status</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Em Andamento">Em Andamento</SelectItem>
              <SelectItem value="Concluída">Concluída</SelectItem>
              <SelectItem value="Atrasada">Atrasada</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todas Prioridades</SelectItem>
              <SelectItem value="Alta">Alta</SelectItem>
              <SelectItem value="Média">Média</SelectItem>
              <SelectItem value="Baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger>
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos Responsáveis</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.full_name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('Todos');
              setFilterPriority('Todos');
              setFilterAssignee('Todos');
            }}
          >
            <Filter className="w-4 h-4 mr-2" />
            Limpar
          </Button>
        </div>
      </Card>

      {/* Lista de Tarefas */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <button
                    onClick={() => toggleTaskComplete(task.id, task.status)}
                    className="mt-1"
                  >
                    {getStatusIcon(task.status)}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`text-lg font-semibold ${task.status === 'Concluída' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </h3>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 mb-2">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Vence: {formatDate(task.due_date)}</span>
                        </div>
                      )}
                      {task.assignee && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{task.assignee.full_name || task.assignee.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                <div className="text-sm text-gray-500">
                  <p>Criado: {formatDate(task.created_at)}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewTask(task)}
                    className="text-gray-600 hover:text-gray-700"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTask(task)}
                    className="text-gray-600 hover:text-gray-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <PermissionGuard 
                    module="tasks" 
                    action="delete"
                    fallback={
                      <Button 
                        variant="ghost" 
                        size="sm"
                        disabled
                        className="text-gray-400 opacity-50 cursor-not-allowed"
                        title="Você não tem permissão para deletar tarefas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    }
                  >
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(task.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </PermissionGuard>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-500 text-lg">Nenhuma tarefa encontrada</p>
          <p className="text-gray-400 mt-2">Tente ajustar os filtros ou adicionar novas tarefas</p>
        </Card>
      )}

      {/* Diálogos */}
      <EditTaskDialog
        task={editingTask}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onEditTask={updateTask}
        users={users}
      />

      <ViewTaskDialog
        task={viewingTask}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />
    </div>
  );
};