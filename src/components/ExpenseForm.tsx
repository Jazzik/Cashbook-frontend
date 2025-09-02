import React, { useState, useRef } from "react";
import {
  Paper,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Divider,
  Alert,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { formatCurrency } from "../utils/format";
import {
  CARD_DIMENSIONS,
  DIALOG_STYLES,
  CHIP_STYLES,
  getGradientColors,
  getMainColor,
  TEXT_FIELD_STYLES,
} from "../styles";
import { useSettings } from "../context/SettingsContext";

interface ExpenseFormProps {
  expenses: Array<{
    id: string;
    name: string;
    amount: number;
  }>;
  onAdd: (name: string, amount: number) => void;
  onRemove: (id: string) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  expenses,
  onAdd,
  onRemove,
}) => {
  const [open, setOpen] = useState(false);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [error, setError] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { cardColors } = useSettings();

  const handleOpen = () => {
    setOpen(true);
    setExpenseName("");
    setExpenseAmount("");
    setError("");
  };

  const handleClose = () => {
    setOpen(false);
    setExpenseName("");
    setExpenseAmount("");
    setError("");
  };

  const handleSubmit = () => {
    if (!expenseName.trim()) {
      setError("Введите описание расхода");
      return;
    }

    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Введите корректную сумму");
      return;
    }

    onAdd(expenseName.trim(), amount);
    handleClose();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  const handleTemplateClick = () => {
    const template = "Оплата логистики по накл. №";
    setExpenseName(template);
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
        const length = template.length;
        nameInputRef.current.setSelectionRange(length, length);
      }
    }, 50);
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const errorColor = getMainColor("error");

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
        borderRadius: CARD_DIMENSIONS.cardBorderRadius,
        background: getGradientColors(cardColors.expenses),
        color: "white",
        transition: CARD_DIMENSIONS.cardTransition,
        "&:hover": {
          transform: CARD_DIMENSIONS.cardHoverTransform,
        },
      }}
    >
      <Box mb={1} display="flex" alignItems="center">
        <MoneyOffIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Расходы
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
        {expenses.length === 0 ? (
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
              Здесь будут отображены расходы
            </Typography>
          </Box>
        ) : (
          <List dense sx={{ p: 0 }}>
            {expenses.map((expense, index) => (
              <React.Fragment key={expense.id}>
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
                    primary={expense.name}
                    secondary={
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        {formatCurrency(expense.amount)}
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
                      onClick={() => onRemove(expense.id)}
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
          label={`Итого: ${formatCurrency(totalExpenses)}`}
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
          startIcon={<AddIcon />}
          onClick={handleOpen}
          size="small"
          sx={{
            bgcolor: "white",
            color: errorColor,
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
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: DIALOG_STYLES.borderRadius,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: cardColors.expenses,
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Добавление расхода
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: "white", p: 0.5 }}>
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
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
            placeholder="Например: Закупка продуктов"
            inputRef={nameInputRef}
            sx={{ mb: 2, ...TEXT_FIELD_STYLES.modal }}
          />
          <Box
            sx={{
              mb: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1, textAlign: "center" }}
            >
              Шаблоны:
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Chip
                label="Оплата логистики по накл. №"
                onClick={handleTemplateClick}
                variant="outlined"
                color="primary"
                sx={{
                  cursor: "pointer",
                  color: errorColor,
                  borderColor: errorColor,
                  "&:hover": {
                    backgroundColor: "rgba(211, 47, 47, 0.1)",
                  },
                }}
              />
            </Box>
          </Box>
          <TextField
            margin="dense"
            label="Сумма"
            fullWidth
            variant="outlined"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
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
            onClick={handleClose}
            color="inherit"
            variant="outlined"
            sx={{ borderRadius: "8px" }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            color="error"
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

export default ExpenseForm;
