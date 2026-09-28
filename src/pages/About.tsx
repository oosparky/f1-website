import { motion } from 'framer-motion'
import { useState, type FormEvent } from 'react'
import { Icon } from '@/components/Icon'
import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'
import { instagramUrl } from '@/data/drivers'

type Errors = { name?: string; email?: string; message?: string }

const FEATURES = [
  { title: 'Interactive 3D car', body: 'Procedural 2026-spec car — drag to rotate, explore-mode scroll to zoom.' },
  { title: 'Live liveries', body: 'Four team skins swap instantly on the same geometry.' },
  { title: 'Clickable parts', body: 'Front wing, halo, engine cover, tyres and more — with tooltips.' },
  { title: 'Driver database', body: 'Career + 2026 stats, Instagram links, team/nationality filters.' },
  { title: 'Mobile fallback', body: 'Lower-poly model, lighter lighting and no reflections on phones.' },
  { title: 'Accessible & fast', body: 'Reduced-motion support, keyboard paths, code-split bundles.' },
]

export default function About() {
  const [values, setValues] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next: Errors = {}
    if (values.name.trim().length < 2) next.name = 'Please enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) next.email = 'Please enter a valid email address.'
    if (values.message.trim().length < 10) next.message = 'Tell me a little more (10+ characters).'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setStatus('sending')
    window.setTimeout(() => setStatus('sent'), 800)
  }

  return (
    <div id="top" className="relative z-10 min-h-screen px-5 pb-24 pt-32 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="03"
          as="h1"
          kicker="About"
          title="Built like a spec sheet"
          lead="APEX 26 is a demo Formula 1 website: a React + Three.js playground exploring how a motorsport site can feel like a pit garage — dark carbon surfaces, chrome highlights and a car you can actually touch."
        />

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <div className="glass h-full rounded-xl p-5">
                <span className="grid size-9 place-items-center rounded-lg bg-race-red/15 text-race-red">
                  <Icon name="check" size={16} />
                </span>
                <h3 className="mt-3 text-xl">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-fog">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_minmax(0,420px)]">
          {/* ---------------- contact ---------------- */}
          <section>
            <SectionHeading
              index="04"
              kicker="Contact"
              title="Send a message"
              lead="Questions about the build, the data, or collaboration — drop a note below."
            />

            <form onSubmit={submit} noValidate className="glass mt-8 rounded-2xl p-6">
              {status === 'sent' ? (
                <div role="status" className="py-6 text-center">
                  <span className="mx-auto grid size-12 place-items-center rounded-full bg-race-teal/15 text-race-teal">
                    <Icon name="check" size={22} />
                  </span>
                  <p className="mt-4 font-display text-3xl">Message sent</p>
                  <p className="mt-2 text-sm text-fog">
                    Thanks for reaching out — this demo form doesn’t go anywhere yet, but the
                    validation and success flow are fully wired.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setValues({ name: '', email: '', message: '' })
                      setStatus('idle')
                    }}
                    className="mt-5 rounded-xl border border-hairline px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-chalk transition hover:border-race-red hover:text-race-red"
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-mute">Name</span>
                      <input
                        id="contact-name"
                        type="text"
                        value={values.name}
                        onChange={set('name')}
                        placeholder="Your name"
                        aria-invalid={!!errors.name}
                        className="mt-2 w-full rounded-xl border border-hairline bg-carbon-950/70 px-4 py-3 text-sm text-chalk placeholder:text-mute focus:border-race-red focus:outline-none"
                      />
                      {errors.name && <p className="mt-1.5 text-xs text-race-red">{errors.name}</p>}
                    </label>

                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-mute">Email</span>
                      <input
                        id="contact-email"
                        type="email"
                        value={values.email}
                        onChange={set('email')}
                        placeholder="you@example.com"
                        aria-invalid={!!errors.email}
                        className="mt-2 w-full rounded-xl border border-hairline bg-carbon-950/70 px-4 py-3 text-sm text-chalk placeholder:text-mute focus:border-race-red focus:outline-none"
                      />
                      {errors.email && <p className="mt-1.5 text-xs text-race-red">{errors.email}</p>}
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-mute">Message</span>
                    <textarea
                      id="contact-message"
                      rows={5}
                      value={values.message}
                      onChange={set('message')}
                      placeholder="What’s on your mind?"
                      aria-invalid={!!errors.message}
                      className="mt-2 w-full resize-y rounded-xl border border-hairline bg-carbon-950/70 px-4 py-3 text-sm text-chalk placeholder:text-mute focus:border-race-red focus:outline-none"
                    />
                    {errors.message && <p className="mt-1.5 text-xs text-race-red">{errors.message}</p>}
                  </label>

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-race-red px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-carbon-950 transition hover:brightness-110 disabled:opacity-60 sm:w-auto"
                  >
                    {status === 'sending' ? 'Sending…' : 'Send message'}
                    <Icon name="arrow-right" size={16} />
                  </button>
                </div>
              )}
            </form>
          </section>

          {/* ---------------- side info ---------------- */}
          <aside className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-2xl">The stack</h3>
              <ul className="mt-3 space-y-2 text-sm text-fog">
                {[
                  'React 19 + TypeScript + Vite',
                  'Three.js via React Three Fiber + drei',
                  'Framer Motion for transitions',
                  'Tailwind CSS v4 design tokens',
                  'Self-hosted Saira Condensed + Barlow',
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-race-red" /> {t}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-2xl">Data</h3>
              <p className="mt-3 text-sm leading-relaxed text-fog">
                Standings reflect the 2026 season as of the Italian Grand Prix. Everything lives
                in <code className="rounded bg-carbon-800 px-1.5 py-0.5 text-xs text-chrome">src/data/</code> —
                edit drivers, teams, liveries or car-part copy and the whole site follows.
              </p>
            </motion.div>

            <motion.a
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              href={instagramUrl('f1')}
              target="_blank"
              rel="noreferrer noopener"
              className="glass flex items-center justify-between rounded-2xl p-6 transition hover:border-race-red/60"
            >
              <span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-mute">
                  Elsewhere
                </span>
                <span className="mt-1 block font-display text-2xl">Follow on Instagram</span>
              </span>
              <Icon name="external" size={18} className="text-race-red" />
            </motion.a>
          </aside>
        </div>
      </div>
    </div>
  )
}
