// Branded HTML templates for the 3-email welcome sequence (7 days).
// Brand colors: primary #CFC8D8, secondary #7F54B3, accent #958E09,
// background #F9F9F9, text #111111. Light theme only.

const shell = (title: string, body: string) => `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#F9F9F9;font-family:Arial,Helvetica,sans-serif;color:#111111;">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <p style="font-weight:800;font-size:18px;margin:0 0 4px;">Wealthy Vibes Ty</p>
      <p style="color:#7F54B3;font-weight:700;margin:0 0 24px;">AI Systems for the Modern Entrepreneur</p>
      <h1 style="font-size:24px;line-height:1.25;margin:0 0 16px;">${title}</h1>
      ${body}
      <p style="margin:32px 0 0;font-size:14px;">Tyler McGregory<br/>AI Business Architect, Wealthy Vibes Ty</p>
      <p style="margin:24px 0 0;font-size:12px;color:#55524e;">
        You are getting this because you asked for The AI Workflow Map.
        <a href="{{unsubscribe_url}}" style="color:#958E09;">Unsubscribe</a>
      </p>
    </div>
  </body>
</html>`

const p = (text: string) => `<p style="font-size:16px;line-height:1.6;margin:0 0 14px;">${text}</p>`
const cta = (href: string, label: string) =>
  `<p style="margin:20px 0;"><a href="${href}" style="background:#958E09;color:#F9F9F9;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:700;">${label}</a></p>`

export interface WelcomeEmail {
  subject: string
  html: string
  /** Days after opt-in when this email sends. */
  delayDays: number
}

export function welcomeSequence(firstName: string, siteUrl: string): WelcomeEmail[] {
  return [
    {
      delayDays: 0,
      subject: 'Your AI Workflow Map is here',
      html: shell(
        `Here is your map, ${firstName}`,
        p('You asked for the first workflows your business should hand off. The AI Workflow Map is attached and linked below: the 5-day edition, one workflow per day, in the order that gives you time back fastest.') +
          cta(`${siteUrl}/products/lead_magnet.md`, 'Read The AI Workflow Map') +
          p('Start with Day 1. Follow-up that never forgets is the fastest win in the whole system.'),
      ),
    },
    {
      delayDays: 3,
      subject: 'The work your second brain does first',
      html: shell(
        'It is not the tools. It is the order.',
        p('Most owners buy AI tools and still do the work by hand, because nothing is connected and nothing knows their voice.') +
          p('A second brain starts with identity: your voice, your offers, your brand rules written down once. Then follow-up, content, and booking plug into it and run. That order is the whole difference.') +
          p('If you want the foundation built for you, the Brand Starter Kit has your voice profile, identity sheet, and first calendar ready to go.'),
      ),
    },
    {
      delayDays: 7,
      subject: 'Want it installed for you?',
      html: shell(
        'One call. We map your first system.',
        p('You have had the map for a week. If the computer work is still eating your days, that is the signal.') +
          p('On a short call we look at your follow-up, content, and booking, and map the first system Big Mama AI would install for you. No pitch deck. If it is not a fit, you keep the map.') +
          cta(`${siteUrl}/contact`, 'Book a Call') +
          p('The 24/7 Digital Architect comes in three levels: $97 DIY guidance, $297 we create and you post, $997 full service.'),
      ),
    },
  ]
}
