import { ProductDemo } from './_components/product-demo';
import {
  Closing,
  Hero,
  Insight,
  PitchNav,
  ProductDecisions,
  Roadmap,
  WhyMe,
  WhyNow,
} from './_components/sections';

/**
 * The founder pitch — a public, investment-memo-style page. Reads top to
 * bottom as an argument: what it is → why now → the insight → the product →
 * the decisions behind it → why me → where it goes → the ask. Public access is
 * granted in `src/lib/supabase/middleware.ts` (`/pitch`).
 */
export default function PitchPage() {
  return (
    <div className="scroll-smooth">
      <PitchNav />
      <main>
        <Hero />
        <WhyNow />
        <Insight />
        <ProductDemo />
        <ProductDecisions />
        <WhyMe />
        <Roadmap />
        <Closing />
      </main>
    </div>
  );
}
