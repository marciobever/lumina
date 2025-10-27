// components/Logo.tsx
type Props = { size?: string; className?: string }

export default function Logo({ size = 'text-4xl', className = '' }: Props) {
  return (
    <div className={`relative inline-block ${className}`}>
      {/* Aura de brilho real atrás da marca */}
      <div aria-hidden className="logo-aura absolute -inset-3" />
      {/* Wordmark */}
      <div className={`relative font-display font-black tracking-wide leading-none ${size}`}>
        <span className="logo-text-white">LUMI</span>
        <span className="logo-text-gradient">NA</span>
      </div>
    </div>
  )
}