interface OrderConfirmationData {
  customerName: string;
  orderId: string;
  items: {
    productName: string;
    variantName: string;
    quantity: number;
    unitPrice: number;
  }[];
  subtotal: number;
  shippingFee: number;
  total: number;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
}

function formatNaira(value: number) {
  return `₦${value.toLocaleString()}`;
}

export function orderConfirmationTemplate(data: OrderConfirmationData): string {
  const itemRows = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e8e8e6;">
            <p style="margin: 0; font-size: 14px; color: #1d1d1f;">${item.productName}</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #71717a;">${item.variantName} × ${item.quantity}</p>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e8e8e6; text-align: right; font-size: 14px; color: #1d1d1f;">
            ${formatNaira(item.unitPrice * item.quantity)}
          </td>
        </tr>`,
    )
    .join('');

  return `
  <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #fbfbfa;">
    <div style="text-align: left; margin-bottom: 32px;">
      <span style="font-size: 20px; font-weight: 600; color: #1d1d1f;">Prolific</span><span style="font-size: 20px; font-weight: 300; color: #0f6a5b;">Store</span>
    </div>

    <h1 style="font-size: 22px; font-weight: 300; color: #1d1d1f; margin: 0 0 8px;">Order confirmed 🎉</h1>
    <p style="font-size: 14px; color: #52525b; margin: 0 0 24px;">
      Hi ${data.customerName}, thank you for your order — here's your confirmation.
    </p>

    <p style="font-size: 12px; color: #71717a; margin: 0 0 24px;">
      Order #${data.orderId.slice(0, 8).toUpperCase()}
    </p>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      ${itemRows}
    </table>

    <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #52525b;">
      <tr>
        <td style="padding: 4px 0;">Subtotal</td>
        <td style="padding: 4px 0; text-align: right;">${formatNaira(data.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0;">Shipping</td>
        <td style="padding: 4px 0; text-align: right;">${data.shippingFee === 0 ? 'Free' : formatNaira(data.shippingFee)}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0 0; border-top: 1px solid #e8e8e6; font-weight: 600; color: #1d1d1f;">Total</td>
        <td style="padding: 12px 0 0; border-top: 1px solid #e8e8e6; text-align: right; font-weight: 600; color: #1d1d1f;">${formatNaira(data.total)}</td>
      </tr>
    </table>

    <div style="margin-top: 32px; padding: 16px; background-color: #f2f5f1; border-radius: 12px;">
      <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a;">
        Delivery Address
      </p>
      <p style="margin: 0; font-size: 13px; color: #52525b; line-height: 1.6;">
        ${data.addressLine1}${data.addressLine2 ? `, ${data.addressLine2}` : ''}<br/>
        ${data.city}, ${data.state}
      </p>
    </div>

    <p style="margin-top: 32px; font-size: 12px; color: #a1a1aa; text-align: center;">
      © ${new Date().getFullYear()} Prolific Store. All rights reserved.
    </p>
  </div>`;
}
