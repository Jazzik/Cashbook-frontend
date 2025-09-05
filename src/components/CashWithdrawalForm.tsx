import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Paper,
  Box,
  Divider,
  Fade,
  Alert,
} from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import WarningIcon from "@mui/icons-material/Warning";
import SavingsIcon from "@mui/icons-material/Savings";
import {
  Denominations,
  emptyDenominations,
  CashWithDenominations,
} from "../types";
import { formatCurrency } from "../utils/calculations";
import DenominationInput from "./DenominationInput";
import { useShift } from "../context/ShiftContext";
import { useSettings } from "../context/SettingsContext";

interface CashWithdrawalFormProps {
  cashWithdrawal: CashWithDenominations;
  onUpdateCashWithdrawal: (denominations: Denominations) => void;
}

const CashWithdrawalForm: React.FC<CashWithdrawalFormProps> = ({
  cashWithdrawal,
  onUpdateCashWithdrawal,
}) => {
  const [open, setOpen] = useState(false);
  const [denominations, setDenominations] = useState<Denominations>({
    ...emptyDenominations,
  });
  const [total, setTotal] = useState(0);
  const [withdrawalWarning, setWithdrawalWarning] = useState<string | null>(
    null
  );
  const [estimatedFinalBalance, setEstimatedFinalBalance] = useState(0);
  const { cardColors } = useSettings();

  // Получаем данные о наличных в кассе
  const { cashInRegister } = useShift();

  const getMainColor = () => {
    return cardColors.cashWithdrawal;
  };

  const getGradientColors = () => {
    const baseColor = getMainColor();

    // Create a darker shade for the gradient
    const darkerColor = baseColor.replace(
      /^#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i,
      (_, r, g, b) => {
        const darken = (hex: string) => {
          return Math.max(0, parseInt(hex, 16) - 30)
            .toString(16)
            .padStart(2, "0");
        };
        return `#${darken(r)}${darken(g)}${darken(b)}`;
      }
    );

    return `linear-gradient(to right bottom, ${baseColor}, ${darkerColor})`;
  };

  useEffect(() => {
    // Рассчитываем предполагаемый остаток в кассе после выемки
    const currentBalance = cashInRegister.total;
    const newWithdrawal = total;

    // Если мы делаем новую выемку, мы заменяем старую, а не добавляем к ней
    const finalBalance = Math.max(0, currentBalance - newWithdrawal);

    setEstimatedFinalBalance(finalBalance);
  }, [total, cashInRegister.total]);

  const handleOpen = () => {
    setOpen(true);
    setDenominations({ ...emptyDenominations });
    setTotal(0);
    setWithdrawalWarning(null);
  };

  const handleClose = () => {
    setOpen(false);
    setWithdrawalWarning(null);
  };

  const handleSubmit = () => {
    // Проверяем, не превышает ли выемка текущий остаток в кассе
    if (total > cashInRegister.total) {
      setWithdrawalWarning(
        `Выемка превышает текущий остаток в кассе (${formatCurrency(
          cashInRegister.total
        )})`
      );
      return;
    }

    onUpdateCashWithdrawal(denominations);
    handleClose();
  };

  const handleDenominationsChange = (
    newDenominations: Denominations,
    newTotal: number
  ) => {
    setDenominations(newDenominations);
    setTotal(newTotal);

    // Сбрасываем предупреждение при изменении суммы
    if (withdrawalWarning && newTotal <= cashInRegister.total) {
      setWithdrawalWarning(null);
    } else if (newTotal > cashInRegister.total) {
      setWithdrawalWarning(
        `Выемка превышает текущий остаток в кассе (${formatCurrency(
          cashInRegister.total
        )})`
      );
    }
  };

  // Конечный остаток после текущей выемки
  const finalBalanceAfterCurrentWithdrawal = Math.max(
    0,
    cashInRegister.total - cashWithdrawal.total
  );

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: "12px",
        background: getGradientColors(),
        color: "white",
        transition: "transform 0.3s ease",
        "&:hover": {
          transform: "scale(1.02)",
        },
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <Box mb={1} display="flex" alignItems="center">
        <AccountBalanceIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Инкассация
        </Typography>
      </Box>

      <Divider sx={{ my: 1, backgroundColor: "rgba(255,255,255,0.3)" }} />

      <Box sx={{ textAlign: "center", flex: "1 1 auto" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          {formatCurrency(cashWithdrawal.total)}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <SavingsIcon sx={{ mr: 1, fontSize: "1rem" }} />
          <Typography variant="body2">Конечный остаток:</Typography>
        </Box>
        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
          {formatCurrency(finalBalanceAfterCurrentWithdrawal)}
        </Typography>
      </Box>

      <Button
        variant="contained"
        color="inherit"
        startIcon={<MonetizationOnIcon />}
        onClick={handleOpen}
        fullWidth
        size="small"
        sx={{
          mt: 1,
          py: 1,
          color: getMainColor(),
          backgroundColor: "white",
          fontWeight: "bold",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.8)",
          },
        }}
      >
        Выемка из кассы
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={300}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: getMainColor(),
            color: "white",
            fontWeight: "bold",
            py: 2,
            display: "flex",
            alignItems: "center",
          }}
        >
          <AccountBalanceIcon sx={{ mr: 1 }} />
          Выемка из кассы
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          {withdrawalWarning && (
            <Alert
              severity="warning"
              icon={<WarningIcon />}
              sx={{ mb: 2, alignItems: "center" }}
            >
              {withdrawalWarning}
            </Alert>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 2,
              p: 2,
              bgcolor: `${getMainColor()}15`,
              borderRadius: "8px",
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                Наличные в кассе:
              </Typography>
              <Typography variant="h6">
                {formatCurrency(cashInRegister.total)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Конечный остаток (расчетное):
              </Typography>
              <Typography variant="h6">
                {formatCurrency(estimatedFinalBalance)}
              </Typography>
            </Box>
          </Box>

          <DenominationInput
            title="Выемка из кассы"
            initialDenominations={denominations}
            onChange={handleDenominationsChange}
            availableDenominations={cashInRegister.denominations}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              width: "100%",
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={handleClose}
              color="inherit"
              variant="outlined"
              sx={{
                px: 3,
                py: 1,
                borderRadius: "8px",
                minWidth: "120px",
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              style={{ backgroundColor: getMainColor() }}
              sx={{
                px: 3,
                py: 1,
                borderRadius: "8px",
                fontWeight: "bold",
                boxShadow: 2,
                color: "white",
                minWidth: "120px",
              }}
              disabled={withdrawalWarning !== null}
            >
              Сохранить
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CashWithdrawalForm;
