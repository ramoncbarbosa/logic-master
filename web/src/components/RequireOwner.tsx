import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { api, type Owner } from '@/lib/api'
import { Skeleton } from './ui/skeleton'

export default function RequireOwner({ children }: { children: ReactNode }) {
  const [state, setState] = useState<'loading' | 'ok' | 'denied'>('loading')
  const location = useLocation()
  useEffect(() => {
    api
      .me()
      .then((_o: Owner) => setState('ok'))
      .catch(() => setState('denied'))
  }, [])
  if (state === 'loading') return <Skeleton className="h-64 w-full" />
  if (state === 'denied') return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  return <>{children}</>
}
