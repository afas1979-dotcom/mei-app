'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CATEGORIAS: Record<string, string[]> = {
  receita: ['Serviço', 'Produto', 'Consultoria', 'Comissão', 'Outro'],
  despesa: ['Infraestrutura', 'Material', 'Transporte', 'Alimentação', 'Marketing', 'Aluguel', 'Outro'],
  das: [],
}

export default function NovoLancamentoPage() {
  const router = useRouter()
  const [tipo, setTipo] = useState<'receita'|'despesa'|'das'>('receita')
  const [form, setForm] = useState({ descricao: '', valor: '', data: new Date().toISOString().split('T')[0], categoria: '', cliente: '', nota_fiscal: '', das_competencia: '', observacoes: '' })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  function set(f: string, v: string) { setForm(p => ({ ...p, [f]: v })) }

  async function handleSalvar() {
    if (!form.descricao || !form.valor || !form.data) { setErro('Preencha descrição, valor e data.'); return }
    setSalvando(true); setErro('')
    const supabase = createClient()
    const { data: empresas } = await supabase.from('empresas_mei').select('id').eq('ativa', true).limit(1)
    if (!empresas?.length) { setErro('Nenhuma empresa cadastrada.'); setSalvando(false); return }
    const { error } = await supabase.from('lancamentos').insert({ empresa_id: empresas[0].id, tipo, descricao: form.descricao, valor: parseFloat(form.valor.replace(',', '.')), data: form.data, categoria: form.categoria || null, cliente: form.cliente || null, nota_fiscal: form.nota_fiscal || null, das_competencia: tipo === 'das' ? form.das_competencia : null, das_pago: false, observacoes: form.observacoes || null })
    if (error) { setErro('Erro: ' + error.message); setSalvando(false); return }
    router.push('/dashboard/lancamentos')
  }

  const tipos = { receita: { cor: 'emerald', label: 'Receita', desc: 'Valor recebido' }, despesa: { cor: 'rose', label: 'Despesa', desc: 'Custo da empresa' }, das: { cor: 'amber', label: 'DAS', desc: 'Guia do MEI' } }

  return (
    <div className="p-8 max-w-2xl">
      <button onClick={() => router.back()} className="text-white/30 text-sm hover:text-white/60 mb-6 flex items-center gap-1">← Voltar</button>
      <h1 className="text-2xl font-bold text-white mb-8">Novo lançamento</h1>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {(Object.entries(tipos) as any[]).map(([t, c]) => (
          <button key={t} onClick={() => { setTipo(t); set('categoria', '') }} className={`p-4 rounded-2xl border text-left transition-all ${tipo === t ? t === 'receita' ? 'bg-emerald-500/15 border-emerald-500/40' : t === 'despesa' ? 'bg-rose-500/15 border-rose-500/40' : 'bg-amber-500/15 border-amber-500/40' : 'bg-[#13131a] border-white/5 hover:border-white/10'}`}>
            <p className={`text-sm font-semibold mb-0.5 ${tipo === t ? t === 'receita' ? 'text-emerald-400' : t === 'despesa' ? 'text-rose-400' : 'text-amber-400' : 'text-white/50'}`}>{c.label}</p>
            <p className="text-white/30 text-xs">{c.desc}</p>
          </button>
        ))}
      </div>
      <div className="bg-[#13131a] border border-white/5 rounded-2xl p-6 space-y-5">
        <div><label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Descrição *</label><input value={form.descricao} onChange={e => set('descricao', e.target.value)} placeholder="Ex: Desenvolvimento de site" className="w-full bg-[#0f0f13] border border-white/8 rounded-xl px-4 py-2.5 text-white/80 text-sm outline-none focus:border-violet-500/50 placeholder:text-white/20" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Valor (R$) *</label><input type="number" step="0.01" value={form.valor} onChange={e => set('valor', e.target.value)} placeholder="0,00" className="w-full bg-[#0f0f13] border border-white/8 rounded-xl px-4 py-2.5 text-white/80 text-sm outline-none focus:border-violet-500/50 placeholder:text-white/20" /></div>
          <div><label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Data *</label><input type="date" value={form.data} onChange={e => set('data', e.target.value)} className="w-full bg-[#0f0f13] border border-white/8 rounded-xl px-4 py-2.5 text-white/80 text-sm outline-none focus:border-violet-500/50" /></div>
        </div>
        {tipo !== 'das' && <div><label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Categoria</label><select value={form.categoria} onChange={e => set('categoria', e.target.value)} className="w-full bg-[#0f0f13] border border-white/8 rounded-xl px-4 py-2.5 text-white/80 text-sm outline-none focus:border-violet-500/50"><option value="">Selecione...</option>{CATEGORIAS[tipo].map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}</select></div>}
        {tipo === 'das' && <div><label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Competência</label><input type="month" value={form.das_competencia} onChange={e => set('das_competencia', e.target.value)} className="w-full bg-[#0f0f13] border border-white/8 rounded-xl px-4 py-2.5 text-white/80 text-sm outline-none focus:border-violet-500/50" /></div>}
        {tipo === 'receita' && <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Cliente</label><input value={form.cliente} onChange={e => set('cliente', e.target.value)} placeholder="Nome do cliente" className="w-full bg-[#0f0f13] border border-white/8 rounded-xl px-4 py-2.5 text-white/80 text-sm outline-none focus:border-violet-500/50 placeholder:text-white/20" /></div>
          <div><label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">Nota fiscal</label><input value={form.nota_fiscal} onChange={e => set('nota_fiscal', e.target.value)} placeholder="Número da NF" className="w-full bg-[#0f0f13] border border-white/8 rounded-xl px-4 py-2.5 text-white/80 text-sm outline-none focus:border-violet-500/50 placeholder:text-white/20" /></div>
        </div>}
        {erro && <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3"><p className="text-rose-400 text-sm">{erro}</p></div>}
        <div className="flex gap-3 pt-2">
          <button onClick={() => router.back()} className="flex-1 py-3 rounded-xl border border-white/10 text-white/40 hover:text-white/60 text-sm transition-colors">Cancelar</button>
          <button onClick={handleSalvar} disabled={salvando} className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium transition-colors">{salvando ? 'Salvando...' : 'Salvar lançamento'}</button>
        </div>
      </div>
    </div>
  )
}
