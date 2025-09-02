import React, { useState } from "react";
import {
  Typography,
  Box,
  AppBar,
  Toolbar,
  CssBaseline,
  Button,
  // Remove unused imports
  // Grid,
  // Paper,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ShiftProvider, useShift } from "./context/ShiftContext";
import { SettingsProvider } from "./context/SettingsContext";
import ExpenseForm from "./components/ExpenseForm";
import TerminalForm from "./components/TerminalForm";
import CashWithdrawalForm from "./components/CashWithdrawalForm";
import ShiftSummary from "./components/ShiftSummary";
import DenominationModal from "./components/DenominationModal";
import InitialBalanceForm from "./components/InitialBalanceForm";
import CashReturnsForm from "./components/CashReturnsForm";
import CashDepositsForm from "./components/CashDepositsForm";
import SettingsModal from "./components/SettingsModal";
import { themeOverrides, CARD_DIMENSIONS, LAYOUT_DIMENSIONS } from "./styles";

// Импортируем иконки
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaymentsIcon from "@mui/icons-material/Payments";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#f50057",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
    // Возвращаем стандартные размеры шрифтов
    h4: { fontSize: "2.125rem" },
    h5: { fontSize: "1.5rem" },
    h6: { fontSize: "1.25rem" },
    body1: { fontSize: "1rem" },
    body2: { fontSize: "0.875rem" },
    button: { fontSize: "0.875rem" },
  },
  components: themeOverrides.components,
});

// Main content component
const MainContent: React.FC = () => {
  const {
    initialBalance,
    expenses,
    cashReturns,
    cashDeposits,
    terminal,
    terminalReturns,
    terminalTransfer,
    cashInRegister,
    cashWithdrawal,
    updateInitialBalance,
    updateInitialBalanceTotal,
    addExpense,
    removeExpense,
    addCashReturn,
    removeCashReturn,
    addCashDeposit,
    removeCashDeposit,
    updateTerminal,
    updateTerminalReturns,
    updateTerminalTransfer,
    transfers,
    addTransfer,
    removeTransfer,
    updateCashInRegister,
    updateCashWithdrawal,
    calculateFinalBalance,
    getShiftData,
    resetShift,
  } = useShift();

  // Двухшаговый режим: 1 — ввод данных, 2 — инкассация и закрытие смены
  const [step, setStep] = useState<1 | 2>(1);

  // Функция для сброса шага на первый
  const handleResetStep = () => {
    setStep(1);
  };

  // Стиль для верхних карточек с уменьшенной высотой
  const topCardStyle = {
    display: "flex",
    height: CARD_DIMENSIONS.topCardHeight,
    "& > *": {
      height: "100%",
      display: "flex",
      flexDirection: "column",
    },
  };

  // Стиль для нижних карточек, чтобы они были одинаковой высоты
  const bottomCardStyle = {
    display: "flex",
    height: CARD_DIMENSIONS.bottomCardHeight,
    "& > *": {
      height: "100%",
      display: "flex",
      flexDirection: "column",
    },
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h4" align="center" sx={{ mb: 2 }}>
        Учет кассы
      </Typography>

      <Box
        sx={{
          width: "100%",
          overflowX: "hidden",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            marginTop: LAYOUT_DIMENSIONS.marginTop,
            marginLeft: LAYOUT_DIMENSIONS.marginLeft,
            marginRight: LAYOUT_DIMENSIONS.marginLeft,
            marginBottom: "30px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            minWidth: LAYOUT_DIMENSIONS.minWidth,
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Контейнер контента в зависимости от шага */}
          {step === 1 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: LAYOUT_DIMENSIONS.gap,
                boxSizing: "border-box",
              }}
            >
              {/* Первая колонка: Начальный остаток и наличные в кассе */}
              <Box
                sx={{
                  width: LAYOUT_DIMENSIONS.columnWidths.first,
                  display: "flex",
                  flexDirection: "column",
                  gap: LAYOUT_DIMENSIONS.gap,
                }}
              >
                <Box sx={topCardStyle}>
                  <InitialBalanceForm
                    amount={initialBalance.total}
                    onUpdateAmount={updateInitialBalanceTotal}
                  />
                </Box>
                <Box sx={bottomCardStyle}>
                  <DenominationModal
                    title="Наличные в кассе до инкассации"
                    buttonText="Ввести"
                    initialDenominations={cashInRegister.denominations}
                    onChange={updateCashInRegister}
                    total={cashInRegister.total}
                    icon={<PaymentsIcon />}
                    color="info"
                    cardType="cashInRegister"
                  />
                </Box>
              </Box>

              {/* Вторая колонка: терминал и расходы */}
              <Box
                sx={{
                  width: LAYOUT_DIMENSIONS.columnWidths.second,
                  display: "flex",
                  flexDirection: "column",
                  gap: LAYOUT_DIMENSIONS.gap,
                }}
              >
                <Box sx={topCardStyle}>
                  <TerminalForm
                    terminal={terminal}
                    terminalReturns={terminalReturns}
                    terminalTransfer={terminalTransfer}
                    transfers={transfers}
                    onUpdateTerminal={updateTerminal}
                    onUpdateTerminalReturns={updateTerminalReturns}
                    onUpdateTerminalTransfer={updateTerminalTransfer}
                    onAddTransfer={addTransfer}
                    onRemoveTransfer={removeTransfer}
                  />
                </Box>
                <Box sx={bottomCardStyle}>
                  <ExpenseForm
                    expenses={expenses}
                    onAdd={addExpense}
                    onRemove={removeExpense}
                  />
                </Box>
              </Box>

              {/* Третья колонка: внесение наличных и возвраты наличными */}
              <Box
                sx={{
                  width: LAYOUT_DIMENSIONS.columnWidths.third,
                  display: "flex",
                  flexDirection: "column",
                  gap: LAYOUT_DIMENSIONS.gap,
                }}
              >
                <Box sx={topCardStyle}>
                  <CashDepositsForm
                    cashDeposits={cashDeposits.items}
                    totalDeposits={cashDeposits.total}
                    onAdd={addCashDeposit}
                    onRemove={removeCashDeposit}
                  />
                </Box>
                <Box sx={bottomCardStyle}>
                  <CashReturnsForm
                    cashReturns={cashReturns.items}
                    totalReturns={cashReturns.total}
                    onAdd={addCashReturn}
                    onRemove={removeCashReturn}
                  />
                </Box>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: LAYOUT_DIMENSIONS.gap,
                boxSizing: "border-box",
              }}
            >
              {/* Шаг 2: Инкассация и закрытие смены */}
              <Box
                sx={{
                  width: LAYOUT_DIMENSIONS.columnWidths.fourth,
                  display: "flex",
                  flexDirection: "column",
                  gap: LAYOUT_DIMENSIONS.gap,
                }}
              >
                <Box sx={{ ...topCardStyle, height: "192px" }}>
                  <CashWithdrawalForm
                    cashWithdrawal={cashWithdrawal}
                    onUpdateCashWithdrawal={updateCashWithdrawal}
                  />
                </Box>
                <Box sx={{ ...bottomCardStyle, height: "448px" }}>
                  <ShiftSummary
                    initialBalance={initialBalance.total}
                    expenses={expenses.reduce(
                      (sum, exp) => sum + exp.amount,
                      0
                    )}
                    expensesDetails={expenses.map((exp) => ({
                      description: exp.name,
                      amount: exp.amount,
                    }))}
                    transfersDetails={transfers.items.map((t) => ({
                      description: t.name,
                      amount: t.amount,
                      timestamp: t.timestamp,
                    }))}
                    cashReturns={cashReturns.total}
                    cashDeposits={cashDeposits.total}
                    terminal={terminal}
                    terminalReturns={terminalReturns}
                    terminalTransfer={terminalTransfer}
                    cashInRegister={cashInRegister.total}
                    cashWithdrawal={cashWithdrawal.total}
                    finalBalance={calculateFinalBalance()}
                    onGetShiftData={getShiftData}
                    onResetShift={resetShift}
                    onResetStep={handleResetStep}
                  />
                </Box>
              </Box>
            </Box>
          )}

          {/* Навигация по шагам */}
          {step === 1 ? (
            <Box sx={{ width: "100%" }}>
              <Button
                onClick={() => setStep(2)}
                variant="contained"
                color="primary"
                startIcon={<AssignmentTurnedInIcon />}
                fullWidth
                sx={{
                  mt: 1,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: "bold",
                  boxShadow: 3,
                }}
              >
                Перейти к инкассации
              </Button>
            </Box>
          ) : (
            <Box sx={{ width: "100%" }}>
              <Button
                onClick={() => setStep(1)}
                variant="outlined"
                color="primary"
                startIcon={<ArrowBackIcon />}
                fullWidth
                sx={{
                  mt: 1,
                  py: 1.25,
                  borderRadius: 2,
                  fontWeight: "bold",
                }}
              >
                Назад
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// Root component
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SettingsProvider>
        <ShiftProvider>
          <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" color="primary">
              <Toolbar>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <PointOfSaleIcon sx={{ mr: 1.5, fontSize: 32 }} />
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{ fontWeight: "bold" }}
                  >
                    Кассовая книга
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <SettingsModal />
              </Toolbar>
            </AppBar>
            <MainContent />
          </Box>
        </ShiftProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
};

export default App;
