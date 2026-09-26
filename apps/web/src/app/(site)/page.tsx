import { Hero } from '../../components/sections/hero';
import { QuickShop } from '../../components/sections/quick-shop';
import { BestSellers } from '../../components/sections/best-sellers';
import { ShopByConcern } from '../../components/sections/shop-by-concern';
import { WhyProlific } from '../../components/sections/why-prolific';
import { RoutineBuilder } from '../../components/sections/routine-builder';
import { NewArrivals } from '../../components/sections/new-arrivals';
import { Trust } from '../../components/sections/trust';

export default function Home() {
  return (
    <>
      <Hero />
      <QuickShop />
      <BestSellers />
      <ShopByConcern />
      <WhyProlific />
      <RoutineBuilder />
      <NewArrivals />
      <Trust />
    </>
  );
}
