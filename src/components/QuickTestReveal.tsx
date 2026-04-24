import { useState } from 'react'
import { Card } from './Card'

export function QuickTestReveal() {
  const [open, setOpen] = useState(false)

  return (
    <div className="mx-auto max-w-xl">
      <Card className="overflow-hidden p-0">
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={open}
          className="w-full px-8 py-7 text-left transition-colors hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#f5b400] disabled:cursor-default disabled:hover:bg-transparent sm:py-8"
        >
          {!open ? (
            <span className="text-base font-medium text-[#f5b400] sm:text-lg">
              Tap to reveal what actually happened →
            </span>
          ) : (
            <div className="space-y-3 text-base leading-relaxed text-[#d1d5db] sm:text-lg">
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
