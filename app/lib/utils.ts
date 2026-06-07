// lib/utils.ts
// Funções utilitárias reutilizáveis

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export function formatarData(data: string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(data + 'T00:00:00'))
}

export function formatarCNPJ(cnpj: string): string {
  const numeros = cnpj.replace(/\D/g, '')
  return numeros.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  )
}

export function calcularPercentualLimite(
  receitaAcumulada: number,
  limiteAnual: number
): number {
  if (limiteAnual === 0) return 0
  return Math.min(100, (receitaAcumulada / limiteAnual) * 100)
}

export function corPercentual(percentual: number): string {
  if (percentual < 60) return 'text-green-600'
  if (percentual < 85) return 'text-yellow-600'
  return 'text-red-600'
}

export function corBarraProgresso(percentual: number): string {
  if (percentual < 60) return 'bg-green-500'
  if (percentual < 85) return 'bg-yellow-500'
  return 'bg-red-500'
}

export function mesCompetenciaLabel(competencia: string): string {
  // "2024-01" → "Janeiro/2024"
  const [ano, mes] = competencia.split('-')
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  return `${meses[parseInt(mes) - 1]}/${ano}`
}

export function anoAtual(): number {
  return new Date().getFullYear()
}

export function mesAtual(): number {
  return new Date().getMonth() + 1
}

export function competenciaAtual(): string {
  const mes = String(mesAtual()).padStart(2, '0')
  return `${anoAtual()}-${mes}`
}
