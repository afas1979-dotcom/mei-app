'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NovaEmpresaPage() {
  const router = useRouter()
  const [form, setForm] = useState({ cnpj: '', razao_social: '', nome_fantasia: '', atividade: '', data_abertura: '', email_empresa: '', telefone: '', cidade: '', uf: '' })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  function set(f: string, v: string) { setForm(p => ({ ...p, [f]: v })) }

  async function handleSalvar() {
    if (!form.cnpj || !form.razao_social || !form.atividade) { setErro('CNPJ, razão social e atividade são obrigatórios.'); return }
    setSalvando(true); setErro('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setErro('Não autenticado.'); setSalvando(false); return }
    const { error } = await supabase.from('empresas_mei').insert({ usuario_id: user.id, cnpj: form.cnpj.replace(/\D/g, ''), razao_social: form.razao_social, nome_fantasia: form.nome_fantasia || null, atividade: form.atividade, data_abertura: form.data_abertura || null, email_empresa: form.email_empresa || null, telefone: form.telefone || null, cidade: form.cidade || null, uf: form.uf || null })
    if (error) { setErro(error.message.includes('unique') ? 'CNPJ já cadastrado.' : error.message); setSalvando(false); return }
    router.push('/dashboard')
  }

  const inp = "w-full bg-[#0f0f13] border border-white/8 rounded-xl px-4 py-2.5 text-white/80 text-sm outline-none focus:border-violet-500/50 placeholder:text-white/20"
  return (
    <div className="p-8 max-w-2xl">
      <button onClick={() => router.back()} className="text-white/30 text-sm hover:text-white/60 mb-6 flex items-center gap-1">← Voltar</button>
      <h1 className="text-2xl font-bold text-white mb-8">Cadastrar empresa MEI</h1>
      <div className="space-y-4 bg-[#13131a] border border-white/5 rounded-2xl p-6">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-white/40 text-xs mb-1.5">CNPJ *</label><input value={form.cnpj} onChange={e => set('cnpj', e.target.value)} placeholder="00.000.000/0001-00" className={inp} /></div>
          <div><label className="block text-white/40 text-xs mb-1.5">Data de Abertura</label><input type="date" value={form.data_abertura} onChange={e => set('data_abertura', e.target.value)} className={inp} /></div>
        </div>
        <div><label className="block text-white/40 text-xs mb-1.5">Razão Social *</label><input value={form.razao_social} onChange={e => set('razao_social', e.target.value)} placeholder="João Silva Serviços" className={inp} /></div>
        <div><label className="block text-white/40 text-xs mb-1.5">Atividade Principal *</label><input value={form.atividade} onChange={e => set('atividade', e.target.value)} placeholder="Desenvolvimento de software" className={inp} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-white/40 text-xs mb-1.5">E-mail</label><input type="email" value={form.email_empresa} onChange={e => set('email_empresa', e.target.value)} placeholder="empresa@email.com" className={inp} /></div>
          <div><label className="block text-white/40 text-xs mb-1.5">Telefone</label><input value={form.telefone} onChange={e => set('telefone', e.target.value)} placeholder="(21) 99999-9999" className={inp} /></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2"><label className="block text-white/40 text-xs mb-1.5">Cidade</label><input value={form.cidade} onChange={e => set('cidade', e.target.value)} placeholder="Rio de Janeiro" className={inp} /></div>
          <div><label className="block text-white/40 text-xs mb-1.5">UF</label><input value={form.uf} onChange={e => set('uf', e.target.value.toUpperCase())} placeholder="RJ" maxLength={2} className={inp} /></div>
        </div>
        {erro && <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3"><p className="text-rose-400 text-sm">{erro}</p></div>}
        <div className="flex gap-3 pt-2">
          <button onClick={() => router.back()} className="flex-1 py-3 rounded-xl border border-white/10 text-white/40 text-sm">Cancelar</button>
          <button onClick={handleSalvar} disabled={salvando} className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium">{salvando ? 'Salvando...' : 'Cadastrar empresa'}</button>
        </div>
      </div>
    </div>
  )
}
