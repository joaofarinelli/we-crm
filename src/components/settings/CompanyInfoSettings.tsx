
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, Upload, MapPin, Globe, Phone, Mail } from 'lucide-react';
import { useCompanySettings } from '@/hooks/useCompanySettings';

export const CompanyInfoSettings = () => {
  const { company, updateCompany } = useCompanySettings();
  const [formData, setFormData] = useState({
    name: company?.name || '',
    domain: company?.domain || '',
    website: company?.website || '',
    phone: company?.phone || '',
    address: company?.address || '',
    location: company?.location || '',
    industry: company?.industry || '',
    size: company?.size || '',
    revenue: company?.revenue || '',
    timezone: company?.timezone || 'America/Sao_Paulo',
    currency: company?.currency || 'BRL',
    date_format: company?.date_format || 'DD/MM/YYYY',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompany.mutateAsync(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Informações da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo da Empresa */}
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={company?.logo_url} alt={company?.name} />
              <AvatarFallback className="text-lg">
                {company?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <Label className="text-sm font-medium">Logo da Empresa</Label>
              <div className="mt-2">
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Alterar Logo
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Recomendado: 200x200px, formato PNG ou JPG
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Empresa *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain">Domínio</Label>
                <Input
                  id="domain"
                  value={formData.domain}
                  onChange={(e) => handleInputChange('domain', e.target.value)}
                  placeholder="exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://exemplo.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Setor/Indústria</Label>
                <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="saude">Saúde</SelectItem>
                    <SelectItem value="educacao">Educação</SelectItem>
                    <SelectItem value="varejo">Varejo</SelectItem>
                    <SelectItem value="manufatura">Manufatura</SelectItem>
                    <SelectItem value="servicos">Serviços</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Tamanho da Empresa</Label>
                <Select value={formData.size} onValueChange={(value) => handleInputChange('size', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 funcionários</SelectItem>
                    <SelectItem value="11-50">11-50 funcionários</SelectItem>
                    <SelectItem value="51-200">51-200 funcionários</SelectItem>
                    <SelectItem value="201-500">201-500 funcionários</SelectItem>
                    <SelectItem value="500+">500+ funcionários</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="revenue">Receita Anual</Label>
                <Select value={formData.revenue} onValueChange={(value) => handleInputChange('revenue', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a receita" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-100k">R$ 0 - 100k</SelectItem>
                    <SelectItem value="100k-500k">R$ 100k - 500k</SelectItem>
                    <SelectItem value="500k-1M">R$ 500k - 1M</SelectItem>
                    <SelectItem value="1M-5M">R$ 1M - 5M</SelectItem>
                    <SelectItem value="5M+">R$ 5M+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="São Paulo, SP"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço Completo</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Rua, número, bairro, cidade, CEP"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Fuso Horário</Label>
                <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">Brasília (UTC-3)</SelectItem>
                    <SelectItem value="America/Manaus">Manaus (UTC-4)</SelectItem>
                    <SelectItem value="America/Rio_Branco">Rio Branco (UTC-5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Moeda</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">Real (R$)</SelectItem>
                    <SelectItem value="USD">Dólar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_format">Formato de Data</Label>
                <Select value={formData.date_format} onValueChange={(value) => handleInputChange('date_format', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/AAAA</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/AAAA</SelectItem>
                    <SelectItem value="YYYY-MM-DD">AAAA-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={updateCompany.isPending}>
                {updateCompany.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
