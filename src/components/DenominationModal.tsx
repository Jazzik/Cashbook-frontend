import React, { useState } from "react";
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
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Denominations } from "../types";
import { formatCurrency } from "../utils/calculations";
import DenominationInput from "./DenominationInput";
import { useSettings } from "../context/SettingsContext";
import {
  CARD_DIMENSIONS,
  DIALOG_STYLES,
  getGradientColors,
  getMainColor,
} from "../styles";

interface DenominationModalProps {
  title: string;
  buttonText: string;
  initialDenominations: Denominations;
  onChange: (denominations: Denominations) => void;
  total: number;
  icon?: React.ReactNode;
  color?: "primary" | "secondary" | "success" | "error" | "info" | "warning";
  cardType?: "initialBalance" | "cashInRegister";
}

const DenominationModal: React.FC<DenominationModalProps> = ({
  title,
  buttonText,
  initialDenominations,
  onChange,
  total,
  icon,
  color = "primary",
  cardType = "initialBalance",
}) => {
  const [open, setOpen] = useState(false);
  const [denominations, setDenominations] =
    useState<Denominations>(initialDenominations);
  const { cardColors } = useSettings();

  const handleOpen = () => {
    setOpen(true);
    setDenominations(initialDenominations);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    onChange(denominations);
    handleClose();
  };

  const handleDenominationsChange = (
    newDenominations: Denominations,
    newTotal: number
  ) => {
    setDenominations(newDenominations);
  };

  // Get card color from settings or fall back to default
  const getCardColor = () => {
    if (cardType && cardColors[cardType]) {
      return cardColors[cardType];
    }
    return getMainColor();
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: CARD_DIMENSIONS.cardBorderRadius,
        background: getGradientColors(getCardColor()),
        color: "white",
        transition: CARD_DIMENSIONS.cardTransition,
        "&:hover": {
          transform: CARD_DIMENSIONS.cardHoverTransform,
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
        {icon &&
          React.cloneElement(
            icon as React.ReactElement,
            { sx: { mr: 1 } } as any
          )}
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {title}
        </Typography>
      </Box>

      <Divider sx={{ my: 1, backgroundColor: "rgba(255,255,255,0.3)" }} />

      <Box sx={{ textAlign: "center", flex: "1 1 auto" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          {formatCurrency(total)}
        </Typography>
      </Box>

      <Button
        variant="contained"
        color="inherit"
        startIcon={icon}
        onClick={handleOpen}
        fullWidth
        size="small"
        sx={{
          mt: 1,
          py: 1,
          color: getCardColor(),
          backgroundColor: "white",
          fontWeight: "bold",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.8)",
          },
        }}
      >
        {buttonText}
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: DIALOG_STYLES.borderRadius,
            overflow: "hidden",
            maxWidth: "800px",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: getCardColor(),
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {title}
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: "white", p: 0.5 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <DenominationInput
            title={title}
            initialDenominations={initialDenominations}
            onChange={handleDenominationsChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default DenominationModal;
