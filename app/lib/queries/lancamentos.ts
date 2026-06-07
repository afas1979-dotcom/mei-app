// lib/queries/lancamentos.ts
// Funções para buscar e manipular lançamentos financeiros

import { createClient } from '@/lib/supabase/server'
import type { Lancamento, NovoLancamento, AtualizarLancamento } from '@/types/database'

interface FiltrosLancamento {
  empresaId: string
  tipo?: 'receita' | 'despesa' | 'das'
  ano?: number
  mes?: number
}

export async function getLancamentos(
  filtros: FiltrosLancamento
): Promise<Lancamento[]> {
  const supabase = await createClient()

  let query = supabase
    .from('lancamentos')
    .select('*')
    .eq('empresa_id', filtros.empresaId)
    .order('data', { ascending: false })

  if (filtros.tipo) {
    query = query.eq('tipo', filtros.tipo)
  }

  if (filtros.ano) {
    const inicio = `${filtros.ano}-01-01`
    const fim = `${filtros.ano}-12-31`
    query = query.gte('data', inicio).lte('data', fim)
  }

  if (filtros.mes && filtros.ano) {
    const mesStr = String(filtros.mes).padStart(2, '0')
    const inicio = `${filtros.ano}-${mesStr}-01`
    const ultimoDia = new Date(filtros.ano, filtros.mes, 0).getDate()
    const fim = `${filtros.ano}-${mesStr}-${ultimoDia}`
    query = query.gte('data', inicio).lte('data', fim)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function criarLancamento(
  lancamento: NovoLancamento
): Promise<Lancamento> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lancamentos')
    .insert(lancamento)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function atualizarLancamento(
  id: string,
  campos: AtualizarLancamento
): Promise<Lancamento> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lancamentos')
    .update(campos)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deletarLancamento(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('lancamentos')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function getDasPendentes(
  empresaId: string
): Promise<Lancamento[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lancamentos')
    .select('*')
    .eq('empresa_id', empresaId)
    .eq('tipo', 'das')
    .eq('das_pago', false)
    .order('das_competencia')

  if (error) throw new Error(error.message)
  return data ?? []
}
