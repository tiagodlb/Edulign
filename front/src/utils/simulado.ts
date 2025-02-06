import { Simulado } from '@/types'

export function getSimuladoStatus(
  simulado: Simulado
): 'EmPreparacao' | 'EmAndamento' | 'Finalizado' {
  if (simulado.finalizado) return 'Finalizado'
  if (simulado.dataInicio && !simulado.dataFim) return 'EmAndamento'
  return 'EmPreparacao'
}
