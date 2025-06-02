
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLeads } from '@/hooks/useLeads';
import { Edit2, Trash2, Phone, Mail } from 'lucide-react';
import { EditLeadDialog } from './EditLeadDialog';

export const Kanban = () => {
  const { leads, loading, deleteLead } = useLeads();
  const [editingLead, setEditingLead] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const statusColumns = [
    { status: 'Frio', title: 'Frio', color: 'bg-blue-100 border-blue-200' },
    { status: 'Morno', title: 'Morno', color: 'bg-yellow-100 border-yellow-200' },
    { status: 'Quente', title: 'Quente', color: 'bg-red-100 border-red-200' },
  ];

  const getLeadsByStatus = (status: string) => {
    return leads.filter(lead => lead.status === status);
  };

  const formatValue = (value: number | null) => {
    if (!value) return 'R$ 0';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lead?')) {
      await deleteLead(id);
    }
  };

  const handleEdit = (lead: any) => {
    setEditingLead(lead);
    setEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg">Carregando kanban...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pipeline de Vendas</h1>
        <p className="text-gray-600 mt-1">Visualize seus leads por status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statusColumns.map((column) => {
          const columnLeads = getLeadsByStatus(column.status);
          const totalValue = columnLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);

          return (
            <div key={column.status} className="space-y-4">
              <div className={`p-4 rounded-lg border-2 ${column.color}`}>
                <h2 className="font-semibold text-lg">{column.title}</h2>
                <p className="text-sm text-gray-600">
                  {columnLeads.length} leads • {formatValue(totalValue)}
                </p>
              </div>

              <div className="space-y-3">
                {columnLeads.map((lead) => (
                  <Card key={lead.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{lead.name}</h3>
                        <p className="text-sm text-gray-600">{lead.company}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(lead)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(lead.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-gray-500">
                      {lead.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{lead.email}</span>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                      <Badge variant="outline" className="text-xs">
                        {lead.source || 'N/A'}
                      </Badge>
                      <span className="font-medium text-sm">{formatValue(lead.value)}</span>
                    </div>
                  </Card>
                ))}

                {columnLeads.length === 0 && (
                  <div className="p-6 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                    Nenhum lead neste status
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <EditLeadDialog
        lead={editingLead}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  );
};
