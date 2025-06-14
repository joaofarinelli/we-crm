
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/types/appointment';

interface AppointmentsContextType {
  appointments: Appointment[];
  loading: boolean;
  createAppointment: (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'leads' | 'assigned_closer' | 'company_id'>) => Promise<any>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<any>;
  updateAppointmentOptimistic: (id: string, updates: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

export const useAppointments = () => {
  const context = useContext(AppointmentsContext);
  if (!context) {
    throw new Error('useAppointments must be used within an AppointmentsProvider');
  }
  return context;
};

interface AppointmentsProviderProps {
  children: ReactNode;
}

export const AppointmentsProvider = ({ children }: AppointmentsProviderProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);

  const fetchAppointments = async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          role_id,
          company_id,
          roles (
            name,
            permissions
          )
        `)
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      const userRole = profileData?.roles?.name;

      let query = supabase
        .from('appointments')
        .select(`
          *,
          leads (
            name
          ),
          assigned_closer:profiles!appointments_assigned_to_fkey (
            full_name,
            email
          )
        `)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (userRole === 'Closer') {
        query = query.eq('assigned_to', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setAppointments(data || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'leads' | 'assigned_closer' | 'company_id'>) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          ...appointmentData,
          company_id: profileData.company_id
        }])
        .select(`
          *,
          leads (
            name
          ),
          assigned_closer:profiles!appointments_assigned_to_fkey (
            full_name,
            email
          )
        `)
        .single();

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o agendamento",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          leads (
            name
          ),
          assigned_closer:profiles!appointments_assigned_to_fkey (
            full_name,
            email
          )
        `)
        .single();

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Agendamento atualizado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o agendamento",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateAppointmentOptimistic = async (id: string, updates: Partial<Appointment>) => {
    const previousAppointments = [...appointments];
    
    setAppointments(prev => 
      prev.map(appointment => 
        appointment.id === id ? { ...appointment, ...updates } : appointment
      )
    );

    try {
      const { error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar agendamento via drag & drop:', error);
      setAppointments(previousAppointments);
      
      toast({
        title: "Erro",
        description: "Não foi possível mover o agendamento",
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Agendamento removido com sucesso"
      });
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o agendamento",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      const channelName = `appointments_${user.id}`;
      const channel = supabase.channel(channelName);
      channelRef.current = channel;
      
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'appointments'
          },
          async (payload) => {
            const { data, error } = await supabase
              .from('appointments')
              .select(`
                *,
                leads (
                  name
                ),
                assigned_closer:profiles!appointments_assigned_to_fkey (
                  full_name,
                  email
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (!error && data) {
              setAppointments(prev => {
                const exists = prev.some(apt => apt.id === data.id);
                if (exists) return prev;
                return [data, ...prev];
              });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'appointments'
          },
          async (payload) => {
            const currentAppointment = appointments.find(apt => apt.id === payload.new.id);
            if (currentAppointment && currentAppointment.status === payload.new.status) {
              return;
            }
            
            const { data, error } = await supabase
              .from('appointments')
              .select(`
                *,
                leads (
                  name
                ),
                assigned_closer:profiles!appointments_assigned_to_fkey (
                  full_name,
                  email
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (!error && data) {
              setAppointments(prev => 
                prev.map(appointment => 
                  appointment.id === data.id ? data : appointment
                )
              );
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'appointments'
          },
          (payload) => {
            setAppointments(prev => 
              prev.filter(appointment => appointment.id !== payload.old.id)
            );
          }
        );

      channel.subscribe();

      return () => {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      };
    }
  }, [user]);

  return (
    <AppointmentsContext.Provider
      value={{
        appointments,
        loading,
        createAppointment,
        updateAppointment,
        updateAppointmentOptimistic,
        deleteAppointment,
        refetch: fetchAppointments
      }}
    >
      {children}
    </AppointmentsContext.Provider>
  );
};
