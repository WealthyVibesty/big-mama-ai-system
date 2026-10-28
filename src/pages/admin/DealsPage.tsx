import { useAsync } from '@/lib/hooks'
import { store } from '@/lib/store'
import { DEAL_STAGES } from '@/lib/templates'
import { KanbanBoard } from '@/components/KanbanBoard'
import type { DealStage } from '@/lib/database.types'

export default function DealsPage() {
  const { data, reload } = useAsync(async () => {
    const [deals, contacts] = await Promise.all([store.listDeals(), store.listContacts()])
    return { deals, contacts }
  })

  const contactName = (id: string) => data?.contacts.find((c) => c.id === id)?.name ?? 'Contact'

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Deal pipeline</h1>
      <p className="text-sm text-muted-foreground">New Lead to Closed Won. Swipe the columns, move cards with the arrows.</p>
      <div className="mt-5">
        {data && (
          <KanbanBoard
            stages={DEAL_STAGES}
            items={data.deals.map((deal) => ({
              id: deal.id,
              title: deal.title,
              subtitle: contactName(deal.contact_id),
              value: deal.value,
              stage: deal.stage,
            }))}
            onMove={async (id, stage) => {
              await store.updateDealStage(id, stage as DealStage)
              reload()
            }}
          />
        )}
      </div>
    </div>
  )
}
