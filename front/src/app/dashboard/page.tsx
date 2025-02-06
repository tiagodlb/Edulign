"use client";

import * as React from "react";
import { BarChart3, Users, BookOpen, Clock, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/layout/site-header";
import { AreaAvaliacao } from "@/types";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-grow container mx-auto px-8 py-12 sm:py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Users className="h-4 w-4" />}
              title="Estudantes"
              value="1,234"
              description="Total de alunos cadastrados"
            />
            <StatCard
              icon={<BookOpen className="h-4 w-4" />}
              title="Questões"
              value="450"
              description="Banco de questões"
            />
            <StatCard
              icon={<Clock className="h-4 w-4" />}
              title="Simulados"
              value="25"
              description="Simulados realizados"
            />
            <StatCard
              icon={<BarChart3 className="h-4 w-4" />}
              title="Média Geral"
              value="7.8"
              description="Desempenho médio"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Próximos Simulados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <div className="flex items-center space-x-3">
                        <CalendarDays className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">Simulado {i}</h3>
                          <p className="text-sm text-muted-foreground">
                            Área: Exatas
                          </p>
                        </div>
                      </div>
                      <span className="text-primary font-medium">
                        Em 3 dias
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Desempenho por Área</CardTitle>
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
          </div>
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}

function StatCard({
  icon,
  title,
  value,
  description,
}: Readonly<StatCardProps>) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
