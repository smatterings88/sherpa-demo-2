import { DemoFunnel } from './components/DemoFunnel'
import { Section } from './components/Section'
import { Card } from './components/Card'
import { Button } from './components/Button'
import { FAQ } from './components/FAQ'
import { QuickTestReveal } from './components/QuickTestReveal'

function scrollToDemo() {
  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
}

function scrollToSixty() {
  document.getElementById('demo-60')?.scrollIntoView({ behavior: 'smooth' })
}

function GridBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.55]"
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 47px, rgba(245,180,0,0.045) 47px, rgba(245,180,0,0.045) 48px)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 85% 55% at 50% -5%, rgba(245,180,0,0.18), transparent 58%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-12deg, transparent, transparent 40px, rgba(245,180,0,0.07) 40px, rgba(245,180,0,0.07) 41px)',
        }}
      />
    </div>
  )
}

export default function App() {
  return (
    <div className="relative min-h-svh overflow-x-hidden bg-[#0b0d10] text-[#e5e7eb]">
      <header className="relative border-b border-white/[0.08]">
        <GridBackdrop />
        <div className="relative mx-auto max-w-[1100px] px-5 pb-24 pt-20 sm:pb-32 sm:pt-28 md:pb-36 md:pt-32">
          <p className="mx-auto max-w-2xl text-center text-base italic leading-relaxed text-[#9ca3af] sm:text-lg">
            If you&apos;ve ever gotten off a call thinking, &ldquo;I had
            that…&rdquo;
          </p>
          <h1 className="mx-auto mt-10 max-w-[56rem] text-balance text-center text-[1.75rem] font-bold leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl lg:leading-[1.06]">
            You didn&apos;t lose the deal at the end.
            <br />
            You{' '}
            <span className="text-[#f5b400] [text-shadow:0_0_42px_rgba(245,180,0,0.28)]">
              lost it somewhere you didn&apos;t even notice.
            </span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-center text-base font-semibold text-[#f5b400] sm:text-lg">
            See the exact moment it slipped{'\u2014'}and what it cost you.
          </p>
          <div className="mx-auto mt-12 max-w-lg space-y-2.5 text-center text-base leading-relaxed text-[#d1d5db] sm:text-lg">
            <p>You&apos;re doing the work.</p>
            <p>The calls are happening.</p>
            <p>The deals are there.</p>
            <p className="pt-2 text-[#9ca3af]">And still… some slip.</p>
          </div>
          <div className="relative mx-auto mt-14 max-w-lg">
            <div
              className="pointer-events-none absolute -inset-x-10 -inset-y-6 rounded-3xl"
              style={{
                background:
                  'radial-gradient(closest-side at 50% 50%, rgba(245, 180, 0, 0.14), transparent 85%)',
              }}
              aria-hidden
            />
            <div className="relative flex flex-col items-center gap-5">
              <Button
                className="w-full min-w-[min(100%,17rem)] sm:w-auto"
                onClick={scrollToDemo}
              >
                Analyze My Call
              </Button>
              <button
                type="button"
                onClick={scrollToSixty}
                className="text-sm font-medium text-[#f5b400] underline-offset-4 transition-colors hover:text-[#ffc933] hover:underline sm:text-base"
              >
                Don&apos;t have a call? See how it works →
              </button>
            </div>
          </div>
        </div>
      </header>

      <Section
        title="It doesn't feel expensive… until you add it up."
        className="border-b border-white/[0.04]"
      >
        <div className="mx-auto max-w-2xl space-y-4 text-center text-base leading-relaxed text-[#9ca3af] sm:text-lg">
          <p>You don&apos;t feel it in the moment.</p>
          <p>One deal slips.</p>
          <p>Then another.</p>
          <p>Then another.</p>
          <p className="pt-2 text-[#d1d5db]">It feels like:</p>
          <p className="font-mono text-sm text-[#6b7280] sm:text-base">
            &ldquo;almost&rdquo; &nbsp;·&nbsp; &ldquo;bad timing&rdquo; &nbsp;·&nbsp;
            &ldquo;they weren&apos;t ready&rdquo;
          </p>
        </div>
        <p className="mx-auto mt-10 max-w-xl text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f5b400]">
          The math
        </p>
        <div className="mx-auto mt-4 max-w-xl">
          <Card className="border-[#f5b400]/30 bg-[#13161d] text-center">
            <p className="text-base font-medium text-white sm:text-lg">
              One $5,000 deal a week
            </p>
            <p className="mt-3 text-base text-[#f5b400] sm:text-lg">
              = $260,000 a year.
            </p>
          </Card>
        </div>
        <p className="mx-auto mt-10 max-w-xl text-center text-lg font-semibold text-white sm:text-xl">
          Gone.
        </p>
        <p className="mx-auto mt-3 max-w-xl text-center text-base leading-relaxed text-[#9ca3af] sm:text-lg">
          Not because your offer was weak.
        </p>
        <p className="mx-auto mt-1 max-w-xl text-center text-base leading-relaxed text-[#9ca3af] sm:text-lg">
          Because you missed the moment.
        </p>
      </Section>

      <Section
        title="The pressure shift"
        subtitle="It's not just what you said."
        className="border-b border-white/[0.04]"
      >
        <div className="mx-auto max-w-2xl space-y-4 text-center text-base leading-relaxed text-[#d1d5db] sm:text-lg">
          <p>Something shifts.</p>
          <p>You feel it—but you can&apos;t see it.</p>
          <p>You hesitate.</p>
          <p>You soften your ask.</p>
          <p>You explain when you should&apos;ve stayed firm.</p>
          <p className="pt-2 text-[#9ca3af]">
            Not because you&apos;re weak.
            <br />
            Because the pressure hit… and you adjusted.
          </p>
          <p className="pt-4 font-medium text-white">
            Not a strategy problem.
            <br />A moment-of-pressure problem.
          </p>
        </div>
        <p className="mx-auto mt-14 text-center text-[11px] font-medium uppercase tracking-[0.28em] text-[#f5b400]/90">
          signal · pressure detected
        </p>
      </Section>

      <Section
        title="This is where AI changes the game"
        className="border-b border-white/[0.04]"
      >
        <div className="mx-auto max-w-2xl space-y-4 text-center text-base leading-relaxed text-[#9ca3af] sm:text-lg">
          <p>
            This system was trained on real sales conversations—across
            industries, styles, and frameworks.
          </p>
          <p>Different approaches.</p>
          <p>Same breakdowns.</p>
        </div>
        <ul className="mx-auto mt-10 max-w-xl list-none space-y-3.5 pl-0 text-left text-base text-[#d1d5db] sm:text-lg">
          {[
            'Detects where confidence drops',
            'Detects where control shifts',
            'Detects where pressure enters',
            'Detects where emotion overrides logic',
          ].map((item) => (
            <li
              key={item}
              className="flex gap-3"
            >
              <span
                className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#f5b400]"
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mx-auto mt-10 max-w-2xl space-y-2 text-center text-base text-[#d1d5db] sm:text-lg">
          <p>Not opinion.</p>
          <p>Not guesswork.</p>
          <p className="font-medium text-white">
            Pattern recognition grounded in real conversations.
          </p>
        </div>
      </Section>

      <Section
        title="How this actually works"
        className="border-b border-white/[0.04]"
      >
        <div className="mx-auto max-w-2xl space-y-5 text-base leading-relaxed text-[#d1d5db] sm:text-lg">
          <p className="font-medium text-white">This wasn&apos;t built from theory.</p>
          <p className="text-[#9ca3af]">
            It was trained on real sales conversations—
            <br />
            across industries, deal sizes, and selling styles.
          </p>
          <p className="pt-1 text-[#9ca3af]">Looking for one thing:</p>
          <p className="text-xl font-bold text-white sm:text-2xl">
            Where deals actually break.
          </p>
          <p className="pt-2 text-[#9ca3af]">
            Across those conversations, the same patterns kept showing up:
          </p>
          <ul className="list-none space-y-1.5 pl-0 text-[#d1d5db]">
            <li>Confidence drops</li>
            <li>Control shifts</li>
            <li>Pressure enters</li>
            <li>The buyer pulls back</li>
          </ul>
          <p className="pt-2 text-[#9ca3af]">
            Different words.
            <br />
            Same moment.
          </p>
          <p className="pt-4 text-white">
            What you&apos;re seeing isn&apos;t advice.
          </p>
          <p className="text-[#9ca3af]">
            It&apos;s what consistently happens inside real deals—made visible.
          </p>
          <p className="pt-4 text-[#9ca3af]">
            No scripts. No guesswork. No &ldquo;try this next time.&rdquo;
          </p>
          <p className="text-white">
            Just clarity on what already happened.
          </p>
        </div>
      </Section>

      <Section
        eyebrow="Quick test"
        title="Think of your last lost deal."
        subtitle="What did they say at the end?"
        className="border-b border-white/[0.04]"
      >
        <QuickTestReveal />
      </Section>

      <section
        id="demo"
        className="scroll-mt-24 border-b border-white/[0.06] py-24 sm:py-32"
      >
        <div className="relative mx-auto max-w-[1100px] px-5">
          <div className="relative mx-auto max-w-[820px] rounded-2xl border border-white/[0.1] border-t-2 border-t-[#f5b400]/45 bg-[#080a0f] p-1.5 shadow-[0_0_72px_-28px_rgba(245,180,0,0.14),0_28px_72px_-36px_rgba(0,0,0,0.65)] sm:p-2">
            <div className="rounded-[14px] border border-white/[0.07] bg-[#0b0d10] px-5 py-12 sm:px-10 sm:py-14">
              <div className="mx-auto mb-12 max-w-[48rem] text-center">
                <h2 className="text-balance text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                  Run your last call through it
                </h2>
                <p className="mt-4 text-base font-bold tracking-wide text-[#f5b400] sm:text-lg">
                  Analyze My Call
                </p>
                <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#9ca3af] sm:text-lg">
                  Upload a transcript or recording. We&apos;ll handle the rest.
                </p>
                <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-[#d1d5db] sm:text-lg">
                  Upload your last call. We&apos;ll show you where it slipped.
                </p>
              </div>
              <DemoFunnel />
            </div>
          </div>
        </div>
      </section>

      <section
        id="demo-60"
        className="scroll-mt-24 border-b border-white/[0.04]"
      >
        <Section
          eyebrow="Demo · 60 sec"
          title="Watch a real deal break in under 60 seconds"
        >
          <div className="mx-auto max-w-2xl">
            <Card className="relative overflow-hidden border-white/[0.14] bg-[#0d1018] text-center shadow-[0_0_0_1px_rgba(245,180,0,0.08),0_24px_64px_-28px_rgba(0,0,0,0.75)]">
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#f5b400]/50 to-transparent"
                aria-hidden
              />
              <div className="relative space-y-8">
                <div className="rounded-xl border border-white/[0.08] bg-black/35 px-6 py-6 sm:px-8 sm:py-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9ca3af]">
                    Prospect
                  </p>
                  <p className="mt-3 text-lg font-medium text-white sm:text-xl">
                    &ldquo;I need to think about it.&rdquo;
                  </p>
                </div>
                <div className="flex flex-col items-center gap-6">
                  <div className="flex w-full flex-col items-center gap-3">
                    <span className="text-lg font-light text-[#f5b400]">↓</span>
                    <p className="max-w-md text-base leading-relaxed text-[#d1d5db] sm:text-lg">
                      Confidence dropped after pressure entered
                    </p>
                  </div>
                  <div className="flex w-full flex-col items-center gap-3">
                    <span className="text-lg font-light text-[#f5b400]">↓</span>
                    <p className="max-w-md text-base leading-relaxed text-[#d1d5db] sm:text-lg">
                      Control shifted
                    </p>
                  </div>
                  <div className="flex w-full flex-col items-center gap-3">
                    <span className="text-lg font-light text-[#f5b400]">↓</span>
                    <p className="max-w-md text-base leading-relaxed text-[#d1d5db] sm:text-lg">
                      Wrong response reinforced hesitation
                    </p>
                  </div>
                </div>
                <div className="pt-4">
                  <Button
                    className="w-full sm:w-auto"
                    onClick={scrollToDemo}
                  >
                    Now run your call
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </Section>
      </section>

      <Section
        title="Why this keeps happening"
        className="border-b border-white/[0.04]"
      >
        <div className="mx-auto max-w-2xl space-y-4 text-center text-base leading-relaxed text-[#d1d5db] sm:text-lg">
          <p>You get on the call.</p>
          <p>It starts strong.</p>
          <p>They&apos;re engaged.</p>
          <p className="pt-2 text-[#9ca3af]">Then something shifts.</p>
          <p>Not obvious.</p>
          <p>Not dramatic.</p>
          <p>Just… different.</p>
          <p className="pt-2">They hesitate.</p>
          <p>They slow down.</p>
          <p>They pull back.</p>
          <p className="mx-auto mt-6 max-w-md font-mono text-base text-[#6b7280] sm:text-lg">
            &ldquo;I don&apos;t know what happened…&rdquo;
          </p>
          <p className="pt-6 text-[#9ca3af]">
            You just don&apos;t see it while you&apos;re in it.
          </p>
        </div>
      </Section>

      <Section
        title={"Questions you're probably asking"}
        className="border-b border-white/[0.04]"
      >
        <FAQ />
      </Section>

      <section className="mx-auto max-w-[1100px] px-5 py-28 sm:py-32">
        <Card className="mx-auto max-w-3xl border-[#f5b400]/25 px-8 py-14 text-center shadow-[0_0_48px_-24px_rgba(245,180,0,0.12)] sm:px-12 sm:py-16">
          <h2 className="text-balance text-3xl font-bold text-white sm:text-4xl">
            You already did the call.
            <br />
            Now see what actually happened.
          </h2>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Button onClick={scrollToDemo}>Analyze My Call</Button>
            <p className="max-w-md text-sm leading-relaxed text-[#9ca3af] sm:text-base">
              Takes 2 minutes. You&apos;ll never hear your calls the same way
              again.
            </p>
          </div>
        </Card>
      </section>

      <footer className="border-t border-white/[0.08] py-14 text-center text-base text-[#6b7280]">
        <p className="font-semibold text-[#9ca3af]">Alex the Sherpa</p>
        <p className="mt-2 text-sm">© 2026</p>
      </footer>
    </div>
  )
}
