/*
  Analytics slots: GA4 + Meta Pixel.
  IDs come from env (VITE_GA4_MEASUREMENT_ID, VITE_META_PIXEL_ID).
  When unset, every call is a safe no-op.
*/

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

let initialized = false

export function initAnalytics() {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  const ga4 = import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined
  const pixel = import.meta.env.VITE_META_PIXEL_ID as string | undefined

  if (ga4) {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4}`
    document.head.appendChild(script)
    window.dataLayer = window.dataLayer || []
    window.gtag = (...args: unknown[]) => {
      window.dataLayer?.push(args)
    }
    window.gtag('js', new Date())
    window.gtag('config', ga4)
  }

  if (pixel) {
    const f = window as unknown as { fbq?: ((...args: unknown[]) => void) & { queue?: unknown[] } }
    if (!f.fbq) {
      const fbq = (...args: unknown[]) => {
        ;(fbq as unknown as { queue: unknown[] }).queue.push(args)
      }
      ;(fbq as unknown as { queue: unknown[] }).queue = []
      f.fbq = fbq as Window['fbq']
      const script = document.createElement('script')
      script.async = true
      script.src = 'https://connect.facebook.net/en_US/fbevents.js'
      document.head.appendChild(script)
    }
    window.fbq?.('init', pixel)
    window.fbq?.('track', 'PageView')
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return
  window.gtag?.('event', name, params)
  window.fbq?.('trackCustom', name, params)
}

export function trackPageView(path: string) {
  trackEvent('page_view', { page_path: path })
}
