import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { useSaasAdmin } from "@/hooks/useSaasAdmin";
import { useNavigate } from "react-router-dom";
import { SidebarGroup } from "@/components/SidebarGroup";
import { LayoutDashboard, Users, CheckSquare, BarChart3, Settings, UserPlus, Kanban, FileText, Calendar, CalendarDays, Video, Shield, Package, Handshake, Clock, Tag, MessageCircle, LucideIcon } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// Estrutura hierárquica do menu
const menuStructure = [{
  type: 'item' as const,
  id: 'dashboard',
  label: 'Dashboard',
  icon: LayoutDashboard,
  permission: null
}, {
  type: 'group' as const,
  id: 'crm',
  label: 'CRM',
  icon: UserPlus,
  items: [{
    id: 'leads',
    label: 'Leads',
    icon: UserPlus,
    permission: 'leads'
  }, {
    id: 'leadsPipeline',
    label: 'Pipeline',
    icon: Kanban,
    permission: 'leads'
  }, {
    id: 'leadTags',
    label: 'Tags',
    icon: Tag,
    permission: 'leads'
  }, {
    id: 'products',
    label: 'Produtos',
    icon: Package,
    permission: 'products'
  }]
}, {
  type: 'group' as const,
  id: 'agenda',
  label: 'Agenda',
  icon: CalendarDays,
  items: [{
    id: 'appointments',
    label: 'Agendamentos',
    icon: Calendar,
    permission: 'appointments'
  }, {
    id: 'meetings',
    label: 'Reuniões',
    icon: Video,
    permission: 'meetings'
  }, {
    id: 'calendar',
    label: 'Calendário',
    icon: CalendarDays,
    permission: 'appointments'
  }, {
    id: 'scheduleBlocks',
    label: 'Horários',
    icon: Clock,
    permission: 'scheduleBlocks'
  }]
}, {
  type: 'item' as const,
  id: 'whatsapp',
  label: 'WhatsApp',
  icon: MessageCircle,
  permission: null,
  route: '/whatsapp'
}, {
  type: 'group' as const,
  id: 'operational',
  label: 'Operacional',
  icon: CheckSquare,
  items: [{
    id: 'tasks',
    label: 'Tarefas',
    icon: CheckSquare,
    permission: 'tasks'
  }, {
    id: 'scripts',
    label: 'Materiais',
    icon: FileText,
    permission: 'scripts'
  }]
}, {
  type: 'item' as const,
  id: 'reports',
  label: 'Relatórios',
  icon: BarChart3,
  permission: 'reports'
}, {
  type: 'item' as const,
  id: 'partners',
  label: 'Parceiros',
  icon: Handshake,
  permission: 'partners'
}, {
  type: 'group' as const,
  id: 'admin',
  label: 'Administração',
  icon: Settings,
  items: [{
    id: 'users',
    label: 'Usuários',
    icon: Users,
    permission: 'user-management'
  }, {
    id: 'settings',
    label: 'Configurações',
    icon: Settings,
    permission: 'settings'
  }]
}];
export const Sidebar = ({
  activeTab,
  setActiveTab
}: SidebarProps) => {
  const {
    company,
    loading
  } = useCurrentCompany();
  const {
    isSaasAdmin
  } = useSaasAdmin();
  const {
    canAccess
  } = usePermissions();
  const navigate = useNavigate();
  const handleNavigate = (route: string) => {
    navigate(route);
  };
  return <div className="hidden md:flex w-64 bg-white shadow-lg border-r flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={company?.logo_url} alt={company?.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {company?.name?.charAt(0) || 'C'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {loading ? 'Carregando...' : company?.name || 'CRM System'}
            </h1>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto my-[2px]">
        {menuStructure.map(item => {
        if (item.type === 'group') {
          return <SidebarGroup key={item.id} id={item.id} label={item.label} icon={item.icon} items={item.items} activeTab={activeTab} setActiveTab={setActiveTab} canAccess={canAccess} onNavigate={handleNavigate} />;
        }

        // Item único
        if (item.permission && !canAccess(item.permission)) {
          return null;
        }
        const Icon = item.icon;
        return <Button key={item.id} variant={activeTab === item.id ? "default" : "ghost"} className={cn("w-full justify-start", activeTab === item.id && "bg-primary text-primary-foreground")} onClick={() => {
          if (item.route) {
            navigate(item.route);
          } else {
            setActiveTab(item.id);
          }
        }}>
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>;
      })}

        {isSaasAdmin && <div className="border-t pt-2 mt-2 my-[12px]">
            <p className="text-xs text-gray-500 px-3 pb-2">Administração SaaS</p>
            <Button variant="ghost" className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => navigate('/admin')}>
              <Shield className="mr-2 h-4 w-4" />
              Admin SaaS
            </Button>
          </div>}
      </nav>
    </div>;
};