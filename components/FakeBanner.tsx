// components/FakeBanner.tsx
export default function FakeBanner({ text, linkText, linkHref }:{ text:string; linkText:string; linkHref:string }) {
  return (
    <div className="fake-banner">
      <div className="text-sm">{text}</div>
      <a href={linkHref} className="text-sm">{linkText}</a>
    </div>
  )
}