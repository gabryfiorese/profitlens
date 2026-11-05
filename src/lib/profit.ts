/**
 * Inputs used to calculate the profitability of a sale.
 * @property itemCost The purchase cost of the item.
 * @property shippingCost The shipping cost for the sale.
 * @property packagingCost The packaging cost for the sale.
 * @property platformFeePercent The platform fee as a decimal fraction.
 * @property paymentFeePercent The payment processing fee as a decimal fraction.
 * @property paymentFixedFee The fixed payment processing fee.
 * @property taxBufferPercent The tax buffer as a decimal fraction.
 * @property salePrice The item's sale price.
 * @property targetNetProfit The desired net profit used to calculate a suggested price.
 */
export interface ProfitInput {
  itemCost: number;
  shippingCost: number;
  packagingCost: number;
  platformFeePercent: number;
  paymentFeePercent: number;
  paymentFixedFee: number;
  taxBufferPercent: number;
  salePrice: number;
  targetNetProfit?: number;
}

/**
 * Profitability metrics and pricing guidance for a sale.
 * @property totalCosts The sum of item, shipping, and packaging costs.
 * @property totalVariablePercent The combined variable fee and tax-buffer fraction.
 * @property estimatedFees The estimated variable and fixed fees.
 * @property netProfit The estimated profit after costs and fees.
 * @property margin The net profit as a fraction of the sale price.
 * @property roi The net profit as a fraction of total costs.
 * @property breakEvenPrice The sale price required to cover costs and fees.
 * @property suggestedPrice The price required to reach the target net profit, or null for invalid inputs.
 * @property isValid Whether the inputs satisfy the calculation's validity conditions.
 * @property warning A warning about the result, or null when no warning applies.
 */
export interface ProfitResult {
  totalCosts: number;
  totalVariablePercent: number;
  estimatedFees: number;
  netProfit: number;
  margin: number;
  roi: number;
  breakEvenPrice: number;
  suggestedPrice: number | null;
  isValid: boolean;
  warning: string | null;
}

/**
 * Calculates sale costs, fees, net profit, margin, ROI, break-even price, and a suggested price.
 * @param input The costs, fee rates, sale price, and optional target net profit.
 * @returns The calculated profitability metrics, pricing guidance, and input validity status.
 */
export function calculateProfit(input: ProfitInput): ProfitResult {
  const {
    itemCost,
    shippingCost,
    packagingCost,
    platformFeePercent,
    paymentFeePercent,
    paymentFixedFee,
    taxBufferPercent,
    salePrice,
    targetNetProfit = 0,
  } = input;

  const totalCosts = itemCost + shippingCost + packagingCost;
  const totalVariablePercent =
    platformFeePercent + paymentFeePercent + taxBufferPercent;

  const isValid = totalVariablePercent < 1 && salePrice >= 0;

  if (!isValid) {
    return {
      totalCosts,
      totalVariablePercent,
      estimatedFees: 0,
      netProfit: 0,
      margin: 0,
      roi: 0,
      breakEvenPrice: Infinity,
      suggestedPrice: null,
      isValid: false,
      warning:
        "Invalid inputs: variable fees must be below 100% and sale price must be non-negative.",
    };
  }

  const variableFees = salePrice * totalVariablePercent;
  const estimatedFees = variableFees + paymentFixedFee;
  const netProfit = salePrice - totalCosts - estimatedFees;
  const margin = salePrice > 0 ? netProfit / salePrice : 0;
  const roi = totalCosts > 0 ? netProfit / totalCosts : 0;

  const breakEvenPrice =
    totalCosts + paymentFixedFee > 0
      ? (totalCosts + paymentFixedFee) / (1 - totalVariablePercent)
      : 0;

  const suggestedPrice =
    (totalCosts + paymentFixedFee + targetNetProfit) /
    (1 - totalVariablePercent);

  let warning: string | null = null;
  if (netProfit < 0) {
    warning = "This sale price results in a loss.";
  } else if (margin < 0.1) {
    warning = "Margin is below 10%. Consider raising the price or cutting costs.";
  }

  return {
    totalCosts,
    totalVariablePercent,
    estimatedFees,
    netProfit,
    margin,
    roi,
    breakEvenPrice,
    suggestedPrice,
    isValid: true,
    warning,
  };
}