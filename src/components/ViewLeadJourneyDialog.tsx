import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLeadJourney } from '@/hooks/useLeadJourney';
import { LeadJourneyTimeline } from './LeadJourneyTimeline';
import { 
  Calendar, 
  MessageSquare, 
  CheckSquare, 
  BarChart3, 
  Loader2,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface ViewLeadJourneyDialogProps {
  leadId: string | null;
  leadName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewLeadJourneyDialog = ({
  leadId,
  leadName,
  open,
  onOpenChange
}: ViewLeadJourneyDialogProps) => {
  const { events, loading, stats } = useLeadJourney(leadId || undefined);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filteredEvents = events.filter(event => {
    if (activeFilter === 'all') return true;
    return event.type === activeFilter;
  });

  if (!leadId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Jornada do Lead: {leadName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Carregando jornada...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="timeline" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="stats">Estatísticas</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="flex-1 overflow-hidden flex flex-col">
                {/* Filtros */}
                <div className="flex flex-wrap gap-2 mb-4 p-1">
                  <Button
                    variant={activeFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveFilter('all')}
                  >
                    Todos ({events.length})
                  </Button>
                  <Button
                    variant={activeFilter === 'appointment' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveFilter('appointment')}
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Agendamentos ({stats.appointments})
                  </Button>
                  <Button
                    variant={activeFilter === 'follow_up' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveFilter('follow_up')}
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Follow-ups ({stats.followUps})
                  </Button>
                  <Button
                    variant={activeFilter === 'task' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveFilter('task')}
                  >
                    <CheckSquare className="w-4 h-4 mr-1" />
                    Tarefas ({stats.tasks})
                  </Button>
                </div>

                {/* Timeline */}
                <div className="flex-1 overflow-y-auto">
                  <LeadJourneyTimeline events={filteredEvents} />
                </div>
              </TabsContent>

              <TabsContent value="stats" className="flex-1 overflow-y-auto">
                <div className="space-y-6">
                  {/* Cards de estatísticas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total de Eventos</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                          </div>
                          <BarChart3 className="w-8 h-8 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Agendamentos</p>
                            <p className="text-2xl font-bold">{stats.appointments}</p>
                          </div>
                          <Calendar className="w-8 h-8 text-blue-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Follow-ups</p>
                            <p className="text-2xl font-bold">{stats.followUps}</p>
                          </div>
                          <MessageSquare className="w-8 h-8 text-yellow-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Tarefas</p>
                            <p className="text-2xl font-bold">{stats.tasks}</p>
                          </div>
                          <CheckSquare className="w-8 h-8 text-green-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detalhes das estatísticas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <MessageSquare className="w-5 h-5" />
                          Follow-ups
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm">Pendentes</span>
                            </div>
                            <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                              {stats.pendingFollowUps}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm">Concluídos</span>
                            </div>
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              {stats.followUps - stats.pendingFollowUps}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <CheckSquare className="w-5 h-5" />
                          Tarefas
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm">Concluídas</span>
                            </div>
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              {stats.completedTasks}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                              <span className="text-sm">Pendentes</span>
                            </div>
                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                              {stats.tasks - stats.completedTasks}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};