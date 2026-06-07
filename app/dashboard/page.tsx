import { createClient } from '@/lib/supabase/server'
import { getEmpresas, getResumoFinanceiro } from '@/lib/queries/empresas'
import { getLancamentos, getDasPendentes } from '@/lib/queries/lancamentos'
import { formatarMoeda, formatarData, anoAtual } from '@/lib/utils'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const empresas = await getEmpresas()
  const empresa = empresas[0] ?? null
  const resumo = empresa ? await getResumoFinanceiro(empresa.id) : null
  const dasPendentes = empresa ? await getDasPendentes(empresa.id) : []
  const lancamentosRecentes = empresa ? await getLancamentos({ empresaId: empresa.id, ano: anoAtual() }) : []
  const percentual = resumo ? Math.min(100, (resumo.receita_acumulada / resumo.limite_anual) * 100) : 0
  const corBarra = percentual < 60 ? '#22c55e' : percentual < 85 ? '#eab308' : '#ef4444'
  const ultimos = lancamentosRecentes.slice(0, 5)

  return (
    <div className="p-8 min-h-screen bg-[#0f0f13]">
      <div className="mb-10">
        <p className="text-white/30 text-sm mb-1">Bem-vindo de volta</p>
        <h1 className="text-3xl font-bold text-white tracking-tight">{empresa?.razao_social ?? 'Minha Empresa MEI'}</h1>
        {empresa && <p className="text-white/30 text-sm mt-1">CNPJ: {empresa.cnpj}</p>}
      </div>

      {!empresa ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
          <p className="text-white/40 mb-4">Nenhuma empresa cadastrada ainda.</p>
          <Link href="/dashboard/empresa/nova" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm px-5 py-2.5 rounded-xl transition-colors">Cadastrar empresa MEI</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Receita no ano', value: formatarMoeda(resumo?.receita_acumulada ?? 0), color: 'violet', icon: '↑' },
              { label: 'Despesas no ano', value: formatarMoeda(resumo?.total_despesas ?? 0), color: 'rose', icon: '↓' },
              { label: 'Saldo disponível', value: formatarMoeda(resumo?.saldo_disponivel ?? 81000), color: 'emerald', icon: '◈' },
              { label: 'DAS pendentes', value: String(dasPendentes.length), color: dasPendentes.length > 0 ? 'amber' : 'slate', icon: '!' },
            ].map((c) => (
              <div key={c.label} className={`rounded-2xl border p-5 ${
                c.color === 'violet'  ? 'bg-violet-500/10 border-violet-500/20' :
                c.color === 'rose'    ? 'bg-rose-500/10 border-rose-500/20' :
                c.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20' :
                c.color === 'amber'   ? 'bg-amber-500/10 border-amber-500/20' :
                'bg-white/5 border-white/10'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/40 text-xs">{c.label}</p>
                  <span className="text-lg text-white/20">{c.icon}</span>
                </div>
                <p className="text-2xl font-bold text-white tracking-tight">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-2 bg-[#13131a] border border-white/5 rounded-2xl p-6">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-4">Limite anual MEI</p>
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-36 h-36">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke={corBarra} strokeWidth="3"
                      strokeDasharray={`${percentual} ${100 - percentual}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">{percentual.toFixed(0)}%</span>
                    <span className="text-white/30 text-xs">utilizado</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Faturado', value: formatarMoeda(resumo?.receita_acumulada ?? 0) },
                  { label: 'Limite', value: formatarMoeda(resumo?.limite_anual ?? 81000) },
                  { label: 'Disponível', value: formatarMoeda(resumo?.saldo_disponivel ?? 81000), color: corBarra },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between text-xs">
                    <span className="text-white/40">{r.label}</span>
                    <span style={r.color ? { color: r.color } : {}} className={r.color ? '' : 'text-white/70'}>{r.value}</span>
                  </div>
                ))}
              </div>
              {dasPendentes.length > 0 && (
                <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                  <p className="text-amber-400 text-xs font-medium">⚠ {dasPendentes.length} DAS pendente{dasPendentes.length > 1 ? 's' : ''}</p>
                  <p className="text-amber-400/60 text-xs mt-0.5">Regularize para evitar multas</p>
                </div>
              )}
            </div>

            <div className="col-span-3 bg-[#13131a] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-white/40 text-xs uppercase tracking-widest">Últimos lançamentos</p>
                <Link href="/dashboard/lancamentos" className="text-violet-400 text-xs hover:text-violet-300 transition-colors">Ver todos →</Link>
              </div>
              {ultimos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/20 text-sm">Nenhum lançamento ainda.</p>
                  <Link href="/dashboard/lancamentos/novo" className="inline-block mt-3 text-violet-400 text-sm hover:text-violet-300">Registrar primeiro lançamento →</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {ultimos.map((l) => (
                    <div key={l.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${l.tipo === 'receita' ? 'bg-emerald-500/15 text-emerald-400' : l.tipo === 'despesa' ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'}`}>
                          {l.tipo === 'receita' ? '↑' : l.tipo === 'despesa' ? '↓' : 'D'}
                        </div>
                        <div>
                          <p className="text-white/80 text-sm">{l.descricao}</p>
                          <p className="text-white/30 text-xs">{formatarData(l.data)}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${l.tipo === 'receita' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {l.tipo === 'receita' ? '+' : '-'}{formatarMoeda(l.valor)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/dashboard/lancamentos/novo" className="mt-4 w-full flex items-center justify-center gap-2 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/20 text-violet-300 text-sm py-2.5 rounded-xl transition-all">
                <span>+</span> Novo lançamento
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
