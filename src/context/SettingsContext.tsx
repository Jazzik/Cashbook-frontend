import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Define the type for color settings
export interface CardColors {
  initialBalance: string;
  cashReturns: string;
  terminal: string;
  expenses: string;
  cashDeposits: string;
  cashInRegister: string;
  cashWithdrawal: string;
  shiftSummary: string;
}

// Default colors for cards
export const defaultCardColors: CardColors = {
  initialBalance: "#1976d2", // Blue
  cashReturns: "#f57c00", // Orange
  terminal: "#0288d1", // Light Blue
  expenses: "#e65100", // Deep Orange
  cashDeposits: "#7b1fa2", // Purple
  cashInRegister: "#0288d1", // Light Blue
  cashWithdrawal: "#6a1b9a", // Deep Purple
  shiftSummary: "#2e7d32", // Green
};

// Interface for the Settings context
interface SettingsContextType {
  cardColors: CardColors;
  updateCardColor: (key: keyof CardColors, color: string) => void;
  resetColors: () => void;
}

// Create the Settings context
const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

// Settings provider component
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Initialize state with colors from localStorage, or defaults if not found
  const [cardColors, setCardColors] = useState<CardColors>(() => {
    try {
      const savedColors = localStorage.getItem("cardColors");
      if (savedColors) {
        const parsedColors = JSON.parse(savedColors);
        // Validate that all required colors are present
        const validColors = { ...defaultCardColors };
        Object.keys(validColors).forEach((key) => {
          if (parsedColors[key] && /^#[0-9A-F]{6}$/i.test(parsedColors[key])) {
            validColors[key as keyof CardColors] = parsedColors[key];
          }
        });
        return validColors;
      }
    } catch (error) {
      console.error("Error loading saved colors:", error);
    }
    return { ...defaultCardColors };
  });

  // Update a specific card's color
  const updateCardColor = (key: keyof CardColors, color: string) => {
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      console.error("Invalid color format:", color);
      return;
    }
    setCardColors((prevColors) => ({
      ...prevColors,
      [key]: color,
    }));
  };

  // Reset all colors to defaults
  const resetColors = () => {
    setCardColors({ ...defaultCardColors });
  };

  // Store colors in localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("cardColors", JSON.stringify(cardColors));
    } catch (error) {
      console.error("Error saving colors:", error);
    }
  }, [cardColors]);

  return (
    <SettingsContext.Provider
      value={{
        cardColors,
        updateCardColor,
        resetColors,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use the settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
