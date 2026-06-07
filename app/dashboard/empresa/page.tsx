'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatarCNPJ } from '@/lib/utils'
import Link from 'next/link'

export default function EmpresaPage() {
  const [empresa, setEmpresa] = useState<any>(null)
  const [carregando, setCarregando] = useState(true)
  useEffect(() => {
    createClient().from('empresas_mei').select('*').eq('ativa', true).limit(1).then(({ data }) => { setEmpresa(data?.[0] ?? null); setCarregando(false) })
  }, [])
  if (carregando) return <div className="p-8 text-white/20 text-sm">Carregando...</div>
  if (!empresa) return <div className="p-8 max-w-lg"><h1 className="text-2xl font-bold text-white mb-2">Empresa</h1><p className="text-white/30 text-sm mb-8">Nenhuma empresa cadastrada.</p><Link href="/dashboard/empresa/nova" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm px-5 py-3 rounded-xl transition-colors">+ Cadastrar empresa MEI</Link></div>
  const campos = [{ label: 'CNPJ', value: formatarCNPJ(empresa.cnpj) }, { label: 'Razão Social', value: empresa.razao_social }, { label: 'Atividade', value: empresa.atividade }, { label: 'E-mail', value: empresa.email_empresa ?? '—' }, { label: 'Telefone', value: empresa.telefone ?? '—' }, { label: 'Cidade / UF', value: empresa.cidade ? `${empresa.cidade} / ${empresa.uf}` : '—' }]
  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-8">Empresa</h1>
      <div className="bg-[#13131a] border border-white/5 rounded-2xl overflow-hidden">
        {campos.map((c, i) => <div key={i} className="flex items-center justify-between px-6 py-4 border-b border-white/5 last:border-0"><span className="text-white/30 text-sm">{c.label}</span><span className="text-white/80 text-sm font-medium">{c.value}</span></div>)}
      </div>
    </div>
  )
}
