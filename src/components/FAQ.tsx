import { Card } from './Card'

type Item = { q: string; a: string }

const ITEMS: Item[] = [
  {
    q: 'Is this just another AI tool?',
    a: 'No. This is sales performance replay. The point is not advice. The point is seeing the exact moment and correcting the move.',
  },
  {
    q: 'Who is this to judge my sales?',
    a: 'It is not grading you. It is showing you the pressure moment you could not see while you were in the call.',
  },
  {
    q: 'My situation is different',
    a: 'The words are different. The breakdowns repeat: confidence drops, control shifts, pressure enters, the buyer pulls back.',
  },
  {
    q: 'Is this just scripts?',
    a: 'No. Scripts are guesses before the call. This shows what actually happened inside your call.',
  },
]

export function FAQ() {
  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      {ITEMS.map((item) => (
        <Card
          key={item.q}
          className="p-5 sm:p-6"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f5b400]">
            {item.q}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#d1d5db]">
            {item.a}
          </p>
        </Card>
      ))}
    </div>
  )
}
