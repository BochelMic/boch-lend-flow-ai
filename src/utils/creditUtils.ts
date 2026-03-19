import { addDays, format } from 'date-fns';

export type CreditOption = 'A' | 'B' | 'C';

export interface AmortizationRow {
  installmentNumber: number;
  date: string;
  balanceBefore: number;
  principal: number;
  interest: number;
  total: number;
  remainingBalance: number;
}

export interface SimulationResult {
  option: CreditOption;
  amount: number;
  totalInterest: number;
  totalToPay: number;
  interestRate: number;
  isInstallment: boolean;
  installments: AmortizationRow[];
}

export interface AmortizationLoanData {
  remaining_amount: number;
  installments: number;
  remaining_installments: number;
  amortization_plan?: AmortizationRow[];
}

/**
 * Calculates the amount to settle today with interest waiver.
 * Formula: Remaining Principal + Interest of the Current Month.
 */
export const calculateSmartSettlement = (loan: AmortizationLoanData) => {
  if (!loan.amortization_plan || loan.amortization_plan.length === 0) {
    return loan.remaining_amount;
  }

  // Determine current month index
  const paidCount = Number(loan.installments) - Number(loan.remaining_installments || 0);
  const currentIndex = paidCount + 1;

  // Remaining Principal = Sum of principal from current month to end
  const remainingPrincipal = loan.amortization_plan
    .filter(row => row.installmentNumber >= currentIndex)
    .reduce((sum, row) => sum + Number(row.principal || 0), 0);

  // Interest of the CURRENT month (fair to pay for the time elapsed)
  const currentInterest = loan.amortization_plan
    .find(row => row.installmentNumber === currentIndex)?.interest || 0;

  return Math.round(remainingPrincipal + currentInterest);
};

/**
 * Calculates interest for Option B (20% until day 15, then 30% jump)
 */
export const calculateOptionBInterest = (amount: number, days: number): number => {
  if (days <= 15) {
    return amount * 0.20;
  }
  return amount * 0.30;
};

/**
 * Automatically determines the correct tier based on amount and days.
 * Amount <= 4000 -> Option A
 * Amount >= 5000 & <= 15 days -> Option B
 * Amount >= 5000 & > 15 days -> Option C
 */
export const getBestOption = (amount: number, days: number): CreditOption => {
  if (amount <= 4000) return 'A';
  if (amount >= 5000) {
    return days <= 15 ? 'B' : 'C';
  }
  return 'A'; // Fallback
};

/**
 * Validates if an amount and term are eligible for a specific option
 * (Keeping it for backward compatibility but narrowing to intelligent selection)
 */
export const getAvailableOptions = (amount: number, days: number): CreditOption[] => {
  return [getBestOption(amount, days)];
};

/**
 * Generates an amortization plan.
 * @param principal The amount borrowed
 * @param count Number of installments
 * @param frequency 'daily' | '2-days' | '3-days' | 'weekly' | 'monthly'
 * @param customCapitalAmortizations Optional array of specific capital amounts to pay back each period
 */
export const generateAmortizationPlan = (
  principal: number,
  count: number,
  frequency: 'daily' | '2-days' | '3-days' | 'weekly' | 'monthly' = 'monthly',
  startDate: Date = new Date(),
  customCapitalAmortizations?: number[]
): AmortizationRow[] => {
  const plan: AmortizationRow[] = [];
  let remainingBalance = principal;
  const rate = 0.30; // Base monthly rate (30%)

  if (frequency !== 'monthly') {
    // Option A behavior: Total interest is FIXED 30% of principal.
    // "Semanais... valor estipulado... 1000 MT + 30% = 1300 / 4"
    const totalInterest = principal * rate;
    const totalToPay = principal + totalInterest;

    for (let i = 1; i <= count; i++) {
      let principalPerPeriod = principal / count;
      let interestPerPeriod = totalInterest / count;

      // Handle custom amortizations or force last installment remainder
      if (i === count) {
        principalPerPeriod = remainingBalance;
        // Total interest is fixed (30% of principal). 
        // We ensure interestPerPeriod is the remainder of totalInterest.
        const paidInterest = plan.reduce((acc, row) => acc + row.interest, 0);
        interestPerPeriod = totalInterest - paidInterest;
      } else if (customCapitalAmortizations && customCapitalAmortizations[i - 1] !== undefined) {
        principalPerPeriod = Math.min(customCapitalAmortizations[i - 1], remainingBalance);
        interestPerPeriod = (principalPerPeriod / principal) * totalInterest;
      }

      let daysToAdd = i * 7; // weekly
      if (frequency === 'daily') daysToAdd = i;
      if (frequency === '2-days') daysToAdd = i * 2;
      if (frequency === '3-days') daysToAdd = i * 3;

      plan.push({
        installmentNumber: i,
        date: format(addDays(startDate, daysToAdd), 'yyyy-MM-dd'),
        balanceBefore: remainingBalance,
        principal: principalPerPeriod,
        interest: interestPerPeriod,
        total: principalPerPeriod + interestPerPeriod,
        remainingBalance: Math.max(0, remainingBalance - principalPerPeriod)
      });
      remainingBalance -= principalPerPeriod;
    }
  } else {
    // Option B/C/D behavior: Interest on REMAINING BALANCE (Price Formula or Custom)
    const pmt = principal * (rate * Math.pow(1 + rate, count)) / (Math.pow(1 + rate, count) - 1);

    for (let i = 1; i <= count; i++) {
      const interestForPeriod = remainingBalance * rate;
      let principalForPeriod: number;

      if (i === count) {
        // Last installment MUST clear the debt
        principalForPeriod = remainingBalance;
      } else if (customCapitalAmortizations && customCapitalAmortizations[i - 1] !== undefined) {
        // User explicitly chose how much capital to pay (capped at remaining)
        principalForPeriod = Math.min(customCapitalAmortizations[i - 1], remainingBalance);
      } else {
        // Use Price Formula to determine principal for this period
        principalForPeriod = pmt - interestForPeriod;
      }

      const totalForPeriod = principalForPeriod + interestForPeriod;

      plan.push({
        installmentNumber: i,
        date: format(addDays(startDate, i * 30), 'yyyy-MM-dd'),
        balanceBefore: remainingBalance,
        principal: principalForPeriod,
        interest: interestForPeriod,
        total: totalForPeriod,
        remainingBalance: Math.max(0, remainingBalance - principalForPeriod)
      });

      remainingBalance -= principalForPeriod;
    }
  }

  return plan;
};

/**
 * Main simulation function - Intelligent Edition 3.0 (Guardian Optimized)
 */
export const simulateCredit = (
  amount: number,
  days: number,
  option: CreditOption | undefined,
  isInstallment: boolean,
  installmentCount: number = 1,
  frequency: 'daily' | '2-days' | '3-days' | 'weekly' | 'monthly' = 'monthly',
  customAmortizations?: number[]
): SimulationResult => {
  const autoOption = getBestOption(amount, days);

  let baseInterestRate = 0.30;
  if (autoOption === 'B' && days <= 15) {
    baseInterestRate = 0.20;
  }

  let totalInterest = 0;
  let installments: AmortizationRow[] = [];
  let totalToPay = 0;

  if (isInstallment && installmentCount > 1) {
    // Pass the frequency to the plan generator
    installments = generateAmortizationPlan(amount, installmentCount, frequency, new Date(), customAmortizations);
    totalInterest = installments.reduce((acc, row) => acc + row.interest, 0);
    totalToPay = amount + totalInterest;
  } else {
    // Single payment logic
    totalInterest = amount * baseInterestRate;
    totalToPay = amount + totalInterest;

    installments = [{
      installmentNumber: 1,
      date: format(addDays(new Date(), days), 'yyyy-MM-dd'),
      balanceBefore: amount, // For single payment, balanceBefore is the principal
      principal: amount,
      interest: totalInterest,
      total: totalToPay,
      remainingBalance: 0
    }];
  }

  return {
    option: autoOption,
    amount,
    totalInterest,
    totalToPay,
    interestRate: baseInterestRate * 100,
    isInstallment,
    installments
  };
};

export const getInstallmentLimits = (amount: number): number => {
  if (amount <= 4000) return 30; // Up to 30 days (daily)
  if (amount >= 5000 && amount <= 9000) return 2; // 2 months
  if (amount >= 10000 && amount <= 50000) return 4; // 4 months
  if (amount >= 51000) return 6; // 6 months
  return 1;
};
