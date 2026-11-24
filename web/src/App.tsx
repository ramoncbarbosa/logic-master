import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import RequireOwner from './components/RequireOwner'
import Home from './pages/Home'
import QuizPlay from './pages/QuizPlay'
import Privacy from './pages/Privacy'
import NotFound from './pages/NotFound'
import Login from './pages/admin/Login'
import { Skeleton } from './components/ui/skeleton'

const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const QuizEditor = lazy(() => import('./pages/admin/QuizEditor'))
const QuizStats = lazy(() => import('./pages/admin/QuizStats'))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="quiz/:slug" element={<QuizPlay />} />
        <Route path="sobre" element={<Navigate to="/" replace />} />
        <Route path="privacidade" element={<Privacy />} />
        <Route path="admin/login" element={<Login />} />
        <Route
          path="admin"
          element={
            <RequireOwner>
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <Dashboard />
              </Suspense>
            </RequireOwner>
          }
        />
        <Route
          path="admin/quiz/:id/editar"
          element={
            <RequireOwner>
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <QuizEditor />
              </Suspense>
            </RequireOwner>
          }
        />
        <Route
          path="admin/quiz/novo"
          element={
            <RequireOwner>
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <QuizEditor />
              </Suspense>
            </RequireOwner>
          }
        />
        <Route
          path="admin/quiz/:id/dados"
          element={
            <RequireOwner>
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <QuizStats />
              </Suspense>
            </RequireOwner>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
