'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatarMoeda } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const CORES = ['#8b5cf6','#22c55e','#ef4444','#eab308','#06b6d4','#f97316']

export default function RelatoriosPage() {
  const [empresaId, setEmpresaId] = useState<string|null>(null)
  const [anoSel, setAnoSel] = useState(new Date().getFullYear())
  const [mesSel, setMesSel] = useState(new Date().getMonth()+1)
  const [lancamentos, setLancamentos] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)
  const [aba, setAba] = useState<'mensal'|'anual'|'das'>('mensal')

  useEffect(() => { carregarEmpresa() }, [])
  useEffect(() => { if (empresaId) carregarDados() }, [empresaId, anoSel])

  async function carregarEmpresa() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const salva = localStorage.getItem('empresa_id')
    const { data } = await supabase.from('empresas_mei').select('id').eq('usuario_id', user.id).eq('ativa', true)
    if (!data?.length) { setCarregando(false); return }
    const empresa = data.find(e => e.id === salva) ?? data[0]
    setEmpresaId(empresa.id)
  }

  async function carregarDados() {
    if (!empresaId) return
    setCarregando(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('lancamentos')
      .select('*')
      .eq('empresa_id', empresaId)
      .gte('data', `${anoSel}-01-01`)
      .lte('data', `${anoSel}-12-31`)
      .order('data', { ascending: true })
    setLancamentos(data ?? [])
    setCarregando(false)
  }

  // Dados mensais agrupados
  const dadosMensais = MESES.map((mes, i) => {
    const mesNum = i + 1
    const doMes = lancamentos.filter(l => new Date(l.data+'T00:00:00').getMonth()+1 === mesNum)
    const receitas = doMes.filter(l => l.tipo === 'receita').reduce((s,l) => s+l.valor, 0)
    const despesas = doMes.filter(l => l.tipo === 'despesa').reduce((s,l) => s+l.valor, 0)
    const das = doMes.filter(l => l.tipo === 'das').reduce((s,l) => s+l.valor, 0)
    return { mes, receitas, despesas, das, saldo: receitas - despesas - das }
  })

  // Dados do mês selecionado
  const doMesSel = lancamentos.filter(l => new Date(l.data+'T00:00:00').getMonth()+1 === mesSel)
  const receitasMes = doMesSel.filter(l => l.tipo === 'receita').reduce((s,l) => s+l.valor, 0)
  const despesasMes = doMesSel.filter(l => l.tipo === 'despesa').reduce((s,l) => s+l.valor, 0)
  const dasMes = doMesSel.filter(l => l.tipo === 'das').reduce((s,l) => s+l.valor, 0)

  // Pizza por categoria do mês
  const categorias = doMesSel.reduce((acc: any, l) => {
    const cat = l.categoria ?? l.tipo
    acc[cat] = (acc[cat] ?? 0) + l.valor
    return acc
  }, {})
  const dadosPizza = Object.entries(categorias).map(([name, value]) => ({ name, value }))

  // DAS
  const todosDas = lancamentos.filter(l => l.tipo === 'das')

  const totalAnual = dadosMensais.reduce((s,m) => s+m.receitas, 0)
  const totalDespAnual = dadosMensais.reduce((s,m) => s+m.despesas, 0)

  const tooltipStyle = { backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }

  return (
    <div className="p-8 min-h-screen bg-[#0f0f13]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Relatórios</h1>
          <p className="text-white/30 text-sm mt-0.5">Análise financeira da empresa</p>
        </div>
        <select value={anoSel} onChange={e => setAnoSel(Number(e.target.value))}
          className="bg-[#13131a] border border-white/10 text-white/70 text-sm rounded-xl px-4 py-2 outline-none">
          {[2024,2025,2026,2027].map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Abas */}
      <div className="flex gap-2 mb-6">
        {([['mensal','Mensal'],['anual','Anual'],['das','DAS']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setAba(id)}
            className={`px-5 py-2 rounded-xl text-sm transition-all ${aba === id ? 'bg-violet-600 text-white' : 'bg-[#13131a] border border-white/10 text-white/40 hover:text-white/70'}`}>
            {label}
          </button>
        ))}
      </div>

      {carregando ? (
        <div className="text-center py-20 text-white/20">Carregando...</div>
      ) : lancamentos.length === 0 ? (
        <div className="text-center py-20 text-white/20">Nenhum lançamento em {anoSel}.</div>
      ) : (
        <>
          {/* ABA MENSAL */}
          {aba === 'mensal' && (
            <div className="space-y-6">
              {/* Seletor de mês */}
              <div className="flex gap-2 flex-wrap">
                {MESES.map((m,i) => (
                  <button key={i} onClick={() => setMesSel(i+1)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${mesSel === i+1 ? 'bg-violet-600 text-white' : 'bg-[#13131a] border border-white/10 text-white/40 hover:text-white/60'}`}>
                    {m}
                  </button>
                ))}
              </div>

              {/* Cards do mês */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Receitas', value: receitasMes, color: 'emerald' },
                  { label: 'Despesas', value: despesasMes, color: 'rose' },
                  { label: 'DAS', value: dasMes, color: 'amber' },
                  { label: 'Saldo', value: receitasMes-despesasMes-dasMes, color: receitasMes-despesasMes-dasMes >= 0 ? 'violet' : 'rose' },
                ].map(c => (
                  <div key={c.label} className={`rounded-2xl border p-5 ${
                    c.color==='emerald' ? 'bg-emerald-500/10 border-emerald-500/20' :
                    c.color==='rose' ? 'bg-rose-500/10 border-rose-500/20' :
                    c.color==='amber' ? 'bg-amber-500/10 border-amber-500/20' :
                    c.color==='violet' ? 'bg-violet-500/10 border-violet-500/20' :
                    'bg-white/5 border-white/10'
                  }`}>
                    <p className="text-white/40 text-xs mb-1">{c.label}</p>
                    <p className="text-white text-xl font-bold">{formatarMoeda(c.value)}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Gráfico de barras */}
                <div className="bg-[#13131a] border border-white/5 rounded-2xl p-6">
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-4">Receitas x Despesas — {MESES[mesSel-1]}/{anoSel}</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[{ name: MESES[mesSel-1], receitas: receitasMes, despesas: despesasMes, das: dasMes }]}>
                      <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatarMoeda(v)} />
                      <Bar dataKey="receitas" fill="#22c55e" radius={[6,6,0,0]} name="Receitas" />
                      <Bar dataKey="despesas" fill="#ef4444" radius={[6,6,0,0]} name="Despesas" />
                      <Bar dataKey="das" fill="#eab308" radius={[6,6,0,0]} name="DAS" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pizza por categoria */}
                <div className="bg-[#13131a] border border-white/5 rounded-2xl p-6">
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-4">Por categoria</p>
                  {dadosPizza.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-white/20 text-sm">Sem dados</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={dadosPizza} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name">
                          {dadosPizza.map((_,i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatarMoeda(v)} />
                        <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Tabela do mês */}
              <div className="bg-[#13131a] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                  <p className="text-white/40 text-xs uppercase tracking-widest">Lançamentos de {MESES[mesSel-1]}/{anoSel}</p>
                </div>
                {doMesSel.length === 0 ? (
                  <div className="p-8 text-center text-white/20 text-sm">Nenhum lançamento neste mês.</div>
                ) : (
                  <table className="w-full">
                    <thead><tr className="border-b border-white/5">
                      <th className="text-left px-6 py-3 text-white/30 text-xs font-normal">Descrição</th>
                      <th className="text-left px-6 py-3 text-white/30 text-xs font-normal">Data</th>
                      <th className="text-left px-6 py-3 text-white/30 text-xs font-normal">Categoria</th>
                      <th className="text-left px-6 py-3 text-white/30 text-xs font-normal">Tipo</th>
                      <th className="text-right px-6 py-3 text-white/30 text-xs font-normal">Valor</th>
                    </tr></thead>
                    <tbody>
                      {doMesSel.map(l => (
                        <tr key={l.id} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                          <td className="px-6 py-3 text-white/80 text-sm">{l.descricao}</td>
                          <td className="px-6 py-3 text-white/40 text-sm">{new Date(l.data+'T00:00:00').toLocaleDateString('pt-BR')}</td>
                          <td className="px-6 py-3 text-white/40 text-sm">{l.categoria ?? '—'}</td>
                          <td className="px-6 py-3"><span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${l.tipo==='receita' ? 'bg-emerald-500/15 text-emerald-400' : l.tipo==='despesa' ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'}`}>{l.tipo}</span></td>
                          <td className={`px-6 py-3 text-right text-sm font-medium ${l.tipo==='receita' ? 'text-emerald-400' : 'text-rose-400'}`}>{l.tipo==='receita' ? '+' : '-'}{formatarMoeda(l.valor)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ABA ANUAL */}
          {aba === 'anual' && (
            <div className="space-y-6">
              {/* Cards anuais */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                  <p className="text-white/40 text-xs mb-1">Total receitas {anoSel}</p>
                  <p className="text-white text-2xl font-bold">{formatarMoeda(totalAnual)}</p>
                </div>
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5">
                  <p className="text-white/40 text-xs mb-1">Total despesas {anoSel}</p>
                  <p className="text-white text-2xl font-bold">{formatarMoeda(totalDespAnual)}</p>
                </div>
                <div className={`rounded-2xl border p-5 ${totalAnual-totalDespAnual >= 0 ? 'bg-violet-500/10 border-violet-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                  <p className="text-white/40 text-xs mb-1">Resultado {anoSel}</p>
                  <p className="text-white text-2xl font-bold">{formatarMoeda(totalAnual-totalDespAnual)}</p>
                </div>
              </div>

              {/* Gráfico anual */}
              <div className="bg-[#13131a] border border-white/5 rounded-2xl p-6">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-6">Evolução mensal {anoSel}</p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={dadosMensais} barGap={2}>
                    <XAxis dataKey="mes" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatarMoeda(v)} />
                    <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }} />
                    <Bar dataKey="receitas" fill="#22c55e" radius={[4,4,0,0]} name="Receitas" />
                    <Bar dataKey="despesas" fill="#ef4444" radius={[4,4,0,0]} name="Despesas" />
                    <Bar dataKey="das" fill="#eab308" radius={[4,4,0,0]} name="DAS" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Tabela anual */}
              <div className="bg-[#13131a] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                  <p className="text-white/40 text-xs uppercase tracking-widest">Resumo por mês</p>
                </div>
                <table className="w-full">
                  <thead><tr className="border-b border-white/5">
                    <th className="text-left px-6 py-3 text-white/30 text-xs font-normal">Mês</th>
                    <th className="text-right px-6 py-3 text-white/30 text-xs font-normal">Receitas</th>
                    <th className="text-right px-6 py-3 text-white/30 text-xs font-normal">Despesas</th>
                    <th className="text-right px-6 py-3 text-white/30 text-xs font-normal">DAS</th>
                    <th className="text-right px-6 py-3 text-white/30 text-xs font-normal">Saldo</th>
                  </tr></thead>
                  <tbody>
                    {dadosMensais.map((m,i) => (
                      <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                        <td className="px-6 py-3 text-white/70 text-sm">{m.mes}/{anoSel}</td>
                        <td className="px-6 py-3 text-right text-emerald-400 text-sm">{m.receitas > 0 ? formatarMoeda(m.receitas) : '—'}</td>
                        <td className="px-6 py-3 text-right text-rose-400 text-sm">{m.despesas > 0 ? formatarMoeda(m.despesas) : '—'}</td>
                        <td className="px-6 py-3 text-right text-amber-400 text-sm">{m.das > 0 ? formatarMoeda(m.das) : '—'}</td>
                        <td className={`px-6 py-3 text-right text-sm font-medium ${m.saldo >= 0 ? 'text-violet-400' : 'text-rose-400'}`}>{m.receitas+m.despesas+m.das > 0 ? formatarMoeda(m.saldo) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ABA DAS */}
          {aba === 'das' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
                  <p className="text-white/40 text-xs mb-1">Total DAS {anoSel}</p>
                  <p className="text-white text-2xl font-bold">{formatarMoeda(todosDas.reduce((s,l) => s+l.valor, 0))}</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                  <p className="text-white/40 text-xs mb-1">Pagamentos</p>
                  <p className="text-white text-2xl font-bold">{todosDas.length}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-white/40 text-xs mb-1">Média mensal</p>
                  <p className="text-white text-2xl font-bold">{formatarMoeda(todosDas.reduce((s,l) => s+l.valor, 0) / (todosDas.length || 1))}</p>
                </div>
              </div>

              <div className="bg-[#13131a] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                  <p className="text-white/40 text-xs uppercase tracking-widest">Histórico de DAS — {anoSel}</p>
                </div>
                {todosDas.length === 0 ? (
                  <div className="p-8 text-center text-white/20 text-sm">Nenhum DAS registrado em {anoSel}.</div>
                ) : (
                  <table className="w-full">
                    <thead><tr className="border-b border-white/5">
                      <th className="text-left px-6 py-3 text-white/30 text-xs font-normal">Descrição</th>
                      <th className="text-left px-6 py-3 text-white/30 text-xs font-normal">Competência</th>
                      <th className="text-left px-6 py-3 text-white/30 text-xs font-normal">Data pagamento</th>
                      <th className="text-left px-6 py-3 text-white/30 text-xs font-normal">Status</th>
                      <th className="text-right px-6 py-3 text-white/30 text-xs font-normal">Valor</th>
                    </tr></thead>
                    <tbody>
                      {todosDas.map(l => (
                        <tr key={l.id} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                          <td className="px-6 py-3 text-white/80 text-sm">{l.descricao}</td>
                          <td className="px-6 py-3 text-white/40 text-sm">{l.das_competencia ?? '—'}</td>
                          <td className="px-6 py-3 text-white/40 text-sm">{new Date(l.data+'T00:00:00').toLocaleDateString('pt-BR')}</td>
                          <td className="px-6 py-3">
                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${l.das_pago ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                              {l.das_pago ? 'Pago' : 'Pendente'}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right text-amber-400 text-sm font-medium">{formatarMoeda(l.valor)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
