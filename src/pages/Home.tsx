import { Button } from '../components/Button'

export function Home() {
  return (
    <div className="mx-auto max-w-[900px] px-5 py-24 sm:py-28">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9ca3af]">
        Alex the Sherpa
      </p>
      <h1 className="mt-6 text-balance text-3xl font-bold leading-tight text-white sm:text-4xl">
        Sales performance replay
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#9ca3af] sm:text-lg">
        The public funnel lives in GoHighLevel. Submit a call from the funnel to
        open your replay room.
      </p>
      <div className="mt-10">
        <Button
          variant="secondary"
          onClick={() => {
            window.location.href = '/demo-review'
          }}
        >
          Open demo-review
        </Button>
      </div>
    </div>
  )
}

