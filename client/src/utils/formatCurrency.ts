export const formatVND = (value: number) => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B ₫`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M ₫`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K ₫`;
  }
  return `${value} ₫`;
};
