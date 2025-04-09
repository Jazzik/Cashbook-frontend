import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { v4 as uuidv4 } from "uuid";
import {
  ShiftData,
  Expense,
  Denominations,
  CashWithDenominations,
  emptyDenominations,
  CashReturn,
  CashDeposit,
} from "../types";
import { updateCashWithDenominations } from "../utils/calculations";

// Context interface
interface ShiftContextType {
  // State values
  initialBalance: CashWithDenominations;
  expenses: Expense[];
  cashReturns: {
    items: CashReturn[];
    total: number;
  };
  cashDeposits: {
    items: CashDeposit[];
    total: number;
  };
  terminal: number;
  terminalReturns: number;
  terminalTransfer: number;
  cashInRegister: CashWithDenominations;
  cashWithdrawal: CashWithDenominations;
  finalBalance: number;

  // State update functions
  updateInitialBalance: (denominations: Denominations) => void;
  addExpense: (name: string, amount: number) => void;
  removeExpense: (id: string) => void;
  addCashReturn: (name: string, amount: number) => void;
  removeCashReturn: (id: string) => void;
  addCashDeposit: (name: string, amount: number) => void;
  removeCashDeposit: (id: string) => void;
  updateTerminal: (amount: number) => void;
  updateTerminalReturns: (amount: number) => void;
  updateTerminalTransfer: (amount: number) => void;
  updateCashInRegister: (denominations: Denominations) => void;
  updateCashWithdrawal: (denominations: Denominations) => void;
  calculateFinalBalance: () => number;

  // Form submission
  getShiftData: () => ShiftData;
  resetShift: () => void;
}

// Create context with default values
const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

// Provider component
export const ShiftProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // State for each section of the form
  const [initialBalance, setInitialBalance] = useState<CashWithDenominations>({
    denominations: { ...emptyDenominations },
    total: 0,
  });

  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [cashReturns, setCashReturns] = useState<{
    items: CashReturn[];
    total: number;
  }>({
    items: [],
    total: 0,
  });

  const [cashDeposits, setCashDeposits] = useState<{
    items: CashDeposit[];
    total: number;
  }>({
    items: [],
    total: 0,
  });

  const [terminal, setTerminal] = useState<number>(0);
  const [terminalReturns, setTerminalReturns] = useState<number>(0);
  const [terminalTransfer, setTerminalTransfer] = useState<number>(0);

  const [cashInRegister, setCashInRegister] = useState<CashWithDenominations>({
    denominations: { ...emptyDenominations },
    total: 0,
  });

  const [cashWithdrawal, setCashWithdrawal] = useState<CashWithDenominations>({
    denominations: { ...emptyDenominations },
    total: 0,
  });

  const [finalBalance, setFinalBalance] = useState<number>(0);

  // Update functions
  const updateInitialBalance = (denominations: Denominations) => {
    setInitialBalance(updateCashWithDenominations(denominations));
  };

  const addExpense = (name: string, amount: number) => {
    setExpenses([...expenses, { id: uuidv4(), name, amount }]);
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  const addCashReturn = (name: string, amount: number) => {
    const newReturn = { id: uuidv4(), name, amount };
    const newReturns = [...cashReturns.items, newReturn];
    const newTotal = newReturns.reduce((sum, item) => sum + item.amount, 0);
    setCashReturns({
      items: newReturns,
      total: newTotal,
    });
  };

  const removeCashReturn = (id: string) => {
    const newReturns = cashReturns.items.filter((item) => item.id !== id);
    const newTotal = newReturns.reduce((sum, item) => sum + item.amount, 0);
    setCashReturns({
      items: newReturns,
      total: newTotal,
    });
  };

  const addCashDeposit = (name: string, amount: number) => {
    const newDeposit = { id: uuidv4(), name, amount };
    const newDeposits = [...cashDeposits.items, newDeposit];
    const newTotal = newDeposits.reduce((sum, item) => sum + item.amount, 0);
    setCashDeposits({
      items: newDeposits,
      total: newTotal,
    });
  };

  const removeCashDeposit = (id: string) => {
    const newDeposits = cashDeposits.items.filter((item) => item.id !== id);
    const newTotal = newDeposits.reduce((sum, item) => sum + item.amount, 0);
    setCashDeposits({
      items: newDeposits,
      total: newTotal,
    });
  };

  const updateTerminal = (amount: number) => {
    setTerminal(amount);
  };

  const updateTerminalReturns = (amount: number) => {
    setTerminalReturns(amount);
  };

  const updateTerminalTransfer = (amount: number) => {
    setTerminalTransfer(amount);
  };

  const updateCashInRegister = (denominations: Denominations) => {
    setCashInRegister(updateCashWithDenominations(denominations));
  };

  const updateCashWithdrawal = (denominations: Denominations) => {
    setCashWithdrawal(updateCashWithDenominations(denominations));
  };

  const calculateFinalBalance = useCallback(() => {
    // Конечное сальдо - это сколько денег должно остаться в кассе в конце смены
    // Рассчитывается как разница между наличными в кассе и выемкой из кассы
    // Формула максимально проста и отражает реальное положение вещей

    // Правильная формула для конечного сальдо
    let finalBalanceValue =
      cashInRegister.total - // Наличные в кассе (фактический остаток, который кассир посчитал)
      cashWithdrawal.total; // Выемка из кассы (деньги, которые забирают из кассы в конце смены)

    // Конечное сальдо не может быть отрицательным по определению -
    // невозможно забрать из кассы больше денег, чем там есть
    finalBalanceValue = Math.max(0, finalBalanceValue);

    // Don't update state inside the calculation function to avoid React errors
    // This function now just returns the calculated value
    return finalBalanceValue;
  }, [cashInRegister.total, cashWithdrawal.total]);

  // Separate function to update the final balance state - should be called in useEffect or event handlers
  const updateFinalBalance = useCallback(() => {
    const calculatedBalance = calculateFinalBalance();
    setFinalBalance(calculatedBalance);
  }, [calculateFinalBalance]);

  // Update final balance whenever any of its dependencies change
  useEffect(() => {
    updateFinalBalance();
  }, [cashInRegister.total, cashWithdrawal.total, updateFinalBalance]);

  // Get complete shift data for submission
  const getShiftData = (): ShiftData => {
    const data = {
      date: new Date().toISOString().split("T")[0],
      initialBalance,
      terminal,
      terminalReturns,
      terminalTransfer,
      cashInRegister,
      expenses,
      cashReturns,
      cashDeposits,
      cashWithdrawal,
      finalBalance: calculateFinalBalance(),
    };
    console.log("Preparing shift data:", {
      terminal,
      terminalReturns,
      terminalTransfer,
      terminalRevenue: terminal - terminalReturns + terminalTransfer,
    });
    return data;
  };

  // Reset all state to default values
  const resetShift = () => {
    setInitialBalance({
      denominations: { ...emptyDenominations },
      total: 0,
    });
    setExpenses([]);
    setCashReturns({
      items: [],
      total: 0,
    });
    setCashDeposits({
      items: [],
      total: 0,
    });
    setTerminal(0);
    setTerminalReturns(0);
    setTerminalTransfer(0);
    setCashInRegister({
      denominations: { ...emptyDenominations },
      total: 0,
    });
    setCashWithdrawal({
      denominations: { ...emptyDenominations },
      total: 0,
    });
    setFinalBalance(0);
  };

  return (
    <ShiftContext.Provider
      value={{
        initialBalance,
        expenses,
        cashReturns,
        cashDeposits,
        terminal,
        terminalReturns,
        terminalTransfer,
        cashInRegister,
        cashWithdrawal,
        finalBalance,
        updateInitialBalance,
        addExpense,
        removeExpense,
        addCashReturn,
        removeCashReturn,
        addCashDeposit,
        removeCashDeposit,
        updateTerminal,
        updateTerminalReturns,
        updateTerminalTransfer,
        updateCashInRegister,
        updateCashWithdrawal,
        calculateFinalBalance,
        getShiftData,
        resetShift,
      }}
    >
      {children}
    </ShiftContext.Provider>
  );
};

// Custom hook to use the shift context
export const useShift = () => {
  const context = useContext(ShiftContext);
  if (context === undefined) {
    throw new Error("useShift must be used within a ShiftProvider");
  }
  return context;
};
