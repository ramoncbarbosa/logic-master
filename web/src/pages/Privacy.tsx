import { useEffect, useState } from 'react'
import ConsentText from '@/components/ConsentText'
import { api } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'

export default function Privacy() {
  const [domains, setDomains] = useState<string[]>(['icen.ufpa.br'])
  useEffect(() => {
    document.title = 'Privacidade — Logic Master'
    api.config().then((c) => setDomains(c.allowedEmailDomains)).catch(() => {})
  }, [])
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-3xl font-bold">Aviso de privacidade</h1>
      <Card>
        <CardContent className="space-y-4">
          <ConsentText domains={domains} />
          <p className="text-sm">
            <strong>Segurança:</strong> conexão HTTPS, senhas do professor armazenadas com hash PBKDF2, sessão em cookie
            HttpOnly, limitação de requisições por IP e banco de dados acessível apenas pelo servidor.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
