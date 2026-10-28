import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Mail, MessageSquare, NotebookPen, Send, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { MicButton } from '@/components/MicButton'
import { useAsync } from '@/lib/hooks'
import { store } from '@/lib/store'
import { MESSAGE_TEMPLATES } from '@/lib/templates'
import { cn, timeAgo } from '@/lib/utils'
import type { MessageChannel } from '@/lib/database.types'

const CHANNEL_ICONS: Record<string, typeof MessageSquare> = {
  sms: MessageSquare,
  email: Mail,
  instagram: MessageSquare,
  messenger: MessageSquare,
  note: NotebookPen,
}

/*
  Unified inbox: SMS, email, and social-ready channels in one thread view.
  Includes the template library, voice dictation, and the AI Response
  Agent ("Draft AI Reply"): the draft lands in the composer and a human
  approves it before anything sends. Sending texts goes through Twilio
  and email through Gmail or Resend once those keys are connected; in
  demo mode messages are saved to the CRM only.
*/
export default function InboxPage() {
  const [params] = useSearchParams()
  const [selectedId, setSelectedId] = useState<string | null>(params.get('contact'))
  const [draft, setDraft] = useState('')
  const [channel, setChannel] = useState<MessageChannel>('sms')
  const [drafting, setDrafting] = useState(false)
  const [noteDraft, setNoteDraft] = useState('')

  const { data: contacts } = useAsync(() => store.listContacts())
  const { data: messages, reload } = useAsync(() => store.listMessages(), [])

  useEffect(() => {
    if (!selectedId && contacts && contacts.length) setSelectedId(contacts[0].id)
  }, [contacts, selectedId])

  const contact = useMemo(() => contacts?.find((c) => c.id === selectedId) ?? null, [contacts, selectedId])
  const thread = useMemo(
    () => (messages ?? []).filter((m) => m.contact_id === selectedId).sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [messages, selectedId]
  )
  const lastInbound = useMemo(() => [...thread].reverse().find((m) => m.direction === 'inbound'), [thread])

  function applyTemplate(key: string) {
    const template = MESSAGE_TEMPLATES.find((t) => t.key === key)
    if (!template || !contact) return
    setDraft(template.body.replaceAll('{first_name}', contact.name.split(' ')[0]))
    setChannel(template.channel)
  }

  async function onDraftAiReply() {
    if (!contact || !lastInbound) return
    setDrafting(true)
    const text = await store.draftAiReply(lastInbound, contact)
    setDraft(text)
    setDrafting(false)
  }

  async function onSend() {
    if (!contact || !draft.trim()) return
    await store.createMessage({ contact_id: contact.id, channel, direction: 'outbound', body: draft.trim() })
    setDraft('')
    reload()
  }

  async function onSaveNote() {
    if (!contact || !noteDraft.trim()) return
    await store.createMessage({ contact_id: contact.id, channel: 'note', direction: 'outbound', body: noteDraft.trim() })
    const summary = noteDraft.trim().split(/[.!?]/)[0]
    await store.updateContact(contact.id, { notes: contact.notes ? `${contact.notes}\n${summary}.` : `${summary}.` })
    setNoteDraft('')
    reload()
  }

  function summarizeNoteIntoDraft() {
    if (!contact || !noteDraft.trim()) return
    const first = contact.name.split(' ')[0]
    setDraft(`Hi ${first}, following up on our last conversation. ${noteDraft.trim()} Want me to send over the next step?`)
    setChannel('email')
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Unified inbox</h1>
      <p className="text-sm text-muted-foreground">SMS, email, and social in one thread per person.</p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit">
          <CardContent className="space-y-1 p-3">
            {(contacts ?? []).map((c) => {
              const last = [...(messages ?? [])].filter((m) => m.contact_id === c.id).sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={cn('w-full rounded-md p-3 text-left hover:bg-muted', selectedId === c.id && 'bg-primary')}
                >
                  <p className="font-semibold">{c.name}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{last ? last.body : 'No messages yet'}</p>
                  {last && <p className="text-[11px] text-muted-foreground">{timeAgo(last.created_at)}</p>}
                </button>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{contact ? contact.name : 'Pick a contact'}</span>
              {contact && <Badge variant="outline">{contact.status}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {thread.map((message) => {
                const Icon = CHANNEL_ICONS[message.channel] ?? MessageSquare
                return (
                  <div key={message.id} className={cn('flex', message.direction === 'outbound' ? 'justify-end' : 'justify-start')}>
                    <div className={cn('max-w-[85%] rounded-2xl px-4 py-3 text-sm', message.direction === 'outbound' ? 'bg-primary' : 'bg-muted')}>
                      <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        <Icon className="h-3 w-3" /> {message.channel} · {timeAgo(message.created_at)}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap">{message.body}</p>
                    </div>
                  </div>
                )
              })}
              {thread.length === 0 && <p className="text-sm text-muted-foreground">No messages in this thread yet.</p>}
            </div>

            <div className="mt-5 space-y-3 border-t pt-4">
              <div className="flex flex-wrap gap-2">
                <Select aria-label="Template" defaultValue="" onChange={(e) => applyTemplate(e.target.value)} className="w-auto flex-1 sm:flex-none">
                  <option value="" disabled>Use a template</option>
                  {MESSAGE_TEMPLATES.map((t) => (
                    <option key={t.key} value={t.key}>{t.label} ({t.channel})</option>
                  ))}
                </Select>
                <Button variant="outline" onClick={onDraftAiReply} disabled={!lastInbound || drafting}>
                  <Sparkles className="h-4 w-4 text-secondary" />
                  {drafting ? 'Drafting...' : 'Draft AI Reply'}
                </Button>
                <Select aria-label="Channel" value={channel} onChange={(e) => setChannel(e.target.value as MessageChannel)} className="w-auto">
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                  <option value="instagram">Instagram</option>
                  <option value="messenger">Messenger</option>
                </Select>
              </div>
              <div className="flex items-start gap-2">
                <Textarea rows={4} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message, pick a template, or let AI draft it. You approve before it sends." className="flex-1" />
                <MicButton onTranscript={(text) => setDraft((d) => (d ? `${d} ${text}` : text))} />
              </div>
              <Button variant="accent" onClick={onSend} disabled={!draft.trim()}>
                <Send className="h-4 w-4" /> Send
              </Button>

              <div className="rounded-md bg-muted p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Voice note to CRM</p>
                <div className="mt-2 flex items-start gap-2">
                  <Textarea rows={2} value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Dictate or type a note. Save it as a CRM note, or turn it into a follow-up draft." className="flex-1 bg-card" />
                  <MicButton onTranscript={(text) => setNoteDraft((d) => (d ? `${d} ${text}` : text))} />
                </div>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={onSaveNote} disabled={!noteDraft.trim()}>Save Note</Button>
                  <Button size="sm" variant="outline" onClick={summarizeNoteIntoDraft} disabled={!noteDraft.trim()}>Draft Follow-Up From Note</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
