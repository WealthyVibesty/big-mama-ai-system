import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Download, Plus, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CsvImport } from '@/components/CsvImport'
import { useAsync } from '@/lib/hooks'
import { store } from '@/lib/store'
import { downloadCsv, toCsv } from '@/lib/csv'
import { timeAgo } from '@/lib/utils'
import type { ContactStatus } from '@/lib/database.types'

export default function ContactsPage() {
  const { data: contacts, reload } = useAsync(() => store.listContacts())
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ContactStatus>('all')
  const [sort, setSort] = useState<'newest' | 'name'>('newest')
  const [showAdd, setShowAdd] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', source: 'Manual entry' })

  const filtered = useMemo(() => {
    const list = (contacts ?? []).filter((c) => {
      const matchesQuery = [c.name, c.email ?? '', c.phone ?? '', c.source ?? ''].join(' ').toLowerCase().includes(query.toLowerCase())
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      return matchesQuery && matchesStatus
    })
    return sort === 'name' ? [...list].sort((a, b) => a.name.localeCompare(b.name)) : list
  }, [contacts, query, statusFilter, sort])

  async function onAdd(event: FormEvent) {
    event.preventDefault()
    await store.createContact(form)
    setForm({ name: '', email: '', phone: '', source: 'Manual entry' })
    setShowAdd(false)
    reload()
  }

  function onExport() {
    const rows = filtered.map((c) => ({
      name: c.name,
      email: c.email ?? '',
      phone: c.phone ?? '',
      source: c.source ?? '',
      status: c.status,
      tags: c.tags.join('; '),
      created_at: c.created_at,
    }))
    downloadCsv('contacts.csv', toCsv(rows, ['name', 'email', 'phone', 'source', 'status', 'tags', 'created_at']))
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Contacts</h1>
          <p className="text-sm text-muted-foreground">Every person who contacts the business, in one place.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImport((v) => !v)}>Import CSV</Button>
          <Button variant="outline" onClick={onExport}><Download className="h-4 w-4" /> Export</Button>
          <Button variant="accent" onClick={() => setShowAdd((v) => !v)}><Plus className="h-4 w-4" /> Add</Button>
        </div>
      </div>

      {showImport && (
        <Card className="mt-4">
          <CardHeader><CardTitle>Import customers</CardTitle></CardHeader>
          <CardContent><CsvImport onDone={() => reload()} /></CardContent>
        </Card>
      )}

      {showAdd && (
        <Card className="mt-4">
          <CardHeader><CardTitle>Add a contact</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={onAdd} className="grid gap-3 sm:grid-cols-2">
              <div><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Source</Label><Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></div>
              <Button type="submit" variant="accent" className="sm:col-span-2">Save Contact</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, phone, source" className="pl-9" />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="sm:w-44">
          <option value="all">All statuses</option>
          <option value="lead">Leads</option>
          <option value="customer">Customers</option>
          <option value="churned">Churned</option>
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="sm:w-44">
          <option value="newest">Newest first</option>
          <option value="name">Name A to Z</option>
        </Select>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((contact) => (
          <Card key={contact.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold">{contact.name}</p>
                <Badge variant={contact.status === 'customer' ? 'accent' : contact.status === 'churned' ? 'muted' : 'default'}>{contact.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{contact.email ?? 'No email'}</p>
              <p className="text-sm text-muted-foreground">{contact.phone ?? 'No phone'}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Source: {contact.source ?? 'Unknown'} · Last contact: {contact.last_contacted_at ? timeAgo(contact.last_contacted_at) : 'never'}
              </p>
              {contact.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {contact.tags.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              )}
              {contact.notes && <p className="mt-2 line-clamp-2 text-sm">{contact.notes}</p>}
              <div className="mt-3 flex gap-3 text-sm font-semibold">
                <Link to={`/admin/inbox?contact=${contact.id}`} className="text-link">Message</Link>
                <select
                  aria-label="Change status"
                  className="bg-transparent text-link"
                  value={contact.status}
                  onChange={async (e) => {
                    await store.updateContact(contact.id, { status: e.target.value as ContactStatus })
                    reload()
                  }}
                >
                  <option value="lead">Mark lead</option>
                  <option value="customer">Mark customer</option>
                  <option value="churned">Mark churned</option>
                </select>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No contacts match. Import a list or add the first one.</p>}
      </div>
    </div>
  )
}
