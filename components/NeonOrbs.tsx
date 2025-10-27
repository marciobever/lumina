// components/NeonOrbs.tsx
export default function NeonOrbs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-24 -left-24 h-[380px] w-[380px] rounded-full bg-fuchsia-500/25 blur-3xl mix-blend-screen animate-pulse" />
      <div className="absolute -bottom-24 -right-24 h-[420px] w-[420px] rounded-full bg-blue-500/25 blur-3xl mix-blend-screen animate-pulse [animation-delay:150ms]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[560px] w-[560px] rounded-full bg-purple-500/20 blur-3xl mix-blend-screen animate-pulse [animation-delay:300ms]" />
    </div>
  )
}