import { useEffect } from 'react'

interface SeoProps {
  title: string
  description: string
  path: string
}

/** Per-page SEO: title, description, canonical, OG tags. Single H1 is the page's job. */
export function Seo({ title, description, path }: SeoProps) {
  useEffect(() => {
    document.title = title
    const url = `https://wealthyvibesty.com${path}`
    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector)
      if (!el) {
        el = document.createElement('meta')
        const [name, val] = attr.split('=')
        el.setAttribute(name, val.replace(/"/g, ''))
        document.head.appendChild(el)
      }
      el.setAttribute('content', value)
    }
    setMeta('meta[name="description"]', 'name="description"', description)
    setMeta('meta[property="og:title"]', 'property="og:title"', title)
    setMeta('meta[property="og:description"]', 'property="og:description"', description)
    setMeta('meta[property="og:url"]', 'property="og:url"', url)
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)
  }, [title, description, path])
  return null
}
