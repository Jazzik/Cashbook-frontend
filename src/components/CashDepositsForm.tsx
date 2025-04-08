import React, { useState } from "react";
import {
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Box,
  Divider,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  Chip,
  Alert,
} from "@mui/material";

// Import icons
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CloseIcon from "@mui/icons-material/Close";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

// Import format function
import { formatCurrency } from "../utils/calculations";
import { CashDeposit } from "../types";
import { useSettings } from "../context/SettingsContext";
import {
  CARD_DIMENSIONS,
  DIALOG_STYLES,
  CHIP_STYLES,
  getGradientColors,
  getMainColor,
  TEXT_FIELD_STYLES,
} from "../styles";

interface CashDepositsFormProps {
  cashDeposits: CashDeposit[];
  totalDeposits: number;
  onAdd: (name: string, amount: number) => void;
  onRemove: (id: string) => void;
}

const CashDepositsForm: React.FC<CashDepositsFormProps> = ({
  cashDeposits,
  totalDeposits,
  onAdd,
  onRemove,
}) => {
  const [depositName, setDepositName] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState("");
  const { cardColors } = useSettings();

  const handleAddDeposit = () => {
    if (!depositName.trim()) {
      setError("Пожалуйста, укажите описание");
      return;
    }

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Пожалуйста, введите корректную сумму");
      return;
    }

    onAdd(depositName, amount);
    setDepositName("");
    setDepositAmount("");
    setError("");
    setOpenDialog(false);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setDepositName("");
    setDepositAmount("");
    setError("");
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddDeposit();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: CARD_DIMENSIONS.cardBorderRadius,
        background: getGradientColors(cardColors.cashDeposits),
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
        <AttachMoneyIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Внесение наличных в кассу
        </Typography>
      </Box>

      <Divider sx={{ my: 1, backgroundColor: "rgba(255,255,255,0.3)" }} />

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          bgcolor: "rgba(255,255,255,0.05)",
          borderRadius: "8px",
          p: 1,
          mb: 1,
        }}
      >
        {cashDeposits.length === 0 ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              opacity: 0.7,
              textAlign: "center",
              p: 2,
            }}
          >
            <ReceiptLongIcon sx={{ fontSize: "2rem", mb: 1 }} />
            <Typography variant="body2">
              Здесь будут отображены внесения наличных в кассу
            </Typography>
          </Box>
        ) : (
          <List dense sx={{ p: 0 }}>
            {cashDeposits.map((deposit, index) => (
              <React.Fragment key={deposit.id}>
                {index > 0 && (
                  <Divider sx={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                )}
                <ListItem
                  sx={{
                    bgcolor: "rgba(0,0,0,0.1)",
                    borderRadius: "4px",
                    mb: 0.5,
                    py: 0.5,
                  }}
                >
                  <ListItemText
                    primary={deposit.name}
                    secondary={
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        {formatCurrency(deposit.amount)}
                      </Typography>
                    }
                    primaryTypographyProps={{
                      variant: "body2",
                      sx: { fontWeight: "bold" },
                    }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => onRemove(deposit.id)}
                      sx={{
                        color: "rgba(255,255,255,0.7)",
                        "&:hover": {
                          color: "white",
                          bgcolor: "rgba(255,255,255,0.1)",
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: "auto",
        }}
      >
        <Chip
          label={`Итого: ${formatCurrency(totalDeposits)}`}
          sx={{
            bgcolor: "rgba(0,0,0,0.2)",
            color: "white",
            fontWeight: "bold",
            height: CHIP_STYLES.root.height,
            "& .MuiChip-label": {
              px: 1,
            },
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={handleOpenDialog}
          size="small"
          sx={{
            bgcolor: "white",
            color: getMainColor(),
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.9)",
            },
            fontWeight: "bold",
          }}
        >
          Добавить
        </Button>
      </Box>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={300}
        PaperProps={{
          sx: {
            borderRadius: DIALOG_STYLES.borderRadius,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: getMainColor(),
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Внесение наличных в кассу
          </Typography>
          <IconButton
            onClick={handleCloseDialog}
            sx={{ color: "white", p: 0.5 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Описание"
            fullWidth
            variant="outlined"
            value={depositName}
            onChange={(e) => setDepositName(e.target.value)}
            placeholder="Например: Предоплата за заказ"
            sx={{ mb: 2, ...TEXT_FIELD_STYLES.modal }}
          />
          <TextField
            margin="dense"
            label="Сумма"
            fullWidth
            variant="outlined"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            onKeyPress={handleKeyPress}
            type="number"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">₽</InputAdornment>
              ),
            }}
            placeholder="0"
            sx={TEXT_FIELD_STYLES.modal}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={handleCloseDialog}
            color="inherit"
            variant="outlined"
            sx={{ borderRadius: "8px" }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleAddDeposit}
            color="primary"
            variant="contained"
            sx={{ borderRadius: "8px", fontWeight: "bold" }}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CashDepositsForm;
