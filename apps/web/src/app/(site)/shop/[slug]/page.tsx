import { notFound } from 'next/navigation';
import { getProductBySlug, getProductVariants } from '../../../../lib/products';
import { ProductDetail } from '../../../../components/product-detail';
import { RelatedProducts } from '../../../../components/related-products';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const variants = await getProductVariants(product.id);

  return (
    <>
      <ProductDetail product={product} variants={variants} />
      <RelatedProducts excludeId={product.id} />
    </>
  );
}