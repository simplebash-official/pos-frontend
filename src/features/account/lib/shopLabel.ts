/** The name a person knows a shop by: its name, else its shop code. `null` when neither is known yet. */
export const shopLabel = (shop: {
  shopName: string | null;
  shopCode: string | null;
}): string | null => shop.shopName ?? shop.shopCode;
