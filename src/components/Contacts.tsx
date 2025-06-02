
import { useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const contactsData = [
  {
    id: 1,
    name: 'João Silva',
    company: 'Tech Corp',
    position: 'CTO',
    email: 'joao@techcorp.com',
    phone: '(11) 99999-9999',
    location: 'São Paulo, SP',
    avatar: '',
    lastContact: '2024-01-15'
  },
  {
    id: 2,
    name: 'Maria Santos',
    company: 'Inovação Ltda',
    position: 'CEO',
    email: 'maria@inovacao.com',
    phone: '(11) 88888-8888',
    location: 'Rio de Janeiro, RJ',
    avatar: '',
    lastContact: '2024-01-14'
  },
  {
    id: 3,
    name: 'Carlos Oliveira',
    company: 'StartUp XYZ',
    position: 'Founder',
    email: 'carlos@startup.com',
    phone: '(11) 77777-7777',
    location: 'Belo Horizonte, MG',
    avatar: '',
    lastContact: '2024-01-13'
  },
  {
    id: 4,
    name: 'Ana Costa',
    company: 'Digital Solutions',
    position: 'Marketing Manager',
    email: 'ana@digital.com',
    phone: '(11) 66666-6666',
    location: 'Porto Alegre, RS',
    avatar: '',
    lastContact: '2024-01-12'
  }
];

export const Contacts = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contactsData.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contatos</h1>
          <p className="text-gray-600 mt-1">Gerencie sua rede de contatos</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Contato
        </Button>
      </div>

      {/* Busca */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar contatos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros Avançados
          </Button>
        </div>
      </Card>

      {/* Grid de Contatos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={contact.avatar} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                    {getInitials(contact.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                  <p className="text-sm text-gray-500">{contact.position}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm">
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="font-medium text-gray-900">{contact.company}</p>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{contact.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{contact.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{contact.location}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Último contato: {contact.lastContact}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Ligar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-500 text-lg">Nenhum contato encontrado</p>
          <p className="text-gray-400 mt-2">Tente ajustar a busca ou adicionar novos contatos</p>
        </Card>
      )}
    </div>
  );
};
