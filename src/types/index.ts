// Cash denomination structure
export interface Denominations {
    note5000: number;
    note2000: number;
    note1000: number;
    note500: number;
    note200: number;
    note100: number;
    note50: number;
    coin10: number;
    coin5: number;
    coin2: number;
    coin1: number;
}

// Total cash with denomination breakdown
export interface CashWithDenominations {
    denominations: Denominations;
    total: number;
}

// Expense entry structure
export interface Expense {
    id: string;
    name: string;
    amount: number;
}

// Cash return entry structure
export interface CashReturn {
    id: string;
    name: string;
    amount: number;
}

// Cash deposit entry structure
export interface CashDeposit {
    id: string;
    name: string;
    amount: number;
}

// Terminal transaction structure
export interface TerminalTransaction {
    amount: number;
    returnAmount: number;
    transferAmount: number;
}

// Cash withdrawal structure
export interface CashWithdrawal {
    denominations: Denominations;
    total: number;
}

// Overall shift data structure
export interface ShiftData {
    date: string;
    initialBalance: CashWithDenominations;
    terminal: number;
    terminalReturns: number;
    terminalTransfer: number;
    cashInRegister: CashWithDenominations;
    expenses: Expense[];
    cashReturns: {
        items: CashReturn[];
        total: number;
    };
    cashDeposits: {
        items: CashDeposit[];
        total: number;
    };
    cashWithdrawal: CashWithDenominations;
    finalBalance: number;
}

// Empty denomination object for initialization
export const emptyDenominations: Denominations = {
    note5000: 0,
    note2000: 0,
    note1000: 0,
    note500: 0,
    note200: 0,
    note100: 0,
    note50: 0,
    coin10: 0,
    coin5: 0,
    coin2: 0,
    coin1: 0,
}; 