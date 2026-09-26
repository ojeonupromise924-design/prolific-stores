interface GiftPurchasedData {
  buyerName: string;
  recipientName: string;
  productName: string;
  variantName: string;
  price: number;
  orderId: string;
}

function formatNaira(value: number) {
  return `₦${value.toLocaleString()}`;
}

export function giftPurchasedTemplate(data: GiftPurchasedData): string {
  return `
  <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background-color: #fbfbfa;">
    <div style="margin-bottom: 24px;">
      <span style="font-size: 20px; font-weight: 600; color: #1d1d1f;">Prolific</span><span style="font-size: 20px; font-weight: 300; color: #0f6a5b;">Store</span>
    </div>

    <h1 style="font-size: 22px; font-weight: 300; color: #1d1d1f; margin: 0 0 8px;">You just made someone's day 🎁</h1>
    <p style="font-size: 14px; color: #52525b; margin: 0 0 24px;">
      Hi ${data.buyerName}, thank you — you gifted <strong>${data.recipientName}</strong> something from their wishlist.
    </p>

    <div style="border: 1px solid #e8e8e6; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      <p style="margin: 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a;">
        Gift Receipt
      </p>
      <p style="margin: 12px 0 0; font-size: 15px; font-weight: 500; color: #1d1d1f;">${data.productName}</p>
      <p style="margin: 4px 0 0; font-size: 13px; color: #71717a;">${data.variantName}</p>
      <p style="margin: 8px 0 0; font-size: 15px; font-weight: 600; color: #1d1d1f;">${formatNaira(data.price)}</p>
      <p style="margin: 12px 0 0; font-size: 12px; color: #a1a1aa;">Order #${data.orderId.slice(0, 8).toUpperCase()}</p>
    </div>

    <p style="font-size: 12px; color: #a1a1aa;">
      ${data.recipientName} has been notified of your gift.
    </p>
  </div>`;
}
