import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { BarChart3, Download, ExternalLink, FileUp, LogOut, Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { api, type Owner, type QuizMeta } from '@/lib/api'
import { formatPercent } from '@/lib/format'
import { useDocumentTitle } from '@/lib/use-document-title'
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
import SusPanel from '@/components/SusPanel'

export default function Dashboard() {
  const { t, i18n } = useTranslation()
  useDocumentTitle(t('dashboard.docTitle'))
  const navigate = useNavigate()
  const [owner, setOwner] = useState<Owner | null>(null)
  const [quizzes, setQuizzes] = useState<QuizMeta[] | null>(null)

  const load = () => api.admin.listQuizzes().then(setQuizzes).catch((e) => toast.error(e.message))
  useEffect(() => {
    api.me().then(setOwner).catch(() => {})
    load()
  }, [i18n.language])

  async function logout() {
    await api.logout().catch(() => {})
    navigate('/admin/login')
  }

  const fileInput = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  async function importFile(ev: ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0]
    ev.target.value = ''
    if (!file) return
    let data: unknown
    try {
      data = JSON.parse(await file.text())
    } catch {
      return toast.error(t('dashboard.importInvalid'))
    }
    setImporting(true)
    try {
      const { id, slug } = await api.admin.importQuiz(data)
      toast.success(t('dashboard.imported', { slug }))
      navigate(`/admin/quiz/${id}/editar`)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setImporting(false)
    }
  }

  async function remove(q: QuizMeta) {
    try {
      await api.admin.deleteQuiz(q.id)
      toast.success(t('dashboard.deleted'))
      load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-auto min-w-0">
          <h1 className="text-2xl font-bold sm:text-3xl">{t('dashboard.title')}</h1>
          {owner && <p className="text-muted-foreground">{t('dashboard.hello', { name: owner.name })}</p>}
        </div>
        <Button asChild>
          <Link to="/admin/quiz/novo">
            <Plus aria-hidden /> {t('dashboard.newQuiz')}
          </Link>
        </Button>
        <Button variant="outline" onClick={() => fileInput.current?.click()} disabled={importing}>
          <FileUp aria-hidden /> {importing ? t('dashboard.importing') : t('dashboard.import')}
        </Button>
        <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={importFile} />
        <Button variant="outline" onClick={logout}>
          <LogOut aria-hidden /> {t('dashboard.logout')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t('dashboard.myQuizzes')}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!quizzes ? (
            <Skeleton className="h-32 w-full" />
          ) : quizzes.length === 0 ? (
            <p className="text-muted-foreground">{t('dashboard.empty')}</p>
          ) : (
            <>
              <ul className="divide-y md:hidden">
                {quizzes.map((q) => (
                  <li key={q.id} className="space-y-3 py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-2">
                      <p className="min-w-0 flex-1 font-medium">{q.title}</p>
                      {q.published ? <Badge>{t('dashboard.published')}</Badge> : <Badge variant="outline">{t('dashboard.draft')}</Badge>}
                    </div>
                    <dl className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-lg bg-muted/60 p-2">
                        <dt className="text-muted-foreground">{t('dashboard.colQuestions')}</dt>
                        <dd className="text-base font-semibold tabular-nums">{q.questionCount}</dd>
                      </div>
                      <div className="rounded-lg bg-muted/60 p-2">
                        <dt className="text-muted-foreground">{t('dashboard.colAttempts')}</dt>
                        <dd className="text-base font-semibold tabular-nums">{q.attemptCount}</dd>
                      </div>
                      <div className="rounded-lg bg-muted/60 p-2">
                        <dt className="text-muted-foreground">{t('dashboard.colAverage')}</dt>
                        <dd className="text-base font-semibold tabular-nums">{formatPercent(q.avgPct)}</dd>
                      </div>
                    </dl>
                    <QuizActions quiz={q} onDelete={remove} stretch />
                  </li>
                ))}
              </ul>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('dashboard.colTitle')}</TableHead>
                      <TableHead>{t('dashboard.colStatus')}</TableHead>
                      <TableHead>{t('dashboard.colLanguages')}</TableHead>
                      <TableHead className="text-right">{t('dashboard.colQuestions')}</TableHead>
                      <TableHead className="text-right">{t('dashboard.colAttempts')}</TableHead>
                      <TableHead className="text-right">{t('dashboard.colAverage')}</TableHead>
                      <TableHead className="text-right">{t('dashboard.colActions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quizzes.map((q) => (
                      <TableRow key={q.id}>
                        <TableCell className="font-medium">{q.title}</TableCell>
                        <TableCell>
                          {q.published ? <Badge>{t('dashboard.published')}</Badge> : <Badge variant="outline">{t('dashboard.draft')}</Badge>}
                        </TableCell>
                        <TableCell className="text-xs uppercase text-muted-foreground">{(q.locales ?? ['pt']).join(' · ')}</TableCell>
                        <TableCell className="text-right tabular-nums">{q.questionCount}</TableCell>
                        <TableCell className="text-right tabular-nums">{q.attemptCount}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatPercent(q.avgPct)}</TableCell>
                        <TableCell>
                          <QuizActions quiz={q} onDelete={remove} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <SusPanel title={t('sus.adminTitleAll')} description={`${t('sus.adminDescAll')} ${t('sus.adminDesc')}`} />
    </div>
  )
}

function QuizActions({ quiz: q, onDelete, stretch = false }: { quiz: QuizMeta; onDelete: (q: QuizMeta) => void; stretch?: boolean }) {
  const { t } = useTranslation()
  return (
    <div className={stretch ? 'flex gap-2' : 'flex justify-end gap-1'}>
      <Button size="sm" asChild className={stretch ? 'h-10 flex-1' : undefined}>
        <Link to={`/admin/quiz/${q.id}/dados`}>
          <BarChart3 aria-hidden /> {t('dashboard.data')}
        </Link>
      </Button>
      <Button size="icon" variant="outline" asChild className={stretch ? 'size-10' : undefined}>
        <Link to={`/admin/quiz/${q.id}/editar`} aria-label={t('dashboard.edit', { title: q.title })}>
          <Pencil aria-hidden />
        </Link>
      </Button>
      <Button size="icon" variant="outline" asChild className={stretch ? 'size-10' : undefined}>
        <a href={api.admin.exportUrl(q.id)} download={`${q.slug}.json`} aria-label={t('dashboard.export', { title: q.title })}>
          <Download aria-hidden />
        </a>
      </Button>
      {q.published && (
        <Button size="icon" variant="outline" asChild className={stretch ? 'size-10' : undefined}>
          <Link to={`/quiz/${q.slug}`} aria-label={t('dashboard.open', { title: q.title })}>
            <ExternalLink aria-hidden />
          </Link>
        </Button>
      )}
      <Dialog>
        <DialogTrigger asChild>
          <Button size="icon" variant="outline" aria-label={t('dashboard.deleteAria', { title: q.title })} className={stretch ? 'size-10' : undefined}>
            <Trash2 aria-hidden />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dashboard.deleteTitle', { title: q.title })}</DialogTitle>
            <DialogDescription>
              {t('dashboard.deleteText', { count: q.attemptCount ?? 0 })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('common.cancel')}</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="destructive" onClick={() => onDelete(q)}>
                {t('common.delete')}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
