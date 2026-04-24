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
      className="pointer-events-none absolute inset-0 opacity-[0.45]"
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(245,180,0,0.14), transparent 55%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-12deg, transparent, transparent 38px, rgba(245,180,0,0.06) 38px, rgba(245,180,0,0.06) 39px)',
        }}
      />
    </div>
  )
}

export default function App() {
  return (
    <div className="relative min-h-svh overflow-x-hidden bg-[#0b0d10] text-[#e5e7eb]">
      <header className="relative border-b border-white/[0.06]">
        <GridBackdrop />
        <div className="relative mx-auto max-w-[1100px] px-5 pb-20 pt-16 sm:pb-28 sm:pt-24">
          <p className="mx-auto max-w-2xl text-center text-sm italic leading-relaxed text-[#9ca3af] sm:text-base">
            If you&apos;ve ever gotten off a call thinking, &ldquo;I had
            that…&rdquo;
          </p>
          <h1 className="mx-auto mt-8 max-w-4xl text-balance text-center text-[1.65rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-4xl md:text-5xl md:leading-[1.08]">
            You didn&apos;t lose the deal at the end.
            <br />
            You lost it somewhere you didn&apos;t even notice.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-center text-sm font-medium text-[#f5b400] sm:text-base">
            See the exact moment it slipped{'\u2014'}and what it cost you.
          </p>
          <div className="mx-auto mt-10 max-w-md space-y-2 text-center text-sm leading-relaxed text-[#d1d5db] sm:text-[15px]">
            <p>You&apos;re doing the work.</p>
            <p>The calls are happening.</p>
            <p>The deals are there.</p>
            <p className="pt-2 text-[#9ca3af]">And still… some slip.</p>
          </div>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Button
              className="w-full max-w-xs sm:w-auto"
              onClick={scrollToDemo}
            >
              Analyze My Call
            </Button>
            <button
              type="button"
              onClick={scrollToSixty}
              className="text-xs font-medium text-[#f5b400] underline-offset-4 transition-colors hover:text-[#ffc933] hover:underline sm:text-sm"
            >
              Don&apos;t have a call? See how it works →
            </button>
          </div>
        </div>
      </header>

      <Section
        title="It doesn't feel expensive… until you add it up."
        className="border-b border-white/[0.04]"
      >
        <div className="mx-auto max-w-2xl space-y-4 text-center text-sm leading-relaxed text-[#9ca3af] sm:text-[15px]">
          <p>You don&apos;t feel it in the moment.</p>
          <p>One deal slips.</p>
          <p>Then another.</p>
          <p>Then another.</p>
          <p className="pt-2 text-[#d1d5db]">It feels like:</p>
          <p className="font-mono text-xs text-[#6b7280] sm:text-sm">
            &ldquo;almost&rdquo; &nbsp;·&nbsp; &ldquo;bad timing&rdquo; &nbsp;·&nbsp;
            &ldquo;they weren&apos;t ready&rdquo;
          </p>
        </div>
        <p className="mx-auto mt-10 max-w-xl text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#f5b400]">
          The math
        </p>
        <div className="mx-auto mt-4 max-w-xl">
          <Card className="border-[#f5b400]/25 bg-[#13161d] text-center">
            <p className="text-sm font-medium text-white">
              One $5,000 deal a week
            </p>
            <p className="mt-3 text-sm text-[#f5b400]">= $260,000 a year.</p>
          </Card>
        </div>
        <p className="mx-auto mt-10 max-w-xl text-center text-sm font-medium text-white">
          Gone.
        </p>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-[#9ca3af]">
          Not because your offer was weak.
        </p>
        <p className="mx-auto mt-1 max-w-xl text-center text-sm leading-relaxed text-[#9ca3af]">
          Because you missed the moment.
        </p>
      </Section>

      <Section
        title="The pressure shift"
        subtitle="It's not just what you said."
        className="border-b border-white/[0.04]"
      >
        <div className="mx-auto max-w-2xl space-y-4 text-center text-sm leading-relaxed text-[#d1d5db] sm:text-[15px]">
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
        <p className="mx-auto mt-12 text-center text-[10px] font-medium uppercase tracking-[0.28em] text-[#f5b400]/80">
          signal · pressure detected
        </p>
      </Section>

      <Section
        title="This is where AI changes the game"
        className="border-b border-white/[0.04]"
      >
        <div className="mx-auto max-w-2xl space-y-4 text-center text-sm leading-relaxed text-[#9ca3af] sm:text-[15px]">
          <p>
            This system was trained on real sales conversations—across
            industries, styles, and frameworks.
          </p>
          <p>Different approaches.</p>
          <p>Same breakdowns.</p>
        </div>
        <ul className="mx-auto mt-10 max-w-xl list-none space-y-3 pl-0 text-left text-sm text-[#d1d5db] sm:text-[15px]">
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
        <div className="mx-auto mt-10 max-w-2xl space-y-2 text-center text-sm text-[#d1d5db]">
          <p>Not opinion.</p>
          <p>Not guesswork.</p>
          <p className="text-white">
            Pattern recognition grounded in real conversations.
          </p>
        </div>
      </Section>

      <Section
        title="How this actually works"
        className="border-b border-white/[0.04]"
      >
        <div className="mx-auto max-w-2xl space-y-5 text-sm leading-relaxed text-[#d1d5db] sm:text-[15px]">
          <p className="text-white">This wasn&apos;t built from theory.</p>
          <p className="text-[#9ca3af]">
            It was trained on real sales conversations—
            <br />
            across industries, deal sizes, and selling styles.
          </p>
          <p className="pt-1 text-[#9ca3af]">Looking for one thing:</p>
          <p className="text-lg font-semibold text-white">
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
        className="scroll-mt-24 border-b border-white/[0.04] py-14 sm:py-20"
      >
        <div className="relative mx-auto max-w-[1100px] px-5">
          <div className="mx-auto mb-10 max-w-[760px] text-center">
            <h2 className="text-balance text-2xl font-semibold text-white sm:text-3xl md:text-4xl">
              Run your last call through it
            </h2>
            <p className="mt-3 text-sm font-semibold text-[#f5b400] sm:text-base">
              Analyze My Call
            </p>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#9ca3af]">
              Upload a transcript or recording. We&apos;ll handle the rest.
            </p>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-[#d1d5db]">
              Upload your last call. We&apos;ll show you where it slipped.
            </p>
          </div>
          <DemoFunnel />
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
          <div className="mx-auto max-w-lg">
            <Card className="space-y-6 text-center">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9ca3af]">
                  Prospect
                </p>
                <p className="mt-2 text-base text-white">
                  &ldquo;I need to think about it.&rdquo;
                </p>
              </div>
              <p className="text-xs text-[#f5b400]">↓</p>
              <p className="text-sm text-[#d1d5db]">
                Confidence dropped after pressure entered
              </p>
              <p className="text-xs text-[#f5b400]">↓</p>
              <p className="text-sm text-[#d1d5db]">Control shifted</p>
              <p className="text-xs text-[#f5b400]">↓</p>
              <p className="text-sm text-[#d1d5db]">
                Wrong response reinforced hesitation
              </p>
              <div className="pt-2">
                <Button
                  className="w-full sm:w-auto"
                  onClick={scrollToDemo}
                >
                  Now run your call
                </Button>
              </div>
            </Card>
          </div>
        </Section>
      </section>

      <Section
        title="Why this keeps happening"
        className="border-b border-white/[0.04]"
      >
        <div className="mx-auto max-w-2xl space-y-4 text-center text-sm leading-relaxed text-[#d1d5db] sm:text-[15px]">
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
          <p className="mx-auto mt-6 max-w-md font-mono text-sm text-[#6b7280]">
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

      <section className="mx-auto max-w-[1100px] px-5 py-20 sm:py-24">
        <Card className="mx-auto max-w-3xl border-[#f5b400]/20 text-center">
          <h2 className="text-balance text-2xl font-semibold text-white sm:text-3xl">
            You already did the call.
            <br />
            Now see what actually happened.
          </h2>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Button onClick={scrollToDemo}>Analyze My Call</Button>
            <p className="max-w-sm text-xs leading-relaxed text-[#6b7280]">
              Takes 2 minutes. You&apos;ll never hear your calls the same way
              again.
            </p>
          </div>
        </Card>
      </section>

      <footer className="border-t border-white/[0.06] py-12 text-center text-sm text-[#6b7280]">
        <p className="font-semibold text-[#9ca3af]">Alex the Sherpa</p>
        <p className="mt-2 text-xs">© 2026</p>
      </footer>
    </div>
  )
}
