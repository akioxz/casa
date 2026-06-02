/**
 * Formats a numeric price into a standard USD currency string.
 * @param amount - The numeric price amount
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Truncates text with an ellipsis if it exceeds a specified limit.
 * Useful for product descriptions on cards.
 */
export const truncateText = (text: string, limit: number = 60): string => {
  if (text.length <= limit) return text;
  return `${text.substring(0, limit)}...`;
};
