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
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { formatCurrency } from "../utils/format";
import { useSettings } from "../context/SettingsContext";
import {
  CARD_DIMENSIONS,
  TEXT_FIELD_STYLES,
  getGradientColors,
  getMainColor,
} from "../styles";

interface TerminalFormProps {
  terminal: number;
  terminalReturns: number;
  terminalTransfer: number;
  onUpdateTerminal: (value: number) => void;
  onUpdateTerminalReturns: (value: number) => void;
  onUpdateTerminalTransfer: (value: number) => void;
}

const TerminalForm: React.FC<TerminalFormProps> = ({
  terminal,
  terminalReturns,
  terminalTransfer,
  onUpdateTerminal,
  onUpdateTerminalReturns,
  onUpdateTerminalTransfer,
}) => {
  const [open, setOpen] = useState(false);
  const [terminalValue, setTerminalValue] = useState<string>(
    terminal.toString()
  );
  const [terminalReturnValue, setTerminalReturnValue] = useState<string>(
    terminalReturns.toString()
  );
  const [terminalTransferValue, setTerminalTransferValue] = useState<string>(
    terminalTransfer.toString()
  );
  const { cardColors } = useSettings();

  const handleTerminalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setTerminalValue(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onUpdateTerminal(numValue);
    }
  };

  const handleTerminalReturnsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setTerminalReturnValue(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onUpdateTerminalReturns(numValue);
    }
  };

  const handleTerminalTransferChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setTerminalTransferValue(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onUpdateTerminalTransfer(numValue);
    }
  };

  const incrementTerminal = () => {
    const newValue = terminal + 50;
    setTerminalValue(newValue.toString());
    onUpdateTerminal(newValue);
  };

  const decrementTerminal = () => {
    const newValue = Math.max(0, terminal - 50);
    setTerminalValue(newValue.toString());
    onUpdateTerminal(newValue);
  };

  const incrementTerminalReturn = () => {
    const newValue = terminalReturns + 50;
    setTerminalReturnValue(newValue.toString());
    onUpdateTerminalReturns(newValue);
  };

  const decrementTerminalReturn = () => {
    const newValue = Math.max(0, terminalReturns - 50);
    setTerminalReturnValue(newValue.toString());
    onUpdateTerminalReturns(newValue);
  };

  const incrementTerminalTransfer = () => {
    const newValue = terminalTransfer + 50;
    setTerminalTransferValue(newValue.toString());
    onUpdateTerminalTransfer(newValue);
  };

  const decrementTerminalTransfer = () => {
    const newValue = Math.max(0, terminalTransfer - 50);
    setTerminalTransferValue(newValue.toString());
    onUpdateTerminalTransfer(newValue);
  };

  const terminalRevenue = terminal - terminalReturns + terminalTransfer;
  const infoColor = getMainColor("info");

  const handleOpen = () => {
    setOpen(true);
    setTerminalValue(terminal.toString());
    setTerminalReturnValue(terminalReturns.toString());
    setTerminalTransferValue(terminalTransfer.toString());
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    onUpdateTerminal(parseFloat(terminalValue));
    onUpdateTerminalReturns(parseFloat(terminalReturnValue));
    onUpdateTerminalTransfer(parseFloat(terminalTransferValue));
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
        background: getGradientColors(cardColors.terminal),
        color: "white",
        transition: CARD_DIMENSIONS.cardTransition,
        "&:hover": {
          transform: CARD_DIMENSIONS.cardHoverTransform,
        },
      }}
    >
      <Box mb={1} display="flex" alignItems="center">
        <PointOfSaleIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Терминал
        </Typography>
      </Box>

      <Divider sx={{ my: 1, backgroundColor: "rgba(255,255,255,0.3)" }} />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                flexShrink: 0,
                whiteSpace: "nowrap",
                pr: 1,
                maxWidth: "50%",
                minWidth: "120px",
              }}
            >
              Выручка по терминалу:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                textAlign: "right",
                flex: 1,
                minWidth: 0,
                maxWidth: "50%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flexShrink: 1,
                width: "100%",
              }}
            >
              {formatCurrency(terminal)}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                flexShrink: 0,
                whiteSpace: "nowrap",
                pr: 1,
                maxWidth: "50%",
              }}
            >
              Возвраты по терминалу:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                textAlign: "right",
                flex: 1,
                minWidth: 0,
                maxWidth: "50%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {formatCurrency(terminalReturns)}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                flexShrink: 0,
                whiteSpace: "nowrap",
                pr: 1,
                maxWidth: "50%",
              }}
            >
              Переводы:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                textAlign: "right",
                flex: 1,
                minWidth: 0,
                maxWidth: "50%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {formatCurrency(terminalTransfer)}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            mt: "auto",
            p: 2,
            bgcolor: "rgba(0,0,0,0.1)",
            borderRadius: "8px",
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
            Чистая выручка по терминалу:
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {formatCurrency(terminalRevenue)}
          </Typography>
        </Box>
      </Box>

      <Button
        variant="contained"
        color="inherit"
        startIcon={<PointOfSaleIcon />}
        onClick={handleOpen}
        fullWidth
        size="small"
        sx={{
          mt: 1,
          py: 1,
          color: infoColor,
          backgroundColor: "white",
          fontWeight: "bold",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.8)",
          },
        }}
      >
        Операции по терминалу
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
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
            backgroundColor: infoColor,
            color: "white",
            fontWeight: "bold",
            py: 2,
          }}
        >
          Терминал
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 1 }}>
            <Box sx={{ flex: "1 1 45%", minWidth: "250px" }}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, fontWeight: "bold", color: "#424242" }}
              >
                Сумма по терминалу
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Button
                  variant="outlined"
                  style={{ borderColor: infoColor, color: infoColor }}
                  onClick={decrementTerminal}
                  sx={{
                    mr: 1,
                    minWidth: "40px",
                    height: "56px",
                    borderRadius: "8px 0 0 8px",
                  }}
                >
                  <RemoveIcon />
                </Button>
                <TextField
                  fullWidth
                  label="Сумма"
                  type="number"
                  value={terminalValue || ""}
                  onChange={handleTerminalChange}
                  InputProps={{
                    inputProps: {
                      min: 0,
                      style: {
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                      },
                    },
                    endAdornment: (
                      <InputAdornment position="end">₽</InputAdornment>
                    ),
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
                <Button
                  variant="outlined"
                  style={{ borderColor: infoColor, color: infoColor }}
                  onClick={incrementTerminal}
                  sx={{
                    ml: 1,
                    minWidth: "40px",
                    height: "56px",
                    borderRadius: "0 8px 8px 0",
                  }}
                >
                  <AddIcon />
                </Button>
              </Box>
            </Box>

            <Box sx={{ flex: "1 1 45%", minWidth: "250px" }}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, fontWeight: "bold", color: "#424242" }}
              >
                Возврат по терминалу
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Button
                  variant="outlined"
                  style={{ borderColor: infoColor, color: infoColor }}
                  onClick={decrementTerminalReturn}
                  sx={{
                    mr: 1,
                    minWidth: "40px",
                    height: "56px",
                    borderRadius: "8px 0 0 8px",
                  }}
                >
                  <RemoveIcon />
                </Button>
                <TextField
                  fullWidth
                  label="Сумма"
                  type="number"
                  value={terminalReturnValue || ""}
                  onChange={handleTerminalReturnsChange}
                  InputProps={{
                    inputProps: {
                      min: 0,
                      style: {
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                      },
                    },
                    endAdornment: (
                      <InputAdornment position="end">₽</InputAdornment>
                    ),
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
                <Button
                  variant="outlined"
                  style={{ borderColor: infoColor, color: infoColor }}
                  onClick={incrementTerminalReturn}
                  sx={{
                    ml: 1,
                    minWidth: "40px",
                    height: "56px",
                    borderRadius: "0 8px 8px 0",
                  }}
                >
                  <AddIcon />
                </Button>
              </Box>
            </Box>

            <Box sx={{ flex: "1 1 45%", minWidth: "250px" }}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, fontWeight: "bold", color: "#424242" }}
              >
                Переводы
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Button
                  variant="outlined"
                  style={{ borderColor: infoColor, color: infoColor }}
                  onClick={decrementTerminalTransfer}
                  sx={{
                    mr: 1,
                    minWidth: "40px",
                    height: "56px",
                    borderRadius: "8px 0 0 8px",
                  }}
                >
                  <RemoveIcon />
                </Button>
                <TextField
                  fullWidth
                  label="Сумма"
                  type="number"
                  value={terminalTransferValue || ""}
                  onChange={handleTerminalTransferChange}
                  InputProps={{
                    inputProps: {
                      min: 0,
                      style: {
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                      },
                    },
                    endAdornment: (
                      <InputAdornment position="end">₽</InputAdornment>
                    ),
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
                <Button
                  variant="outlined"
                  style={{ borderColor: infoColor, color: infoColor }}
                  onClick={incrementTerminalTransfer}
                  sx={{
                    ml: 1,
                    minWidth: "40px",
                    height: "56px",
                    borderRadius: "0 8px 8px 0",
                  }}
                >
                  <AddIcon />
                </Button>
              </Box>
            </Box>
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
              style={{ backgroundColor: infoColor }}
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

export default TerminalForm;
