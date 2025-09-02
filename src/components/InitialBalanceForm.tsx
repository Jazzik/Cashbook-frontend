import React, { useState } from "react";
import {
  TextField,
  Typography,
  Box,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Divider,
  Fade,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { formatCurrency } from "../utils/calculations";
import { useSettings } from "../context/SettingsContext";
import {
  CARD_DIMENSIONS,
  TEXT_FIELD_STYLES,
  getGradientColors,
} from "../styles";

interface InitialBalanceFormProps {
  amount: number;
  onUpdateAmount: (value: number) => void;
}

const InitialBalanceForm: React.FC<InitialBalanceFormProps> = ({
  amount,
  onUpdateAmount,
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>(amount.toString());
  const { cardColors } = useSettings();

  const handleOpen = () => {
    setOpen(true);
    setValue(amount.toString());
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const v = event.target.value;
    setValue(v);
    const num = parseFloat(v);
    if (!isNaN(num)) {
      onUpdateAmount(num);
    }
  };

  const handleSubmit = () => {
    const num = parseFloat(value);
    onUpdateAmount(!isNaN(num) ? num : 0);
    handleClose();
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        mb: 2,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        borderRadius: CARD_DIMENSIONS.cardBorderRadius,
        background: getGradientColors(cardColors.initialBalance),
        color: "white",
        transition: CARD_DIMENSIONS.cardTransition,
        "&:hover": {
          transform: CARD_DIMENSIONS.cardHoverTransform,
        },
      }}
    >
      <Box mb={1} display="flex" alignItems="center">
        <AccountBalanceWalletIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Начальный остаток
        </Typography>
      </Box>

      <Divider sx={{ my: 1, backgroundColor: "rgba(255,255,255,0.3)" }} />

      <Box sx={{ textAlign: "center", flex: "1 1 auto" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          {formatCurrency(amount)}
        </Typography>
      </Box>

      <Button
        variant="contained"
        color="inherit"
        startIcon={<AccountBalanceWalletIcon />}
        onClick={handleOpen}
        fullWidth
        size="small"
        sx={{
          mt: 1,
          py: 1,
          color: cardColors.initialBalance,
          backgroundColor: "white",
          fontWeight: "bold",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.8)",
          },
        }}
      >
        Ввести
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={300}
        PaperProps={{
          sx: { borderRadius: "16px", overflow: "hidden" },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: cardColors.initialBalance,
            color: "white",
            fontWeight: "bold",
            py: 2,
          }}
        >
          Начальный остаток
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <TextField
              fullWidth
              label="Сумма"
              type="number"
              value={value || ""}
              onChange={handleChange}
              InputProps={{
                inputProps: {
                  min: 0,
                  style: {
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                  },
                },
                endAdornment: <InputAdornment position="end">₽</InputAdornment>,
                sx: {
                  "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                    {
                      display: "none",
                    },
                },
              }}
              variant="outlined"
              sx={{ borderRadius: 0, ...TEXT_FIELD_STYLES.modal }}
            />
          </Box>
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
              sx={{ px: 3, py: 1, borderRadius: "8px", minWidth: "120px" }}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSubmit}
              style={{ backgroundColor: cardColors.initialBalance }}
              variant="contained"
              sx={{
                px: 3,
                py: 1,
                borderRadius: "8px",
                fontWeight: "bold",
                boxShadow: 2,
                minWidth: "120px",
              }}
            >
              Сохранить
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default InitialBalanceForm;
