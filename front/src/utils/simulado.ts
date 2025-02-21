// utils/simulado.ts
export function getSimuladoStatus({
  finalizado,
  dataInicio,
  dataFim
}: {
  finalizado: boolean
  dataInicio: string
  dataFim: string | null
}): 'EmPreparacao' | 'EmAndamento' | 'Finalizado' {
  console.log(dataFim)
  if (finalizado) return 'Finalizado'
  if (new Date(dataInicio) > new Date()) return 'EmPreparacao'
  return 'EmAndamento'
}
