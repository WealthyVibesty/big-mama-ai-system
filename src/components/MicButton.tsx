import { useEffect, useRef, useState } from 'react'
import { Mic, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'

/*
  Voice dictation using the browser SpeechRecognition API.
  Transcribed text is appended through onTranscript. In the CRM the owner
  can dictate a note, then use the summary helpers on the contact page to
  turn it into a CRM note and a follow-up draft.
*/

interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
}

export function MicButton({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [listening, setListening] = useState(false)
  const recRef = useRef<SpeechRecognitionLike | null>(null)
  const supported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  useEffect(() => {
    return () => {
      recRef.current?.stop()
    }
  }, [])

  function toggle() {
    if (!supported) return
    if (listening) {
      recRef.current?.stop()
      setListening(false)
      return
    }
    const Ctor = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike })
    const Rec = Ctor.SpeechRecognition ?? Ctor.webkitSpeechRecognition
    if (!Rec) return
    const rec = new Rec()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.continuous = false
    rec.onresult = (event) => {
      const parts: string[] = []
      for (let i = 0; i < event.results.length; i++) {
        parts.push(event.results[i][0].transcript)
      }
      const text = parts.join(' ').trim()
      if (text) onTranscript(text)
    }
    rec.onend = () => setListening(false)
    recRef.current = rec
    setListening(true)
    rec.start()
  }

  if (!supported) return null
  return (
    <Button type="button" variant="outline" size="icon" onClick={toggle} title={listening ? 'Stop dictation' : 'Dictate with your voice'} aria-label="Voice dictation">
      {listening ? <Square className="h-4 w-4 text-destructive" /> : <Mic className="h-4 w-4" />}
    </Button>
  )
}
