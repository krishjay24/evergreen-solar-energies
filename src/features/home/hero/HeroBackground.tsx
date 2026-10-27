/** Layered cinematic backdrop: evergreen-to-charcoal gradient, sun glow, perspective floor grid and vignette. */
export function HeroBackground() {
  return (
    <div data-hero-bg className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(120%_85%_at_50%_0%,#123e30_0%,#0b231c_38%,#0c1512_72%,#0a100e_100%)]" />

      <div data-hero-glow className="absolute inset-0">
        <div className="absolute top-[4%] left-1/2 aspect-square w-[min(70rem,140vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(240_215_124/0.16)_0%,rgb(217_182_91/0.06)_32%,transparent_62%)]" />
        <div className="absolute bottom-[4%] left-1/2 h-[42%] w-[min(64rem,120vw)] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(39_116_184/0.16),transparent)]" />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[55%] [perspective:900px]">
        <div className="absolute inset-x-[-25%] bottom-[-10%] h-full origin-bottom [transform:rotateX(68deg)] bg-[linear-gradient(rgb(247_247_240/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(247_247_240/0.05)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(60%_70%_at_50%_100%,#000_20%,transparent_75%)]" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(130%_100%_at_50%_40%,transparent_55%,rgb(9_29_24/0.85)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-canvas" />
    </div>
  )
}
