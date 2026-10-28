import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth'

export default function LoginPage() {
  const { signIn, demoMode } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [working, setWorking] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setWorking(true)
    setError(null)
    const result = await signIn(email, password)
    setWorking(false)
    if (result.ok) {
      navigate('/admin/setup')
    } else {
      setError(result.error ?? 'Sign in failed.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-primary">
            <Lock className="h-5 w-5 text-secondary" />
          </div>
          <CardTitle>Owner sign in</CardTitle>
          <CardDescription>
            {demoMode
              ? 'Demo gate: credentials come from VITE_ADMIN_EMAIL and VITE_ADMIN_PASSWORD in your .env file.'
              : 'Sign in with your Supabase Auth account.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
            {error && <p className="rounded-md bg-muted p-3 text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={working}>
              {working ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
