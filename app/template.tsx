// Wraps every route — gives a smooth fade/slide on each navigation.
// Uses a CSS animation (not JS) so the page is guaranteed to end fully visible
// even on heavy routes where a JS animation frame could be dropped.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-up">{children}</div>;
}
