import { addDays, format } from 'date-fns';

export type CreditOption = 'A' | 'B' | 'C';

export interface AmortizationRow {
  installmentNumber: number;
  date: string;
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

/**
 * Calculates interest for Option B (20% until day 15, then 30% jump)
 */
export const calculateOptionBInterest = (amount: number, days: number): number => {
  if (days <= 15) {
    return amount * 0.20;
  }
  // If it jumps, it's 30% total or just for the period? 
  // User said: "vencimento 30 dias juros 30%... opcao B ate dia 15 juros de 20% apartir de dia 16 juros 30%"
  // This implies if you pass day 15, the rate for the whole term or just the period?
  // Usually in microcredit, it's 30% for the full 30 days if you go over the promo period.
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
 * Frequency 'weekly': Total 30% interest flat, split across X periods (usually 4 weeks).
 * Frequency 'monthly': 30% interest recapitalized on remaining balance.
 */
export const generateAmortizationPlan = (
  principal: number,
  count: number,
  frequency: 'weekly' | 'monthly' = 'monthly',
  startDate: Date = new Date()
): AmortizationRow[] => {
  const plan: AmortizationRow[] = [];
  let remainingBalance = principal;

  if (frequency === 'weekly') {
    // Option A behavior: Total interest is 30% of principal.
    // "Semanais... valor estipulado... 1000 MT + 30% = 1300 / 4"
    const totalInterest = principal * 0.30;
    const totalToPay = principal + totalInterest;
    const perPeriod = totalToPay / count;
    const principalPerPeriod = principal / count;
    const interestPerPeriod = totalInterest / count;

    for (let i = 1; i <= count; i++) {
      plan.push({
        installmentNumber: i,
        date: format(addDays(startDate, i * 7), 'yyyy-MM-dd'),
        principal: principalPerPeriod,
        interest: interestPerPeriod,
        total: perPeriod,
        remainingBalance: Math.max(0, remainingBalance - principalPerPeriod)
      });
      remainingBalance -= principalPerPeriod;
    }
  } else {
    // Option B/C behavior: FIXED Interest based on initial principal (Equal Installments)
    const monthlyRate = 0.30;
    const totalInterest = principal * monthlyRate * count;
    const totalToPay = principal + totalInterest;
    const perPeriod = totalToPay / count;
    const principalPerPeriod = principal / count;
    const interestPerPeriod = totalInterest / count;

    for (let i = 1; i <= count; i++) {
      plan.push({
        installmentNumber: i,
        date: format(addDays(startDate, i * 30), 'yyyy-MM-dd'),
        principal: principalPerPeriod,
        interest: interestPerPeriod,
        total: perPeriod,
        remainingBalance: Math.max(0, remainingBalance - principalPerPeriod)
      });

      remainingBalance -= principalPerPeriod;
    }
  }

  return plan;
};

/**
 * Main simulation function - Intelligent Edition 2.0
 */
export const simulateCredit = (
  amount: number,
  days: number,
  option: CreditOption | undefined,
  isInstallment: boolean,
  installmentCount: number = 1
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
    if (autoOption === 'A') {
      // Option A: Weekly installments (Fixed 30% total)
      installments = generateAmortizationPlan(amount, installmentCount, 'weekly');
    } else {
      // Option B/C: Monthly installments (30% Monthly Recapitalization)
      installments = generateAmortizationPlan(amount, installmentCount, 'monthly');
    }
    totalInterest = installments.reduce((acc, row) => acc + row.interest, 0);
    totalToPay = amount + totalInterest;
  } else {
    // Single payment
    totalInterest = amount * baseInterestRate;
    totalToPay = amount + totalInterest;

    installments = [{
      installmentNumber: 1,
      date: format(addDays(new Date(), days), 'yyyy-MM-dd'),
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
  if (amount <= 4000) return 4; // 4 weeks
  if (amount >= 5000 && amount <= 9000) return 2; // 2 months
  if (amount >= 10000 && amount <= 50000) return 3; // 3 months
  if (amount >= 51000) return 6; // 6 months
  return 1;
};
