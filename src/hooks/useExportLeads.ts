import { useToast } from '@/hooks/use-toast';
import type { LeadFilterState } from '@/components/LeadFilters';

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string | null;
  source: string | null;
  created_at: string;
  tags?: Array<{ id: string; name: string; color: string }>;
}

export const useExportLeads = () => {
  const { toast } = useToast();

  // Função utilitária para converter dados em CSV
  const convertToCSV = (data: any[], headers: { [key: string]: string }) => {
    const headerRow = Object.values(headers).join(',');
    const dataRows = data.map(row => {
      return Object.keys(headers).map(key => {
        const value = row[key];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value || '';
      }).join(',');
    });
    return [headerRow, ...dataRows].join('\n');
  };

  // Função para fazer download do CSV
  const downloadCSV = (csvContent: string, filename: string) => {
    try {
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Sucesso",
        description: "Leads exportados com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao exportar leads",
        variant: "destructive"
      });
    }
  };

  // Função para gerar nome do arquivo baseado nos filtros
  const generateFilename = (filters: LeadFilterState, leadsCount: number) => {
    const dateSuffix = new Date().toISOString().split('T')[0];
    let filterDescriptions: string[] = [];

    if (filters.tags.length > 0) {
      filterDescriptions.push('tags-selecionadas');
    }
    if (filters.status !== 'todos') {
      filterDescriptions.push(`status-${filters.status.toLowerCase()}`);
    }
    if (filters.source !== 'todas') {
      filterDescriptions.push(`origem-${filters.source.toLowerCase().replace(/\s+/g, '-')}`);
    }
    if (filters.searchTerm) {
      filterDescriptions.push('busca-aplicada');
    }
    if (filters.dateRange.from || filters.dateRange.to) {
      filterDescriptions.push('periodo-filtrado');
    }

    const baseFilename = filterDescriptions.length > 0 
      ? `leads-filtrados-${filterDescriptions.join('-')}`
      : 'todos-leads';

    return `${baseFilename}-${leadsCount}-registros-${dateSuffix}.csv`;
  };

  // Função principal para exportar leads filtrados
  const exportFilteredLeads = (leads: Lead[], filters: LeadFilterState) => {
    if (leads.length === 0) {
      toast({
        title: "Aviso",
        description: "Nenhum lead encontrado para exportar",
        variant: "destructive"
      });
      return;
    }

    // Preparar dados para o CSV
    const csvData = leads.map(lead => ({
      nome: lead.name,
      email: lead.email || '',
      telefone: lead.phone || '',
      status: lead.status || '',
      origem: lead.source || '',
      tags: lead.tags?.map(tag => tag.name).join('; ') || '',
      cores_tags: lead.tags?.map(tag => tag.color).join('; ') || '',
      data_criacao: new Date(lead.created_at).toLocaleDateString('pt-BR')
    }));

    const headers = {
      nome: 'Nome',
      email: 'Email',
      telefone: 'Telefone',
      status: 'Status',
      origem: 'Origem',
      tags: 'Tags',
      cores_tags: 'Cores das Tags',
      data_criacao: 'Data de Criação'
    };

    const csvContent = convertToCSV(csvData, headers);
    const filename = generateFilename(filters, leads.length);
    downloadCSV(csvContent, filename);
  };

  // Função específica para exportar por tags
  const exportLeadsByTags = (leads: Lead[], selectedTagIds: string[], tagNames: string[]) => {
    const filteredLeads = leads.filter(lead => 
      lead.tags && lead.tags.some(tag => selectedTagIds.includes(tag.id))
    );

    if (filteredLeads.length === 0) {
      toast({
        title: "Aviso",
        description: "Nenhum lead encontrado com as tags selecionadas",
        variant: "destructive"
      });
      return;
    }

    const csvData = filteredLeads.map(lead => ({
      nome: lead.name,
      email: lead.email || '',
      telefone: lead.phone || '',
      status: lead.status || '',
      origem: lead.source || '',
      tags: lead.tags?.map(tag => tag.name).join('; ') || '',
      cores_tags: lead.tags?.map(tag => tag.color).join('; ') || '',
      data_criacao: new Date(lead.created_at).toLocaleDateString('pt-BR')
    }));

    const headers = {
      nome: 'Nome',
      email: 'Email',
      telefone: 'Telefone',
      status: 'Status',
      origem: 'Origem',
      tags: 'Tags',
      cores_tags: 'Cores das Tags',
      data_criacao: 'Data de Criação'
    };

    const csvContent = convertToCSV(csvData, headers);
    const tagNamesForFile = tagNames.join('-').toLowerCase().replace(/\s+/g, '-');
    const dateSuffix = new Date().toISOString().split('T')[0];
    const filename = `leads-tags-${tagNamesForFile}-${filteredLeads.length}-registros-${dateSuffix}.csv`;
    
    downloadCSV(csvContent, filename);
  };

  return {
    exportFilteredLeads,
    exportLeadsByTags
  };
};