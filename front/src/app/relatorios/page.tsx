"use client"

import * as React from "react"
import { BarChart3, PieChart, LineChart, Download } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/layout/site-header"
import { AreaAvaliacao } from "@/types"
import { Progress } from "@/components/ui/progress"

export default function RelatoriosPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold">Relatórios e Estatísticas</h1>
            <Button>
              <Download className="w-5 h-5 mr-2" />
              Exportar Dados
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold">Desempenho por Área</CardTitle>
                <PieChart className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.values(AreaAvaliacao).map((area) => (
                    <div key={area} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{area}</span>
                        <span className="text-sm font-medium">75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold">Evolução Temporal</CardTitle>
                <LineChart className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Gráfico de evolução temporal
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold">Distribuição de Notas</CardTitle>
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Histograma de distribuição de notas
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Estatísticas Gerais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <StatisticItem label="Média Geral" value="7.8" />
                  <StatisticItem label="Desvio Padrão" value="1.2" />
                  <StatisticItem label="Taxa de Aprovação" value="85%" />
                  <StatisticItem label="Participação" value="92%" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

interface StatisticItemProps {
  label: string
  value: string
}

function StatisticItem({ label, value }: Readonly<StatisticItemProps>) {
  return (
    <div className="flex justify-between items-center border-b pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

