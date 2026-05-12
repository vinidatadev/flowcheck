import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // Verify caller is level 2 (admin)
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user: callerAuth }, error: authError } = await callerClient.auth.getUser()
    if (authError || !callerAuth) {
      return new Response(JSON.stringify({ error: 'Sessão inválida' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: callerProfile } = await callerClient
      .from('user')
      .select('nivel')
      .eq('id_user', callerAuth.id)
      .single()

    if (!callerProfile || callerProfile.nivel !== 2) {
      return new Response(JSON.stringify({ error: 'Apenas administradores podem criar usuários' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { email, password, nome_usuario, cargo, nivel, foto } = await req.json()

    if (!email || !password || !nome_usuario || !cargo || !nivel) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    // 1. Create auth user
    const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome_usuario, cargo },
    })

    if (createError) throw new Error(createError.message)
    if (!authData.user) throw new Error('Usuário não foi criado no Auth')

    // 2. Insert profile row
    const { data: dbData, error: dbError } = await adminClient
      .from('user')
      .insert([{
        id_user: authData.user.id,
        nome_usuario,
        cargo,
        nivel: Number(nivel),
        foto: foto || null,
      }])
      .select()
      .single()

    if (dbError) {
      // Rollback auth user
      await adminClient.auth.admin.deleteUser(authData.user.id).catch(() => {})
      throw new Error(dbError.message)
    }

    return new Response(JSON.stringify({ user: dbData }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
