
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface MeetingsAppointmentsReportData {
  meetingsByPeriod: { period: string; count: number; completed: number; scheduled: number; inProgress: number }[];
  appointmentsByPeriod: { period: string; count: number; scheduled: number; completed: number; cancelled: number }[];
  meetingsStatusDistribution: { status: string; count: number; percentage: number }[];
  appointmentsStatusDistribution: { status: string; count: number; percentage: number }[];
  avgMeetingDuration: number;
  avgAppointmentDuration: number;
  totalMeetings: number;
  totalAppointments: number;
  meetingCompletionRate: number;
  appointmentShowRate: number;
  trendsData: {
    meetingsChange: number;
    appointmentsChange: number;
    completionRateChange: number;
  };
}

export type PeriodType = 'weekly' | 'monthly' | 'yearly';

export const useMeetingsAndAppointmentsReports = (period: PeriodType = 'monthly') => {
  const { user } = useAuth();

  const { data: reportData, isLoading, error } = useQuery({
    queryKey: ['meetings-appointments-reports', period],
    queryFn: async (): Promise<MeetingsAppointmentsReportData> => {
      if (!user) throw new Error('Usuário não autenticado');

      const now = new Date();
      let periodsToFetch = 6;
      let dateFormat = 'month';
      let periodLength = 'month';

      if (period === 'weekly') {
        periodsToFetch = 12; // 12 semanas
        dateFormat = 'week';
        periodLength = 'week';
      } else if (period === 'yearly') {
        periodsToFetch = 3; // 3 anos
        dateFormat = 'year';
        periodLength = 'year';
      }

      // Buscar todas as reuniões
      const { data: allMeetings } = await supabase
        .from('meetings')
        .select('*');

      // Buscar todos os agendamentos
      const { data: allAppointments } = await supabase
        .from('appointments')
        .select('*');

      // Calcular dados por período
      const meetingsByPeriod = Array.from({ length: periodsToFetch }, (_, i) => {
        let periodStart: Date;
        let periodEnd: Date;
        let periodLabel: string;

        if (period === 'weekly') {
          periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7) - 6);
          periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7));
          periodLabel = `Sem ${periodsToFetch - i}`;
        } else if (period === 'monthly') {
          periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          periodLabel = periodStart.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        } else {
          periodStart = new Date(now.getFullYear() - i, 0, 1);
          periodEnd = new Date(now.getFullYear() - i, 11, 31);
          periodLabel = (now.getFullYear() - i).toString();
        }

        const periodMeetings = allMeetings?.filter(meeting => {
          const meetingDate = new Date(meeting.date);
          return meetingDate >= periodStart && meetingDate <= periodEnd;
        }) || [];

        return {
          period: periodLabel,
          count: periodMeetings.length,
          completed: periodMeetings.filter(m => m.status === 'Finalizada').length,
          scheduled: periodMeetings.filter(m => m.status === 'Agendada').length,
          inProgress: periodMeetings.filter(m => m.status === 'Em andamento').length
        };
      }).reverse();

      const appointmentsByPeriod = Array.from({ length: periodsToFetch }, (_, i) => {
        let periodStart: Date;
        let periodEnd: Date;
        let periodLabel: string;

        if (period === 'weekly') {
          periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7) - 6);
          periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7));
          periodLabel = `Sem ${periodsToFetch - i}`;
        } else if (period === 'monthly') {
          periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          periodLabel = periodStart.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        } else {
          periodStart = new Date(now.getFullYear() - i, 0, 1);
          periodEnd = new Date(now.getFullYear() - i, 11, 31);
          periodLabel = (now.getFullYear() - i).toString();
        }

        const periodAppointments = allAppointments?.filter(appointment => {
          const appointmentDate = new Date(appointment.date);
          return appointmentDate >= periodStart && appointmentDate <= periodEnd;
        }) || [];

        return {
          period: periodLabel,
          count: periodAppointments.length,
          scheduled: periodAppointments.filter(a => a.status === 'Agendado').length,
          completed: periodAppointments.filter(a => a.status === 'Realizado').length,
          cancelled: periodAppointments.filter(a => a.status === 'Cancelado').length
        };
      }).reverse();

      // Distribuição por status
      const meetingsStatusDistribution = ['Agendada', 'Em andamento', 'Finalizada'].map(status => {
        const count = allMeetings?.filter(meeting => meeting.status === status).length || 0;
        const total = allMeetings?.length || 0;
        return {
          status,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0
        };
      });

      const appointmentsStatusDistribution = ['Agendado', 'Confirmado', 'Realizado', 'Cancelado'].map(status => {
        const count = allAppointments?.filter(appointment => appointment.status === status).length || 0;
        const total = allAppointments?.length || 0;
        return {
          status,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0
        };
      });

      // Métricas gerais
      const avgMeetingDuration = allMeetings?.length > 0 
        ? allMeetings.reduce((sum, meeting) => sum + meeting.duration, 0) / allMeetings.length 
        : 0;

      const avgAppointmentDuration = allAppointments?.length > 0 
        ? allAppointments.reduce((sum, appointment) => sum + appointment.duration, 0) / allAppointments.length 
        : 0;

      const totalMeetings = allMeetings?.length || 0;
      const totalAppointments = allAppointments?.length || 0;
      
      const completedMeetings = allMeetings?.filter(m => m.status === 'Finalizada').length || 0;
      const meetingCompletionRate = totalMeetings > 0 ? (completedMeetings / totalMeetings) * 100 : 0;

      const completedAppointments = allAppointments?.filter(a => a.status === 'Realizado').length || 0;
      const appointmentShowRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;

      // Calcular mudanças (comparação com período anterior)
      const currentPeriodMeetings = meetingsByPeriod[meetingsByPeriod.length - 1]?.count || 0;
      const previousPeriodMeetings = meetingsByPeriod[meetingsByPeriod.length - 2]?.count || 0;
      const meetingsChange = previousPeriodMeetings > 0 ? ((currentPeriodMeetings - previousPeriodMeetings) / previousPeriodMeetings) * 100 : 0;

      const currentPeriodAppointments = appointmentsByPeriod[appointmentsByPeriod.length - 1]?.count || 0;
      const previousPeriodAppointments = appointmentsByPeriod[appointmentsByPeriod.length - 2]?.count || 0;
      const appointmentsChange = previousPeriodAppointments > 0 ? ((currentPeriodAppointments - previousPeriodAppointments) / previousPeriodAppointments) * 100 : 0;

      return {
        meetingsByPeriod,
        appointmentsByPeriod,
        meetingsStatusDistribution,
        appointmentsStatusDistribution,
        avgMeetingDuration,
        avgAppointmentDuration,
        totalMeetings,
        totalAppointments,
        meetingCompletionRate,
        appointmentShowRate,
        trendsData: {
          meetingsChange,
          appointmentsChange,
          completionRateChange: 0 // Pode ser calculado posteriormente se necessário
        }
      };
    },
    enabled: !!user,
  });

  return {
    reportData,
    isLoading,
    error
  };
};
