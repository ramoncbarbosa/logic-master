import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-3xl font-bold">Página não encontrada</h1>
      <p className="text-muted-foreground">O endereço acessado não existe.</p>
      <Button asChild>
        <Link to="/">Voltar ao início</Link>
      </Button>
    </div>
  )
}
