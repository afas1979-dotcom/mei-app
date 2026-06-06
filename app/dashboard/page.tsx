// app/dashboard/page.tsx
// Página principal do painel — Server Component

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEmpresas, getResumoFinanceiro } from '@/lib/queries/empresas'
import { getDasPendentes } from '@/lib/queries/lancamentos'
import { formatarMoeda, calcularPercentualLimite, corBarraProgresso } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const empresas = await getEmpresas()

  // Para simplificar a Fase 1, usa a primeira empresa ativa
  const empresa = empresas[0] ?? null

  const resumo = empresa ? await getResumoFinanceiro(empresa.id) : null
  const dasPendentes = empresa ? await getDasPendentes(empresa.id) : []

  const percentual = resumo
    ? calcularPercentualLimite(resumo.receita_acumulada, resumo.limite_anual)
    : 0

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Painel financeiro
          </h1>
          {empresa && (
            <p className="text-gray-500 mt-1">{empresa.razao_social}</p>
          )}
        </div>

        {!empresa ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500 mb-4">
              Nenhuma empresa cadastrada ainda.
            </p>
            <a
              href="/empresas/nova"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Cadastrar empresa MEI
            </a>
          </div>
        ) : (
          <>
            {/* Cards de resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">Receita no ano</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatarMoeda(resumo?.receita_acumulada ?? 0)}
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">Despesas no ano</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatarMoeda(resumo?.total_despesas ?? 0)}
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">DAS pendentes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dasPendentes.length}
                </p>
              </div>
            </div>

            {/* Barra de limite anual */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700">
                  Limite anual MEI
                </p>
                <p className="text-sm text-gray-500">
                  {formatarMoeda(resumo?.receita_acumulada ?? 0)} /{' '}
                  {formatarMoeda(resumo?.limite_anual ?? 81000)}
                </p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${corBarraProgresso(percentual)}`}
                  style={{ width: `${percentual}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {percentual.toFixed(1)}% utilizado — saldo:{' '}
                {formatarMoeda(resumo?.saldo_disponivel ?? 81000)}
              </p>
            </div>

            {/* Acesso rápido */}
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/lancamentos"
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 transition-colors"
              >
                <p className="font-medium text-gray-800">Lançamentos</p>
                <p className="text-sm text-gray-500 mt-1">
                  Receitas, despesas e DAS
                </p>
              </a>
              <a
                href="/lancamentos/novo"
                className="bg-blue-600 rounded-xl p-5 hover:bg-blue-700 transition-colors"
              >
                <p className="font-medium text-white">Novo lançamento</p>
                <p className="text-sm text-blue-100 mt-1">
                  Registrar receita ou despesa
                </p>
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
