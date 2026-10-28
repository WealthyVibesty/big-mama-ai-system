import { useMemo, useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { parseCsv } from '@/lib/csv'
import { store } from '@/lib/store'
import type { Contact } from '@/lib/database.types'

const FIELDS = ['name', 'email', 'phone', 'source', 'notes'] as const
type Field = (typeof FIELDS)[number]

/**
 * CSV import with field mapping (setup wizard step 2 and Contacts page).
 * Excel files: save as CSV first, or extend this component with SheetJS.
 */
export function CsvImport({ onDone }: { onDone?: (count: number) => void }) {
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [mapping, setMapping] = useState<Record<Field, string>>({ name: '', email: '', phone: '', source: '', notes: '' })
  const [status, setStatus] = useState<string | null>(null)
  const [working, setWorking] = useState(false)

  const headers = useMemo(() => (rows.length ? Object.keys(rows[0]) : []), [rows])

  async function onFile(file: File) {
    const text = await file.text()
    const parsed = parseCsv(text)
    setRows(parsed)
    // Best-guess mapping from header names.
    const guess = (candidates: string[]) => headers.find((h) => candidates.includes(h)) ?? parsed.length ? Object.keys(parsed[0]).find((h) => candidates.includes(h)) ?? '' : ''
    if (parsed.length) {
      const keys = Object.keys(parsed[0])
      const pick = (candidates: string[]) => keys.find((k) => candidates.includes(k)) ?? ''
      void guess
      setMapping({
        name: pick(['name', 'full name', 'contact', 'first name']),
        email: pick(['email', 'email address']),
        phone: pick(['phone', 'phone number', 'mobile']),
        source: pick(['source', 'lead source']),
        notes: pick(['notes', 'note']),
      })
    }
    setStatus(parsed.length ? `${parsed.length} rows ready. Map the fields, then import.` : 'No rows found in that file.')
  }

  async function onImport() {
    setWorking(true)
    const mapped: Partial<Contact>[] = rows.map((row) => ({
      name: mapping.name ? row[mapping.name] : row[Object.keys(row)[0]],
      email: mapping.email ? row[mapping.email] : null,
      phone: mapping.phone ? row[mapping.phone] : null,
      source: mapping.source ? row[mapping.source] : 'CSV import',
      notes: mapping.notes ? row[mapping.notes] : null,
    }))
    const count = await store.importContacts(mapped)
    setWorking(false)
    setStatus(`Imported ${count} contacts.`)
    onDone?.(count)
  }

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center hover:bg-muted">
        <Upload className="h-6 w-6 text-secondary" />
        <span className="text-sm font-medium">Choose a CSV file of your customers</span>
        <span className="text-xs text-muted-foreground">For Excel files, save as CSV first.</span>
        <input
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void onFile(file)
          }}
        />
      </label>

      {rows.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field}>
              <Label className="capitalize">{field}</Label>
              <Select value={mapping[field]} onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}>
                <option value="">Not mapped</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </Select>
            </div>
          ))}
        </div>
      )}

      {status && <p className="text-sm text-muted-foreground">{status}</p>}

      <Button onClick={onImport} disabled={!rows.length || working} variant="accent">
        {working ? 'Importing...' : 'Import Contacts'}
      </Button>
    </div>
  )
}
