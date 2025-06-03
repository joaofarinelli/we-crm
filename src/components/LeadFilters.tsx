
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, Filter, X, Calendar } from 'lucide-react';

interface LeadFiltersProps {
  onFiltersChange: (filters: LeadFilterState) => void;
  totalLeads: number;
  filteredCount: number;
}

export interface LeadFilterState {
  searchTerm: string;
  status: string;
  source: string;
  valueRange: {
    min: string;
    max: string;
  };
  dateRange: {
    from: string;
    to: string;
  };
  company: string;
}

export const LeadFilters = ({ onFiltersChange, totalLeads, filteredCount }: LeadFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<LeadFilterState>({
    searchTerm: '',
    status: 'todos',
    source: 'todas',
    valueRange: { min: '', max: '' },
    dateRange: { from: '', to: '' },
    company: ''
  });

  const updateFilters = (newFilters: Partial<LeadFilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters: LeadFilterState = {
      searchTerm: '',
      status: 'todos',
      source: 'todas',
      valueRange: { min: '', max: '' },
      dateRange: { from: '', to: '' },
      company: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    setShowAdvanced(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.status !== 'todos') count++;
    if (filters.source !== 'todas') count++;
    if (filters.valueRange.min || filters.valueRange.max) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.company) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="p-6 space-y-4">
      {/* Filtros Básicos */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome, empresa ou email..."
              value={filters.searchTerm}
              onChange={(e) => updateFilters({ searchTerm: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={filters.status} onValueChange={(value) => updateFilters({ status: value })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="Quente">Quente</SelectItem>
              <SelectItem value="Morno">Morno</SelectItem>
              <SelectItem value="Frio">Frio</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros Avançados
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {activeFiltersCount > 0 && (
            <Button variant="outline" onClick={clearFilters} size="sm">
              <X className="w-4 h-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Filtros Avançados */}
      {showAdvanced && (
        <div className="border-t pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Origem */}
            <div className="space-y-2">
              <Label>Origem</Label>
              <Select value={filters.source} onValueChange={(value) => updateFilters({ source: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as origens" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as origens</SelectItem>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Google">Google</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Indicação">Indicação</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="Telefone">Telefone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Empresa */}
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                placeholder="Filtrar por empresa"
                value={filters.company}
                onChange={(e) => updateFilters({ company: e.target.value })}
              />
            </div>

            {/* Faixa de Valor - Mínimo */}
            <div className="space-y-2">
              <Label htmlFor="valueMin">Valor Mínimo</Label>
              <Input
                id="valueMin"
                type="number"
                placeholder="R$ 0"
                value={filters.valueRange.min}
                onChange={(e) => updateFilters({ 
                  valueRange: { ...filters.valueRange, min: e.target.value }
                })}
              />
            </div>

            {/* Faixa de Valor - Máximo */}
            <div className="space-y-2">
              <Label htmlFor="valueMax">Valor Máximo</Label>
              <Input
                id="valueMax"
                type="number"
                placeholder="R$ 999999"
                value={filters.valueRange.max}
                onChange={(e) => updateFilters({ 
                  valueRange: { ...filters.valueRange, max: e.target.value }
                })}
              />
            </div>
          </div>

          {/* Período de Criação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom" className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Data de Criação - De
              </Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateRange.from}
                onChange={(e) => updateFilters({ 
                  dateRange: { ...filters.dateRange, from: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo" className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Data de Criação - Até
              </Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateRange.to}
                onChange={(e) => updateFilters({ 
                  dateRange: { ...filters.dateRange, to: e.target.value }
                })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Contador de Resultados */}
      <div className="flex justify-between items-center text-sm text-gray-600 border-t pt-4">
        <span>
          Mostrando {filteredCount} de {totalLeads} leads
        </span>
        {activeFiltersCount > 0 && (
          <span className="text-blue-600">
            {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} aplicado{activeFiltersCount > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </Card>
  );
};
