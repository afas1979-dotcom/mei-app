// lib/queries/empresas.ts
// Funções para buscar e manipular empresas MEI no Supabase

import { createClient } from '@/lib/supabase/server'
import type { EmpresaMei, NovaEmpresaMei, ResumoFinanceiro } from '@/types/database'

export async function getEmpresas(): Promise<EmpresaMei[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('empresas_mei')
    .select('*')
    .eq('ativa', true)
    .order('razao_social')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getEmpresaById(id: string): Promise<EmpresaMei | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('empresas_mei')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function getResumoFinanceiro(
  empresaId: string
): Promise<ResumoFinanceiro | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('resumo_financeiro')
    .select('*')
    .eq('empresa_id', empresaId)
    .single()

  if (error) return null
  return data
}

export async function criarEmpresa(
  empresa: NovaEmpresaMei
): Promise<EmpresaMei> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Usuário não autenticado')

  const { data, error } = await supabase
    .from('empresas_mei')
    .insert({ ...empresa, usuario_id: user.id })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function atualizarEmpresa(
  id: string,
  campos: Partial<EmpresaMei>
): Promise<EmpresaMei> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('empresas_mei')
    .update(campos)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}
