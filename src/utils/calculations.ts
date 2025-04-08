import { Denominations, CashWithDenominations } from '../types';

// Function to calculate the total amount from denominations
export function calculateTotal(denominations: Denominations): number {
    return (
        denominations.note5000 * 5000 +
        denominations.note2000 * 2000 +
        denominations.note1000 * 1000 +
        denominations.note500 * 500 +
        denominations.note200 * 200 +
        denominations.note100 * 100 +
        denominations.note50 * 50 +
        denominations.coin10 * 10 +
        denominations.coin5 * 5 +
        denominations.coin2 * 2 +
        denominations.coin1 * 1
    );
}

// Function to update denominations and calculate total
export function updateCashWithDenominations(
    denominations: Denominations
): CashWithDenominations {
    return {
        denominations,
        total: calculateTotal(denominations),
    };
}

// Function to format numbers as currency
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
} 