import { BestSellers } from '../../../../components/sections/best-sellers';

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BestSellers />
    </>
  );
}