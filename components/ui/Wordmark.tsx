/**
 * Live-text "MAISON de BUILD" wordmark in the brand serif (EB Garamond),
 * replacing the old flat PNG lockup which blurred at small sizes. MAISON
 * and BUILD are upright; "de" is the italic connector, matching the logo.
 */
export default function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`font-editorial not-italic leading-none ${className ?? ""}`}>
      <span className="tracking-[0.06em]">MAISON</span>
      <span className="italic font-medium tracking-normal"> de </span>
      <span className="tracking-[0.06em]">BUILD</span>
    </span>
  );
}
