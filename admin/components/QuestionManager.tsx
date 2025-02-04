'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useAuth } from './AuthProvider'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  enunciado: z.string().min(1, 'O enunciado é obrigatório'),
  alternativas: z
    .array(z.string().min(1, 'A alternativa não pode estar vazia'))
    .min(2, 'São necessárias pelo menos 2 alternativas'),
  respostaCorreta: z.number().min(0, 'Selecione a resposta correta'),
  area: z.string().min(1, 'A área é obrigatória'),
  ano: z.number().min(1900).max(new Date().getFullYear())
})

type Question = {
  id: string
  enunciado: string
  alternativas: string[]
  respostaCorreta: number
  area: string
  ano: number
  dataCriacao: string
  explicacao?: {
    explicacao: string
    revisada: boolean
  } | null
}

const areas = [
  'Matemática',
  'Português',
  'História',
  'Geografia',
  'Física',
  'Química',
  'Biologia',
  'Inglês'
]

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-api-url.com'

export default function QuestionManager() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [alternatives, setAlternatives] = useState<string[]>(['', ''])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enunciado: '',
      alternativas: ['', ''],
      respostaCorreta: 0,
      area: '',
      ano: new Date().getFullYear()
    }
  })

  useEffect(() => {
    fetchQuestions()
  }, [])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true)
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user?.token}` // Assuming you have a token in the user object
      }

      if (editingId) {
        const response = await fetch(`${API_URL}/questoes/${editingId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(values)
        })

        if (!response.ok) throw new Error('Falha ao atualizar questão')

        toast({
          title: 'Questão atualizada',
          description: 'A questão foi atualizada com sucesso.'
        })
      } else {
        const response = await fetch(`${API_URL}/questoes`, {
          method: 'POST',
          headers,
          body: JSON.stringify(values)
        })

        if (!response.ok) throw new Error('Falha ao criar questão')

        toast({
          title: 'Questão criada',
          description: 'A questão foi criada com sucesso.'
        })
      }

      fetchQuestions()
      form.reset()
      setEditingId(null)
      setAlternatives(['', ''])
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar a questão.',
        variant: 'destructive'
      })
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchQuestions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/questoes`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      })

      if (!response.ok) throw new Error('Falha ao buscar questões')

      const data = await response.json()
      setQuestions(data)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao carregar as questões.',
        variant: 'destructive'
      })
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteQuestion = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/questoes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      })

      if (!response.ok) throw new Error('Falha ao deletar questão')

      toast({
        title: 'Questão excluída',
        description: 'A questão foi excluída com sucesso.'
      })

      fetchQuestions()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao excluir a questão.',
        variant: 'destructive'
      })
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startEditing = (question: Question) => {
    setEditingId(question.id)
    setAlternatives(question.alternativas)
    form.reset({
      enunciado: question.enunciado,
      alternativas: question.alternativas,
      respostaCorreta: question.respostaCorreta,
      area: question.area,
      ano: question.ano
    })
  }

  const addAlternative = () => {
    setAlternatives([...alternatives, ''])
  }

  const removeAlternative = (index: number) => {
    if (alternatives.length > 2) {
      const newAlternatives = alternatives.filter((_, i) => i !== index)
      setAlternatives(newAlternatives)
      form.setValue('alternativas', newAlternatives)
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="enunciado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enunciado</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Digite o enunciado da questão"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormLabel>Alternativas</FormLabel>
            {alternatives.map((_, index) => (
              <div key={index} className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`alternativas.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder={`Alternativa ${index + 1}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {alternatives.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAlternative(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addAlternative}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Alternativa
            </Button>
          </div>

          <FormField
            control={form.control}
            name="respostaCorreta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resposta Correta</FormLabel>
                <Select
                  onValueChange={value => field.onChange(Number.parseInt(value))}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a resposta correta" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {alternatives.map((_, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        Alternativa {index + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="area"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Área</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a área" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {areas.map(area => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ano"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ano</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1900}
                    max={new Date().getFullYear()}
                    {...field}
                    onChange={e => field.onChange(Number.parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : editingId ? 'Atualizar Questão' : 'Adicionar Questão'}
          </Button>
        </form>
      </Form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Enunciado</TableHead>
            <TableHead>Área</TableHead>
            <TableHead>Ano</TableHead>
            <TableHead>Explicação IA</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map(question => (
            <TableRow key={question.id}>
              <TableCell className="max-w-[300px] truncate">{question.enunciado}</TableCell>
              <TableCell>{question.area}</TableCell>
              <TableCell>{question.ano}</TableCell>
              <TableCell>
                {question.explicacao ? (
                  <span
                    className={
                      question.explicacao.revisada
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-yellow-600 dark:text-yellow-400'
                    }
                  >
                    {question.explicacao.revisada ? 'Revisada' : 'Pendente'}
                  </span>
                ) : (
                  <span className="text-gray-400">Sem explicação</span>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => startEditing(question)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => deleteQuestion(question.id)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Excluir</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
