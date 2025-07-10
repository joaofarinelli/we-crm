import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentCompany } from './useCurrentCompany';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  company_id: string;
  name: string;
  price: number;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useRealtimeProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { company: currentCompany } = useCurrentCompany();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  const fetchProducts = async () => {
    if (!currentCompany?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: {
    name: string;
    price: number;
    description?: string;
  }) => {
    if (!currentCompany?.id) return null;

    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          company_id: currentCompany.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Produto criado com sucesso",
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar produto",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateProduct = async (id: string, productData: {
    name: string;
    price: number;
    description?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso",
      });

      return data;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar produto",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Produto removido com sucesso",
      });
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover produto",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!currentCompany?.id) return;
    
    fetchProducts();

    // Cleanup function to remove channel
    const cleanup = () => {
      if (channelRef.current && isSubscribedRef.current) {
        console.log('Cleaning up realtime products channel');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };

    // Clean up any existing channel first
    cleanup();

    // Create unique channel name
    const channelName = `realtime-products-${currentCompany.id}-${Date.now()}`;
    
    // Setup realtime subscription
    const channel = supabase.channel(channelName);
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Realtime product change detected:', payload);
          setIsUpdating(true);
          
          fetchProducts().finally(() => {
            setIsUpdating(false);
          });
        }
      )
      .subscribe((status) => {
        console.log('Realtime products subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        }
      });

    channelRef.current = channel;

    return cleanup;
  }, [currentCompany?.id]);

  return {
    products,
    loading,
    isUpdating,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  };
};