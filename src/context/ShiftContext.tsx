import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useRef,
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
  Transfer,
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
  transfers: {
    items: Transfer[];
    total: number;
  };
  cashInRegister: CashWithDenominations;
  cashWithdrawal: CashWithDenominations;
  finalBalance: number;

  // State update functions
  updateInitialBalance: (denominations: Denominations) => void;
  updateInitialBalanceTotal: (amount: number) => void;
  addExpense: (name: string, amount: number) => void;
  removeExpense: (id: string) => void;
  addTransfer: (name: string, amount: number) => void;
  removeTransfer: (id: string) => void;
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
  const STORAGE_KEY = "shiftState";
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

  const [transfers, setTransfers] = useState<{
    items: Transfer[];
    total: number;
  }>({
    items: [],
    total: 0,
  });

  const [cashInRegister, setCashInRegister] = useState<CashWithDenominations>({
    denominations: { ...emptyDenominations },
    total: 0,
  });

  const [cashWithdrawal, setCashWithdrawal] = useState<CashWithDenominations>({
    denominations: { ...emptyDenominations },
    total: 0,
  });

  const [finalBalance, setFinalBalance] = useState<number>(0);
  const hasHydratedRef = useRef(false);

  // Update functions
  const updateInitialBalance = (denominations: Denominations) => {
    setInitialBalance(updateCashWithDenominations(denominations));
  };

  const updateInitialBalanceTotal = (amount: number) => {
    setInitialBalance({
      denominations: { ...emptyDenominations },
      total: Math.max(0, Number.isFinite(amount) ? amount : 0),
    });
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
    // Allow manual override, but keep transfers total independent
    setTerminalTransfer(amount);
  };

  const addTransfer = (name: string, amount: number) => {
    const newTransfer: Transfer = {
      id: uuidv4(),
      name,
      amount,
      timestamp: new Date().toISOString(),
    };
    const newItems = [...transfers.items, newTransfer];
    const newTotal = newItems.reduce((sum, t) => sum + t.amount, 0);
    setTransfers({ items: newItems, total: newTotal });
    setTerminalTransfer(newTotal);
  };

  const removeTransfer = (id: string) => {
    const newItems = transfers.items.filter((t) => t.id !== id);
    const newTotal = newItems.reduce((sum, t) => sum + t.amount, 0);
    setTransfers({ items: newItems, total: newTotal });
    setTerminalTransfer(newTotal);
  };

  const updateCashInRegister = (denominations: Denominations) => {
    setCashInRegister(updateCashWithDenominations(denominations));
  };

  const updateCashWithdrawal = (denominations: Denominations) => {
    setCashWithdrawal(updateCashWithDenominations(denominations));
  };

  const calculateFinalBalance = useCallback(() => {
    // Конечный остаток - это сколько денег должно остаться в кассе в конце смены
    // Рассчитывается как разница между наличными в кассе и выемкой из кассы
    // Формула максимально проста и отражает реальное положение вещей

    // Правильная формула для конечного сальдо
    let finalBalanceValue =
      cashInRegister.total - // Наличные в кассе (фактический остаток, который кассир посчитал)
      cashWithdrawal.total; // Выемка из кассы (деньги, которые забирают из кассы в конце смены)

    // Конечный остаток не может быть отрицательным по определению -
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

  // Keep terminalTransfer always in sync with transfers total
  useEffect(() => {
    setTerminalTransfer(transfers.total);
  }, [transfers.total]);

  // Load saved shift state on mount
  useEffect(() => {
    try {
      const saved =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEY)
          : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          if (
            parsed.initialBalance &&
            typeof parsed.initialBalance.total === "number"
          ) {
            setInitialBalance({
              denominations: {
                ...emptyDenominations,
                ...(parsed.initialBalance.denominations || {}),
              },
              total: Number(parsed.initialBalance.total) || 0,
            });
          }
          if (Array.isArray(parsed.expenses)) {
            setExpenses(parsed.expenses);
          }
          if (parsed.cashReturns && Array.isArray(parsed.cashReturns.items)) {
            setCashReturns({
              items: parsed.cashReturns.items,
              total:
                Number(parsed.cashReturns.total) ||
                parsed.cashReturns.items.reduce(
                  (s: number, i: any) => s + Number(i.amount || 0),
                  0
                ),
            });
          }
          if (parsed.cashDeposits && Array.isArray(parsed.cashDeposits.items)) {
            setCashDeposits({
              items: parsed.cashDeposits.items,
              total:
                Number(parsed.cashDeposits.total) ||
                parsed.cashDeposits.items.reduce(
                  (s: number, i: any) => s + Number(i.amount || 0),
                  0
                ),
            });
          }
          if (typeof parsed.terminal === "number") setTerminal(parsed.terminal);
          if (typeof parsed.terminalReturns === "number")
            setTerminalReturns(parsed.terminalReturns);
          if (parsed.transfers && Array.isArray(parsed.transfers.items)) {
            const computedTotal =
              Number(parsed.transfers.total) ||
              parsed.transfers.items.reduce(
                (s: number, i: any) => s + Number(i.amount || 0),
                0
              );
            setTransfers({
              items: parsed.transfers.items,
              total: computedTotal,
            });
            setTerminalTransfer(computedTotal);
          } else if (typeof parsed.terminalTransfer === "number") {
            // Backward compatibility if no transfers stored previously
            setTerminalTransfer(parsed.terminalTransfer);
          }
          if (
            parsed.cashInRegister &&
            typeof parsed.cashInRegister.total === "number"
          ) {
            setCashInRegister({
              denominations: {
                ...emptyDenominations,
                ...(parsed.cashInRegister.denominations || {}),
              },
              total: Number(parsed.cashInRegister.total) || 0,
            });
          }
          if (
            parsed.cashWithdrawal &&
            typeof parsed.cashWithdrawal.total === "number"
          ) {
            setCashWithdrawal({
              denominations: {
                ...emptyDenominations,
                ...(parsed.cashWithdrawal.denominations || {}),
              },
              total: Number(parsed.cashWithdrawal.total) || 0,
            });
          }
          if (typeof parsed.finalBalance === "number")
            setFinalBalance(parsed.finalBalance);
        }
      }
    } catch (error) {
      console.error("Error loading saved shift state:", error);
    }
    // Defer enabling saves until after state updates from storage commit
    setTimeout(() => {
      hasHydratedRef.current = true;
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist shift state whenever it changes
  useEffect(() => {
    if (!hasHydratedRef.current) {
      return;
    }
    try {
      const payload = {
        initialBalance,
        expenses,
        cashReturns,
        cashDeposits,
        terminal,
        terminalReturns,
        terminalTransfer,
        transfers,
        cashInRegister,
        cashWithdrawal,
        finalBalance,
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      }
    } catch (error) {
      console.error("Error saving shift state:", error);
    }
  }, [
    initialBalance,
    expenses,
    cashReturns,
    cashDeposits,
    terminal,
    terminalReturns,
    terminalTransfer,
    transfers,
    cashInRegister,
    cashWithdrawal,
    finalBalance,
  ]);

  // Get complete shift data for submission
  const getShiftData = (): ShiftData => {
    const data = {
      date: new Date().toISOString().split("T")[0],
      initialBalance,
      terminal,
      terminalReturns,
      terminalTransfer,
      transfers,
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

  // Reset all state to default values, but keep final balance as new initial balance
  const resetShift = () => {
    // Сохраняем текущий конечный остаток как начальный для новой смены
    const currentFinalBalance = finalBalance;

    setInitialBalance({
      denominations: { ...emptyDenominations },
      total: currentFinalBalance,
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
    setTransfers({ items: [], total: 0 });
    setCashInRegister({
      denominations: { ...emptyDenominations },
      total: currentFinalBalance, // Устанавливаем наличные в кассе равными начальному остатку
    });
    setCashWithdrawal({
      denominations: { ...emptyDenominations },
      total: 0,
    });
    setFinalBalance(currentFinalBalance); // Конечный остаток остается тем же
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error("Error clearing saved shift state:", error);
    }
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
        transfers,
        cashInRegister,
        cashWithdrawal,
        finalBalance,
        updateInitialBalance,
        updateInitialBalanceTotal,
        addExpense,
        removeExpense,
        addTransfer,
        removeTransfer,
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
