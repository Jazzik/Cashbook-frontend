import React, { useState, useRef } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Divider,
  InputAdornment,
  Fade,
  Chip,
  ListItemSecondaryAction,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CloseIcon from "@mui/icons-material/Close";
import { CashReturn } from "../types";
import { formatCurrency } from "../utils/calculations";
import { useSettings } from "../context/SettingsContext";
import {
  CARD_DIMENSIONS,
  DIALOG_STYLES,
  CHIP_STYLES,
  getGradientColors,
  getMainColor,
  TEXT_FIELD_STYLES,
} from "../styles";

interface CashReturnsFormProps {
  cashReturns: CashReturn[];
  totalReturns: number;
  onAdd: (name: string, amount: number) => void;
  onRemove: (id: string) => void;
}

const CashReturnsForm: React.FC<CashReturnsFormProps> = ({
  cashReturns,
  totalReturns,
  onAdd,
  onRemove,
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [nameError, setNameError] = useState("");
  const [amountError, setAmountError] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { cardColors } = useSettings();

  const handleOpen = () => {
    setOpen(true);
    setName("");
    setAmount("");
    setNameError("");
    setAmountError("");
  };

  const handleClose = () => {
    setOpen(false);
  };

  const validateForm = (): boolean => {
    let isValid = true;

    if (!name.trim()) {
      setNameError("Наименование возврата обязательно");
      isValid = false;
    } else {
      setNameError("");
    }

    if (!amount) {
      setAmountError("Сумма возврата обязательна");
      isValid = false;
    } else if (typeof amount === "number" && amount <= 0) {
      setAmountError("Сумма должна быть больше нуля");
      isValid = false;
    } else {
      setAmountError("");
    }

    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onAdd(name, typeof amount === "number" ? amount : 0);
      handleClose();
    }
  };

  const incrementAmount = () => {
    setAmount((prevAmount) =>
      typeof prevAmount === "number" ? prevAmount + 50 : 50
    );
  };

  const decrementAmount = () => {
    setAmount((prevAmount) => {
      const currentAmount = typeof prevAmount === "number" ? prevAmount : 0;
      return currentAmount >= 50 ? currentAmount - 50 : 0;
    });
  };

  // Функция для установки имени и перемещения курсора в конец строки
  const handleNameTemplateClick = (template: string) => {
    setName(template);

    // Устанавливаем таймаут, чтобы дать React время обновить DOM
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
        const length = template.length;
        nameInputRef.current.setSelectionRange(length, length);
      }
    }, 50);
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
        borderRadius: CARD_DIMENSIONS.cardBorderRadius,
        background: getGradientColors(cardColors.cashReturns),
        color: "white",
        transition: CARD_DIMENSIONS.cardTransition,
        "&:hover": {
          transform: CARD_DIMENSIONS.cardHoverTransform,
        },
      }}
    >
      <Box mb={1} display="flex" alignItems="center">
        <KeyboardReturnIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Возврат наличными
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
        {cashReturns.length === 0 ? (
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
            <ReceiptIcon sx={{ fontSize: "2rem", mb: 1 }} />
            <Typography variant="body2">
              Здесь будут отображены возвраты наличными
            </Typography>
          </Box>
        ) : (
          <List dense sx={{ p: 0 }}>
            {cashReturns.map((cashReturn, index) => (
              <React.Fragment key={cashReturn.id}>
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
                    primary={cashReturn.name}
                    secondary={
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        {formatCurrency(cashReturn.amount)}
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
                      onClick={() => onRemove(cashReturn.id)}
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
          label={`Итого: ${formatCurrency(totalReturns)}`}
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
            color: getMainColor("secondary"),
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
            backgroundColor: cardColors.cashReturns,
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Добавление возврата наличными
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: "white", p: 0.5 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {nameError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {nameError}
            </Alert>
          )}
          {amountError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {amountError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Описание"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!nameError}
            inputRef={nameInputRef}
            sx={{ mb: 2, ...TEXT_FIELD_STYLES.modal }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Шаблоны:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {["Возврат товара", "Отмена заказа", "Возврат по чеку"].map(
                (template) => (
                  <Chip
                    key={template}
                    label={template}
                    onClick={() => handleNameTemplateClick(template)}
                    variant="outlined"
                    color="primary"
                    sx={{
                      cursor: "pointer",
                      color: getMainColor(),
                      borderColor: getMainColor(),
                      "&:hover": {
                        backgroundColor: "rgba(245, 124, 0, 0.1)",
                      },
                    }}
                  />
                )
              )}
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextField
              margin="dense"
              label="Сумма"
              fullWidth
              variant="outlined"
              value={amount}
              onChange={(e) => {
                // Разрешаем только числовые значения
                const value = e.target.value;
                if (value === "") {
                  setAmount("");
                } else {
                  const parsedValue = parseFloat(value);
                  if (!isNaN(parsedValue)) {
                    setAmount(parsedValue);
                  }
                }
              }}
              type="number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₽</InputAdornment>
                ),
              }}
              error={!!amountError}
            />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={incrementAmount}
                sx={{
                  minWidth: "40px",
                  p: 0.5,
                  color: getMainColor(),
                  borderColor: getMainColor(),
                  "&:hover": {
                    borderColor: getMainColor(),
                    backgroundColor: "rgba(245, 124, 0, 0.1)",
                  },
                }}
              >
                <AddIcon fontSize="small" />
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={decrementAmount}
                sx={{
                  minWidth: "40px",
                  p: 0.5,
                  color: getMainColor(),
                  borderColor: getMainColor(),
                  "&:hover": {
                    borderColor: getMainColor(),
                    backgroundColor: "rgba(245, 124, 0, 0.1)",
                  },
                }}
              >
                <RemoveIcon fontSize="small" />
              </Button>
            </Box>
          </Box>
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
            variant="contained"
            sx={{
              borderRadius: "8px",
              fontWeight: "bold",
              backgroundColor: getMainColor("secondary"),
              "&:hover": {
                backgroundColor: "#E65100",
              },
            }}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CashReturnsForm;
