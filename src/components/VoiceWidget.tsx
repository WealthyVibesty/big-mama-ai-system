import { useEffect } from 'react'
import { Mic } from 'lucide-react'

/*
  ElevenLabs conversational voice widget slot (bottom right).
  Renders the official embed when VITE_ELEVENLABS_AGENT_ID is set.
  When unset, renders nothing on public pages; the slot is documented in
  the README so the agent id can be dropped into .env with no code change.
*/
export function VoiceWidget() {
  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string | undefined

  useEffect(() => {
    if (!agentId) return
    const script = document.createElement('script')
    script.src = 'https://elevenlabs.io/convai-widget/index.js'
    script.async = true
    document.body.appendChild(script)
    const el = document.createElement('elevenlabs-convai')
    el.setAttribute('agent-id', agentId)
    document.body.appendChild(el)
    return () => {
      script.remove()
      el.remove()
    }
  }, [agentId])

  if (agentId) return null
  return (
    <div
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-xs text-muted-foreground shadow-md"
      title="Voice agent slot: set VITE_ELEVENLABS_AGENT_ID in .env to activate the ElevenLabs widget"
    >
      <Mic className="h-4 w-4 text-secondary" />
      Voice agent activates when the ElevenLabs agent id is added
    </div>
  )
}
