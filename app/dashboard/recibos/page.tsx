'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatarMoeda } from '@/lib/utils'

interface EmpresaInfo {
  razao_social: string
  cnpj: string
  atividade: string
  cidade: string
  uf: string
  telefone: string
  email_empresa: string
}

export default function RecibosPage() {
  const [empresa, setEmpresa] = useState<EmpresaInfo | null>(null)
  const [preview, setPreview] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState({
    numero: String(Math.floor(Math.random() * 9000) + 1000),
    data: new Date().toISOString().split('T')[0],
    cliente_nome: '',
    cliente_cpf_cnpj: '',
    cliente_endereco: '',
    descricao: '',
    valor: '',
    forma_pagamento: 'Transferência bancária',
    observacoes: '',
  })

  useEffect(() => { carregarEmpresa() }, [])

  async function carregarEmpresa() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const salva = localStorage.getItem('empresa_id')
    const { data } = await supabase.from('empresas_mei').select('*').eq('usuario_id', user.id).eq('ativa', true)
    if (!data?.length) return
    const emp = data.find(e => e.id === salva) ?? data[0]
    setEmpresa(emp)
  }

  function set(f: string, v: string) { setForm(p => ({ ...p, [f]: v })) }

  function handleImprimir() {
    window.print()
  }

  const valorNum = parseFloat(form.valor.replace(',', '.')) || 0
  const valorExtenso = (v: number) => {
    // Extenso simples para valores até 999.999
    const unidades = ['','um','dois','três','quatro','cinco','seis','sete','oito','nove','dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove']
    const dezenas = ['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa']
    const centenas = ['','cem','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos']
    if (v === 0) return 'zero reais'
    const inteiro = Math.floor(v)
    const cents = Math.round((v - inteiro) * 100)
    let texto = ''
    if (inteiro >= 1000) {
      const mil = Math.floor(inteiro / 1000)
      texto += (mil === 1 ? 'mil' : unidades[mil] + ' mil')
      if (inteiro % 1000 > 0) texto += ' e '
    }
    const resto = inteiro % 1000
    if (resto >= 100) {
      texto += resto === 100 ? 'cem' : centenas[Math.floor(resto/100)]
      if (resto % 100 > 0) texto += ' e '
    }
    const r2 = resto % 100
    if (r2 >= 20) {
      texto += dezenas[Math.floor(r2/10)]
      if (r2 % 10 > 0) texto += ' e ' + unidades[r2 % 10]
    } else if (r2 > 0) {
      texto += unidades[r2]
    }
    texto += inteiro === 1 ? ' real' : ' reais'
    if (cents > 0) texto += ` e ${cents} centavo${cents > 1 ? 's' : ''}`
    return texto
  }

  const inp = "w-full bg-[#0f0f13] border border-white/8 rounded-xl px-4 py-2.5 text-white/80 text-sm outline-none focus:border-violet-500/50 placeholder:text-white/20"

  return (
    <>
      {/* Estilos de impressão */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #recibo-print, #recibo-print * { visibility: visible !important; }
          #recibo-print { position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; background: white !important; }
        }
      `}</style>

      <div className="p-8 min-h-screen bg-[#0f0f13]">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Emissor de Recibos</h1>
              <p className="text-white/30 text-sm mt-0.5">Gere e imprima recibos profissionais</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPreview(!preview)}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 text-sm px-5 py-2.5 rounded-xl transition-all">
                {preview ? '← Editar' : 'Visualizar →'}
              </button>
              {preview && (
                <button onClick={handleImprimir}
                  className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-5 py-2.5 rounded-xl transition-all flex items-center gap-2">
                  🖨 Imprimir / Salvar PDF
                </button>
              )}
            </div>
          </div>

          {!preview ? (
            /* FORMULÁRIO */
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-5">
                <div className="bg-[#13131a] border border-white/5 rounded-2xl p-6 space-y-4">
                  <p className="text-white/40 text-xs uppercase tracking-widest">Dados do recibo</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-white/40 text-xs mb-1.5">Número</label>
                      <input value={form.numero} onChange={e => set('numero', e.target.value)} className={inp} />
                    </div>
                    <div>
                      <label className="block text-white/40 text-xs mb-1.5">Data</label>
                      <input type="date" value={form.data} onChange={e => set('data', e.target.value)} className={inp} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs mb-1.5">Valor (R$)</label>
                    <input type="number" step="0.01" value={form.valor} onChange={e => set('valor', e.target.value)} placeholder="0,00" className={inp} />
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs mb-1.5">Forma de pagamento</label>
                    <select value={form.forma_pagamento} onChange={e => set('forma_pagamento', e.target.value)} className={inp}>
                      <option>Transferência bancária</option>
                      <option>PIX</option>
                      <option>Dinheiro</option>
                      <option>Cartão de crédito</option>
                      <option>Cartão de débito</option>
                      <option>Cheque</option>
                      <option>Boleto</option>
                    </select>
                  </div>
                </div>

                <div className="bg-[#13131a] border border-white/5 rounded-2xl p-6 space-y-4">
                  <p className="text-white/40 text-xs uppercase tracking-widest">Serviço prestado</p>
                  <div>
                    <label className="block text-white/40 text-xs mb-1.5">Descrição do serviço *</label>
                    <textarea value={form.descricao} onChange={e => set('descricao', e.target.value)}
                      placeholder="Descreva o serviço prestado..." rows={4} className={`${inp} resize-none`} />
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs mb-1.5">Observações</label>
                    <textarea value={form.observacoes} onChange={e => set('observacoes', e.target.value)}
                      placeholder="Informações adicionais..." rows={2} className={`${inp} resize-none`} />
                  </div>
                </div>
              </div>

              <div className="bg-[#13131a] border border-white/5 rounded-2xl p-6 space-y-4 h-fit">
                <p className="text-white/40 text-xs uppercase tracking-widest">Dados do cliente</p>
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">Nome / Razão Social *</label>
                  <input value={form.cliente_nome} onChange={e => set('cliente_nome', e.target.value)} placeholder="Nome do cliente" className={inp} />
                </div>
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">CPF / CNPJ</label>
                  <input value={form.cliente_cpf_cnpj} onChange={e => set('cliente_cpf_cnpj', e.target.value)} placeholder="000.000.000-00" className={inp} />
                </div>
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">Endereço</label>
                  <input value={form.cliente_endereco} onChange={e => set('cliente_endereco', e.target.value)} placeholder="Rua, número, cidade" className={inp} />
                </div>

                {valorNum > 0 && (
                  <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 mt-4">
                    <p className="text-violet-400/60 text-xs mb-1">Valor por extenso</p>
                    <p className="text-violet-300 text-sm font-medium capitalize">{valorExtenso(valorNum)}</p>
                  </div>
                )}

                <button onClick={() => setPreview(true)}
                  disabled={!form.cliente_nome || !form.descricao || !form.valor}
                  className="w-full mt-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 text-white text-sm font-medium transition-colors">
                  Visualizar recibo →
                </button>
              </div>
            </div>
          ) : (
            /* PREVIEW */
            <div>
              <div id="recibo-print" ref={printRef}
                style={{ background: 'white', color: '#111', fontFamily: 'Georgia, serif', maxWidth: '800px', margin: '0 auto', padding: '48px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>

                {/* Cabeçalho */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #111', paddingBottom: '24px', marginBottom: '24px' }}>
                  <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{empresa?.razao_social ?? 'Empresa MEI'}</h1>
                    <p style={{ color: '#666', fontSize: '13px', margin: '4px 0 0' }}>CNPJ: {empresa?.cnpj ?? '—'}</p>
                    <p style={{ color: '#666', fontSize: '13px', margin: '2px 0 0' }}>{empresa?.atividade ?? ''}</p>
                    {empresa?.telefone && <p style={{ color: '#666', fontSize: '13px', margin: '2px 0 0' }}>Tel: {empresa.telefone}</p>}
                    {empresa?.email_empresa && <p style={{ color: '#666', fontSize: '13px', margin: '2px 0 0' }}>{empresa.email_empresa}</p>}
                    {empresa?.cidade && <p style={{ color: '#666', fontSize: '13px', margin: '2px 0 0' }}>{empresa.cidade}/{empresa.uf}</p>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ background: '#111', color: 'white', padding: '8px 20px', borderRadius: '6px', display: 'inline-block' }}>
                      <p style={{ fontSize: '11px', margin: 0, letterSpacing: '2px' }}>RECIBO</p>
                      <p style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>Nº {form.numero}</p>
                    </div>
                    <p style={{ color: '#666', fontSize: '13px', margin: '8px 0 0' }}>
                      {new Date(form.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Valor destaque */}
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: '#999', letterSpacing: '1px', margin: 0 }}>VALOR TOTAL</p>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '4px 0 0', color: '#111' }}>{formatarMoeda(valorNum)}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '11px', color: '#999', letterSpacing: '1px', margin: 0 }}>FORMA DE PAGAMENTO</p>
                    <p style={{ fontSize: '16px', fontWeight: '600', margin: '4px 0 0' }}>{form.forma_pagamento}</p>
                  </div>
                </div>

                {/* Corpo */}
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '13px', color: '#999', letterSpacing: '1px', marginBottom: '8px' }}>RECEBI(EMOS) DE</p>
                  <p style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px' }}>{form.cliente_nome || '___________________________'}</p>
                  {form.cliente_cpf_cnpj && <p style={{ fontSize: '13px', color: '#666', margin: '0 0 4px' }}>CPF/CNPJ: {form.cliente_cpf_cnpj}</p>}
                  {form.cliente_endereco && <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>{form.cliente_endereco}</p>}
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '13px', color: '#999', letterSpacing: '1px', marginBottom: '8px' }}>A IMPORTÂNCIA DE</p>
                  <p style={{ fontSize: '14px', color: '#111', fontStyle: 'italic', margin: 0, padding: '12px 16px', background: '#f9fafb', borderLeft: '3px solid #111', borderRadius: '0 4px 4px 0' }}>
                    {formatarMoeda(valorNum)} — <span style={{ textTransform: 'capitalize' }}>{valorExtenso(valorNum)}</span>
                  </p>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <p style={{ fontSize: '13px', color: '#999', letterSpacing: '1px', marginBottom: '8px' }}>REFERENTE A</p>
                  <p style={{ fontSize: '14px', color: '#111', lineHeight: '1.6', margin: 0 }}>{form.descricao}</p>
                </div>

                {form.observacoes && (
                  <div style={{ marginBottom: '32px', padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px' }}>
                    <p style={{ fontSize: '12px', color: '#92400e', margin: '0 0 4px', fontWeight: 'bold' }}>OBSERVAÇÕES</p>
                    <p style={{ fontSize: '13px', color: '#92400e', margin: 0 }}>{form.observacoes}</p>
                  </div>
                )}

                {/* Assinaturas */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ borderTop: '1px solid #111', paddingTop: '8px' }}>
                      <p style={{ fontSize: '13px', margin: 0 }}>{empresa?.razao_social ?? 'Prestador de Serviço'}</p>
                      <p style={{ fontSize: '12px', color: '#666', margin: '2px 0 0' }}>CNPJ: {empresa?.cnpj ?? '—'}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ borderTop: '1px solid #111', paddingTop: '8px' }}>
                      <p style={{ fontSize: '13px', margin: 0 }}>{form.cliente_nome || 'Cliente'}</p>
                      {form.cliente_cpf_cnpj && <p style={{ fontSize: '12px', color: '#666', margin: '2px 0 0' }}>CPF/CNPJ: {form.cliente_cpf_cnpj}</p>}
                    </div>
                  </div>
                </div>

                {/* Rodapé */}
                <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                  <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>
                    Documento emitido por {empresa?.razao_social ?? 'MEI'} — CNPJ {empresa?.cnpj ?? '—'} — {empresa?.cidade ?? ''}/{empresa?.uf ?? ''}
                  </p>
                  <p style={{ fontSize: '11px', color: '#999', margin: '4px 0 0' }}>
                    Este recibo foi gerado eletronicamente em {new Date().toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
