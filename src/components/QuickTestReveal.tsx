import { useState } from 'react'
import { Card } from './Card'

export function QuickTestReveal() {
  const [open, setOpen] = useState(false)

  return (
    <div className="mx-auto max-w-xl">
      <Card className="p-0 overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={open}
          className="w-full px-6 py-5 text-left transition-colors hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#f5b400] disabled:cursor-default disabled:hover:bg-transparent"
        >
          {!open ? (
            <span className="text-sm font-medium text-[#f5b400]">
              Tap to reveal what actually happened →
            </span>
          ) : (
            <div className="space-y-3 text-sm leading-relaxed text-[#d1d5db]">
              <p>
                It probably didn&apos;t die at the final no.
                <br />
                It likely slipped when pressure entered and control shifted.
              </p>
            </div>
          )}
        </button>
      </Card>
    </div>
  )
}
