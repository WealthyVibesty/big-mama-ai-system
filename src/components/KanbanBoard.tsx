import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatMoney } from '@/lib/utils'

export interface KanbanItem {
  id: string
  title: string
  subtitle: string
  value?: number
  stage: string
}

interface KanbanBoardProps {
  stages: { key: string; label: string }[]
  items: KanbanItem[]
  onMove: (id: string, stage: string) => void
}

/**
 * Pipeline board built for mobile first: columns snap and swipe
 * horizontally like a native app; cards move with the arrow buttons.
 */
export function KanbanBoard({ stages, items, onMove }: KanbanBoardProps) {
  return (
    <div className="snap-row no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
      {stages.map((stage, index) => {
        const column = items.filter((item) => item.stage === stage.key)
        return (
          <div key={stage.key} className="w-[270px] shrink-0">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-sm font-bold">{stage.label}</p>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">{column.length}</span>
            </div>
            <div className="space-y-2">
              {column.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-3">
                    <p className="text-sm font-semibold leading-snug">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.subtitle}</p>
                    {typeof item.value === 'number' && item.value > 0 && (
                      <p className="mt-1 text-sm font-bold text-secondary">{formatMoney(item.value)}</p>
                    )}
                    <div className="mt-2 flex justify-between">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={index === 0}
                        onClick={() => onMove(item.id, stages[index - 1].key)}
                        aria-label="Move back"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={index === stages.length - 1}
                        onClick={() => onMove(item.id, stages[index + 1].key)}
                        aria-label="Move forward"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {column.length === 0 && (
                <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">Empty</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
