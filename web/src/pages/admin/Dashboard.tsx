import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { BarChart3, ExternalLink, LogOut, Pencil, Plus, Trash2 } from 'lucide-react'
import { api, type Owner, type QuizMeta } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

export default function Dashboard() {
  const navigate = useNavigate()
  const [owner, setOwner] = useState<Owner | null>(null)
  const [quizzes, setQuizzes] = useState<QuizMeta[] | null>(null)

  const load = () => api.admin.listQuizzes().then(setQuizzes).catch((e) => toast.error(e.message))
  useEffect(() => {
    document.title = 'Painel — Logic Master'
    api.me().then(setOwner).catch(() => {})
    load()
  }, [])

  async function logout() {
    await api.logout().catch(() => {})
    navigate('/admin/login')
  }

  async function remove(q: QuizMeta) {
    try {
      await api.admin.deleteQuiz(q.id)
      toast.success('Quiz excluído')
      load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h1 className="text-3xl font-bold">Painel do professor</h1>
          {owner && <p className="text-muted-foreground">Olá, {owner.name}</p>}
        </div>
        <Button asChild>
          <Link to="/admin/quiz/novo">
            <Plus aria-hidden /> Novo quiz
          </Link>
        </Button>
        <Button variant="outline" onClick={logout}>
          <LogOut aria-hidden /> Sair
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Meus quizzes</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!quizzes ? (
            <Skeleton className="h-32 w-full" />
          ) : quizzes.length === 0 ? (
            <p className="text-muted-foreground">Nenhum quiz cadastrado. Clique em “Novo quiz”.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Questões</TableHead>
                  <TableHead className="text-right">Tentativas</TableHead>
                  <TableHead className="text-right">Média</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizzes.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.title}</TableCell>
                    <TableCell>
                      {q.published ? <Badge>Publicado</Badge> : <Badge variant="outline">Rascunho</Badge>}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{q.questionCount}</TableCell>
                    <TableCell className="text-right tabular-nums">{q.attemptCount}</TableCell>
                    <TableCell className="text-right tabular-nums">{q.avgPct == null ? '—' : `${q.avgPct.toFixed(0)}%`}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="sm" asChild>
                          <Link to={`/admin/quiz/${q.id}/dados`}>
                            <BarChart3 aria-hidden /> Dados
                          </Link>
                        </Button>
                        <Button size="icon" variant="outline" asChild>
                          <Link to={`/admin/quiz/${q.id}/editar`} aria-label={`Editar ${q.title}`}>
                            <Pencil aria-hidden />
                          </Link>
                        </Button>
                        {q.published && (
                          <Button size="icon" variant="outline" asChild>
                            <Link to={`/quiz/${q.slug}`} aria-label={`Abrir ${q.title}`}>
                              <ExternalLink aria-hidden />
                            </Link>
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="icon" variant="outline" aria-label={`Excluir ${q.title}`}>
                              <Trash2 aria-hidden />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Excluir “{q.title}”?</DialogTitle>
                              <DialogDescription>
                                O quiz, suas questões e todas as {q.attemptCount} tentativas registradas serão apagados
                                permanentemente. Esta ação não pode ser desfeita.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancelar</Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button variant="destructive" onClick={() => remove(q)}>
                                  Excluir
                                </Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
