'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatarMoeda, formatarData, anoAtual, mesAtual } from '@/lib/utils'
import Link from 'next/link'

const TIPOS = [{ value: '', label: 'Todos' }, { value: 'receita', label: 'Receitas' }, { value: 'despesa', label: 'Despesas' }, { value: 'das', label: 'DAS' }]
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default function LancamentosPage() {
  const [lancamentos, setLancamentos] = useState<any[]>([])
  const [tipo, setTipo] = useState('')
  const [mes, setMes] = useState(mesAtual())
  const [carregando, setCarregando] = useState(true)
  const [empresaId, setEmpresaId] = useState<string | null>(null)
  const ano = anoAtual()

  useEffect(() => { carregarEmpresa() }, [])
  useEffect(() => { if (empresaId) carregarLancamentos() }, [empresaId, tipo, mes])

  async function carregarEmpresa() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('empresas_mei').select('id').eq('usuario_id', user.id).eq('ativa', true).limit(1)
    if (data?.length) setEmpresaId(data[0].id)
    else setCarregando(false)
  }

  async function carregarLancamentos() {
    if (!empresaId) return
    setCarregando(true)
    const supabase = createClient()
    const mesStr = String(mes).padStart(2, '0')
    const dataInicio = `${ano}-${mesStr}-01`
    const ultimoDia = new Date(ano, mes, 0).getDate(); const dataFim = `${ano}-${mesStr}-${String(ultimoDia).padStart(2, '0')}`
    let query = supabase.from('lancamentos').select('*').eq('empresa_id', empresaId).gte('data', dataInicio).lte('data', dataFim).order('data', { ascending: false })
    if (tipo) query = query.eq('tipo', tipo)
    const { data, error } = await query
    if (error) console.error('Erro:', error)
    setLancamentos(data ?? [])
    setCarregando(false)
  }

  async function deletar(id: string) {
    if (!confirm('Excluir este lançamento?')) return
    const supabase = createClient()
    await supabase.from('lancamentos').delete().eq('id', id)
    setLancamentos(prev => prev.filter(l => l.id !== id))
  }

  const totalReceitas = lancamentos.filter(l => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0)
  const totalDespesas = lancamentos.filter(l => l.tipo === 'despesa').reduce((s, l) => s + l.valor, 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-white">Lançamentos</h1><p className="text-white/30 text-sm mt-0.5">{ano}</p></div>
        <Link href="/dashboard/lancamentos/novo" className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"><span>+</span> Novo lançamento</Link>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <select value={mes} onChange={e => setMes(Number(e.target.value))} className="bg-[#13131a] border border-white/10 text-white/70 text-sm rounded-xl px-4 py-2 outline-none">
          {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <div className="flex gap-1">
          {TIPOS.map(t => (
            <button key={t.value} onClick={() => setTipo(t.value)} className={`px-4 py-2 rounded-xl text-sm transition-all ${tipo === t.value ? 'bg-violet-600 text-white' : 'bg-[#13131a] border border-white/10 text-white/40 hover:text-white/70'}`}>{t.label}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4"><p className="text-emerald-400/60 text-xs mb-1">Receitas</p><p className="text-emerald-400 text-xl font-bold">{formatarMoeda(totalReceitas)}</p></div>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4"><p className="text-rose-400/60 text-xs mb-1">Despesas</p><p className="text-rose-400 text-xl font-bold">{formatarMoeda(totalDespesas)}</p></div>
        <div className={`border rounded-xl p-4 ${totalReceitas - totalDespesas >= 0 ? 'bg-violet-500/10 border-violet-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
          <p className="text-white/40 text-xs mb-1">Saldo do mês</p>
          <p className={`text-xl font-bold ${totalReceitas - totalDespesas >= 0 ? 'text-violet-400' : 'text-rose-400'}`}>{formatarMoeda(totalReceitas - totalDespesas)}</p>
        </div>
      </div>
      <div className="bg-[#13131a] border border-white/5 rounded-2xl overflow-hidden">
        {carregando ? <div className="p-12 text-center text-white/20 text-sm">Carregando...</div>
        : lancamentos.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-white/20 text-sm mb-1">Nenhum lançamento em {MESES[mes-1]}/{ano}.</p>
            <Link href="/dashboard/lancamentos/novo" className="text-violet-400 text-sm">Registrar agora →</Link>
          </div>
        ) : (
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              <th className="text-left px-6 py-3 text-white/30 text-xs font-normal">Descrição</th>
              <th className="text-left px-6 py-3 text-white/30 text-xs font-normal">Data</th>
              <th className="text-left px-6 py-3 text-white/30 text-xs font-normal">Tipo</th>
              <th className="text-right px-6 py-3 text-white/30 text-xs font-normal">Valor</th>
              <th className="px-6 py-3"></th>
            </tr></thead>
            <tbody>
              {lancamentos.map(l => (
                <tr key={l.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4"><p className="text-white/80 text-sm">{l.descricao}</p>{l.cliente && <p className="text-white/30 text-xs mt-0.5">{l.cliente}</p>}</td>
                  <td className="px-6 py-4 text-white/40 text-sm">{formatarData(l.data)}</td>
                  <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${l.tipo === 'receita' ? 'bg-emerald-500/15 text-emerald-400' : l.tipo === 'despesa' ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'}`}>{l.tipo}</span></td>
                  <td className={`px-6 py-4 text-right text-sm font-medium ${l.tipo === 'receita' ? 'text-emerald-400' : 'text-rose-400'}`}>{l.tipo === 'receita' ? '+' : '-'}{formatarMoeda(l.valor)}</td>
                  <td className="px-6 py-4 text-right"><button onClick={() => deletar(l.id)} className="text-white/20 hover:text-rose-400 text-xs transition-colors">✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
