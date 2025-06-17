export function calculateCartTotals(
  items: { quantity: number; price: number }[]
): { totalQuantity: number; totalPrice: number } {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  return { totalQuantity, totalPrice };
}
