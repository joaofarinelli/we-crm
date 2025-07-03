import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteUserRequest {
  email: string;
  role_id: string;
  send_email?: boolean;
  redirect_to?: string;
}

serve(async (req: Request) => {
  console.log('🚀 Invite user function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create regular client to get current user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Failed to get authenticated user');
    }

    // Get user's company
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.company_id) {
      throw new Error('User profile not found or no company associated');
    }

    // Parse request body
    const { email, role_id, send_email = true, redirect_to }: InviteUserRequest = await req.json();

    if (!email || !role_id) {
      throw new Error('Email and role_id are required');
    }

    console.log(`📧 Processing invite for ${email}, send_email: ${send_email}`);

    let supabase_invite_id = null;

    // If send_email is true, use Supabase native invite
    if (send_email) {
      console.log('📨 Sending native email invite via Supabase');
      
      const defaultRedirectTo = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}.supabase.co/`;
      const inviteRedirectTo = redirect_to || defaultRedirectTo;

      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        email,
        {
          redirectTo: inviteRedirectTo,
          data: {
            role_id: role_id,
            company_id: profile.company_id,
            invited_via_function: true
          }
        }
      );

      if (inviteError) {
        console.error('❌ Failed to send native invite:', inviteError);
        throw new Error(`Failed to send email invite: ${inviteError.message}`);
      }

      supabase_invite_id = inviteData.user?.id || null;
      console.log('✅ Native invite sent successfully:', supabase_invite_id);
    }

    // Always save invitation record in our table for tracking
    const { data: invitation, error: insertError } = await supabase
      .from('user_invitations')
      .insert({
        email,
        role_id,
        company_id: profile.company_id,
        invited_by: user.id,
        sent_via_email: send_email,
        supabase_invite_id
      })
      .select(`
        *,
        roles (
          name,
          description
        )
      `)
      .single();

    if (insertError) {
      console.error('❌ Failed to save invitation record:', insertError);
      throw new Error(`Failed to save invitation: ${insertError.message}`);
    }

    console.log('✅ Invitation record saved successfully');

    return new Response(
      JSON.stringify({
        success: true,
        invitation,
        sent_via_email: send_email,
        message: send_email 
          ? `Convite enviado por email para ${email}` 
          : `Convite criado para ${email} (link manual)`
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('❌ Error in invite-user function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to process invitation'
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});