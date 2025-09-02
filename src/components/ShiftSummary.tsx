import React, { useState } from "react";
import {
  Typography,
  Paper,
  Button,
  Grid,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress,
  Fade,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
} from "@mui/material";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { ShiftData } from "../types";
import { formatCurrency } from "../utils/calculations";
import { api } from "../services/api";
import { useSettings } from "../context/SettingsContext";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PaidIcon from "@mui/icons-material/Paid";

interface ShiftSummaryProps {
  initialBalance: number;
  expenses: number;
  cashReturns: number;
  cashDeposits: number;
  terminal: number;
  terminalReturns: number;
  terminalTransfer: number;
  cashInRegister: number;
  cashWithdrawal: number;
  finalBalance: number;
  onGetShiftData: () => ShiftData;
  onResetShift: () => void;
  onResetStep: () => void;
  expensesDetails?: Array<{ description: string; amount: number }>;
  cashDepositsDetails?: Array<{ description: string; amount: number }>;
  cashReturnsDetails?: Array<{ description: string; amount: number }>;
  terminalReturnsDetails?: Array<{ description: string; amount: number }>;
  transfersDetails?: Array<{
    description: string;
    amount: number;
    timestamp?: string;
  }>;
}

const ShiftSummary: React.FC<ShiftSummaryProps> = ({
  initialBalance,
  expenses,
  cashReturns,
  cashDeposits,
  terminal,
  terminalReturns,
  terminalTransfer,
  cashInRegister,
  cashWithdrawal,
  finalBalance,
  onGetShiftData,
  onResetShift,
  onResetStep,
  expensesDetails = [],
  cashDepositsDetails = [],
  cashReturnsDetails = [],
  terminalReturnsDetails = [],
  transfersDetails = [],
}) => {
  const [open, setOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isErrorToastOpen, setIsErrorToastOpen] = useState(false);

  const { cardColors } = useSettings();

  const getMainColor = () => {
    return cardColors.shiftSummary;
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

  const handleOpen = () => {
    setOpen(true);
    setSubmitError(null);
  };

  const handleClose = () => {
    setOpen(false);
    setShowConfirmation(false);
  };

  const handleSubmitClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmation(false);
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Get fresh data at submission time
      const submitData = onGetShiftData();
      console.log("Submitting shift data with terminal values:", {
        terminal: submitData.terminal,
        terminalReturns: submitData.terminalReturns,
        terminalTransfer: submitData.terminalTransfer,
        calculatedTerminalRevenue:
          submitData.terminal -
          submitData.terminalReturns +
          submitData.terminalTransfer,
      });
      await api.submitShiftData(submitData);
      setOpen(false);
      onResetShift(); // Сбрасываем данные смены
      onResetStep(); // Возвращаемся на первую страницу
    } catch (error) {
      console.error("Error submitting shift data:", error);
      setSubmitError(
        "Ошибка при отправке данных. Пожалуйста, попробуйте снова."
      );
      setIsErrorToastOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleErrorToastClose = () => {
    setIsErrorToastOpen(false);
  };

  // Расчет выручки по правилам экономики:
  // 1. Безналичная выручка: терминал минус возвраты по терминалу плюс переводы
  // 2. Наличная выручка: наличные в кассе минус Начальный остаток плюс расходы минус внесения наличных
  //    (возвраты наличными НЕ включаем в расчет выручки)
  const terminalRevenue = terminal - terminalReturns + terminalTransfer;
  const cashRevenue = cashInRegister - initialBalance + expenses - cashDeposits;

  const totalRevenue = terminalRevenue + cashRevenue;

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
        "&:hover": !isErrorToastOpen
          ? {
              transform: "scale(1.02)",
            }
          : undefined,
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box mb={1} display="flex" alignItems="center">
        <AssessmentIcon sx={{ mr: 1 }} />
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Закрытие смены
        </Typography>
      </Box>

      <Divider sx={{ my: 1, backgroundColor: "rgba(255,255,255,0.3)" }} />

      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          {formatCurrency(totalRevenue)}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: "medium" }}>
            Безналичная выручка:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            {formatCurrency(terminalRevenue)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body1" sx={{ fontWeight: "medium" }}>
            Наличная выручка:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            {formatCurrency(cashRevenue)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        <Chip
          label={`Начальный остаток: ${formatCurrency(initialBalance)}`}
          sx={{
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "white",
            fontWeight: "bold",
            height: "28px",
            fontSize: "0.85rem",
          }}
        />
        <Chip
          label={`Терминал: ${formatCurrency(
            terminal - terminalReturns + terminalTransfer
          )}`}
          sx={{
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "white",
            fontWeight: "bold",
            height: "28px",
            fontSize: "0.85rem",
          }}
        />
        <Chip
          label={`Расходы: ${formatCurrency(expenses)}`}
          sx={{
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "white",
            fontWeight: "bold",
            height: "28px",
            fontSize: "0.85rem",
          }}
        />
        <Chip
          label={`Внесения: ${formatCurrency(cashDeposits)}`}
          sx={{
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "white",
            fontWeight: "bold",
            height: "28px",
            fontSize: "0.85rem",
          }}
        />
        <Chip
          label={`Конечный остаток: ${formatCurrency(finalBalance)}`}
          sx={{
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "white",
            fontWeight: "bold",
            height: "28px",
            fontSize: "0.85rem",
          }}
        />
      </Box>

      <Button
        variant="contained"
        color="inherit"
        startIcon={<AssignmentTurnedInIcon />}
        onClick={handleOpen}
        sx={{
          mt: "auto",
          color: getMainColor(),
          backgroundColor: "white",
          fontWeight: "bold",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.8)",
          },
        }}
      >
        Закрыть смену
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen
        TransitionComponent={Fade}
        transitionDuration={300}
        PaperProps={{
          sx: {
            borderRadius: 0,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: getMainColor(),
            color: "white",
            fontWeight: "bold",
            py: 1.5,
            fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
            textAlign: "center",
          }}
        >
          Подтверждение закрытия смены
        </DialogTitle>
        <DialogContent
          sx={{ p: { xs: 2, sm: 3, md: 4 }, mt: { xs: 0, sm: 1 } }}
        >
          <Box sx={{ maxWidth: "1600px", mx: "auto" }}>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                {/* Текущая дата и время */}
                <Box
                  sx={{
                    textAlign: "center",
                    mb: 3,
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                    border: "1px solid rgba(25, 118, 210, 0.2)",
                  }}
                >
                  <Typography variant="body1" color="primary" fontWeight="bold">
                    {new Date().toLocaleDateString("ru-RU", {
                      weekday: "short",
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}{" "}
                    •{" "}
                    {new Date().toLocaleTimeString("ru-RU", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        textAlign: "center",
                        p: { xs: 1, md: 2 },
                        borderRadius: 3,
                        backgroundColor: "rgba(25, 118, 210, 0.04)",
                        border: "1px solid rgba(25, 118, 210, 0.1)",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="h5"
                        color="primary"
                        fontWeight="bold"
                      >
                        {formatCurrency(totalRevenue)}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Общая выручка
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        textAlign: "center",
                        p: { xs: 1, md: 2 },
                        borderRadius: 3,
                        backgroundColor: "rgba(25, 118, 210, 0.08)",
                        border: "1px solid rgba(25, 118, 210, 0.2)",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        color="primary"
                        fontWeight="bold"
                      >
                        {formatCurrency(terminalRevenue)}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Безналичная выручка
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        textAlign: "center",
                        p: { xs: 1, md: 2 },
                        borderRadius: 3,
                        backgroundColor: "rgba(56, 142, 60, 0.1)",
                        border: "1px solid rgba(56, 142, 60, 0.2)",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="h5"
                        color="success.main"
                        fontWeight="bold"
                      >
                        {formatCurrency(cashRevenue)}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Наличная выручка
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 3,
                        backgroundColor: "rgba(25, 118, 210, 0.02)",
                        border: "1px solid rgba(25, 118, 210, 0.05)",
                        height: "100%",
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                          mb: 1,
                          color: "primary",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <CreditCardIcon fontSize="medium" />
                        Безналичные операции
                      </Typography>
                      <Box
                        sx={{
                          mb: 1,
                          p: 1,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Операции по терминалу
                        </Typography>
                        <Typography
                          variant="body1"
                          color="primary"
                          fontWeight="medium"
                        >
                          {formatCurrency(terminal)}
                        </Typography>
                      </Box>

                      {terminalReturnsDetails.length > 0 ? (
                        <Box
                          sx={{
                            mb: 1,
                            p: 1,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Возвраты по терминалу
                          </Typography>
                          <TableContainer
                            component={Paper}
                            variant="outlined"
                            sx={{ mb: 1 }}
                          >
                            <Table
                              size="small"
                              sx={{
                                "& td, & th": { py: 0.5, px: 1 },
                                "& tr:last-child td": { pb: 0.5 },
                                "& tr:first-child th": { pt: 0.5 },
                              }}
                            >
                              <TableHead>
                                <TableRow>
                                  <TableCell>Описание</TableCell>
                                  <TableCell align="right">Сумма</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {terminalReturnsDetails.map((item, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell
                                      align="right"
                                      sx={{ color: "error.main" }}
                                    >
                                      -{formatCurrency(item.amount)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                                <TableRow>
                                  <TableCell sx={{ fontWeight: "bold" }}>
                                    Итого
                                  </TableCell>
                                  <TableCell
                                    align="right"
                                    sx={{
                                      fontWeight: "bold",
                                      color: "error.main",
                                    }}
                                  >
                                    -{formatCurrency(terminalReturns)}
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            mb: 1,
                            p: 1,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Возвраты по терминалу
                          </Typography>
                          <Typography
                            variant="body1"
                            color="error"
                            fontWeight="medium"
                          >
                            -{formatCurrency(terminalReturns)}
                          </Typography>
                        </Box>
                      )}

                      <Box
                        sx={{
                          mb: 1,
                          p: 1,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Переводы на карту
                        </Typography>
                        {transfersDetails.length > 0 ? (
                          <TableContainer
                            component={Paper}
                            variant="outlined"
                            sx={{ mb: 1 }}
                          >
                            <Table
                              size="small"
                              sx={{
                                "& td, & th": { py: 0.5, px: 1 },
                                "& tr:last-child td": { pb: 0.5 },
                                "& tr:first-child th": { pt: 0.5 },
                              }}
                            >
                              <TableHead>
                                <TableRow>
                                  <TableCell>Описание</TableCell>
                                  <TableCell>Время</TableCell>
                                  <TableCell align="right">Сумма</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {transfersDetails.map((item, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell>
                                      {item.timestamp
                                        ? new Date(
                                            item.timestamp
                                          ).toLocaleString("ru-RU")
                                        : "—"}
                                    </TableCell>
                                    <TableCell
                                      align="right"
                                      sx={{ color: "primary.main" }}
                                    >
                                      {formatCurrency(item.amount)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                                <TableRow>
                                  <TableCell sx={{ fontWeight: "bold" }}>
                                    Итого
                                  </TableCell>
                                  <TableCell />
                                  <TableCell
                                    align="right"
                                    sx={{
                                      fontWeight: "bold",
                                      color: "primary.main",
                                    }}
                                  >
                                    {formatCurrency(terminalTransfer)}
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>
                        ) : (
                          <Typography
                            variant="body1"
                            color="primary"
                            fontWeight="medium"
                          >
                            {formatCurrency(terminalTransfer)}
                          </Typography>
                        )}
                      </Box>

                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: "rgba(25, 118, 210, 0.04)",
                          borderRadius: 2,
                          display: "flex",
                          justifyContent: "space-between",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold">
                          Итого безналичная выручка:
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          color="primary"
                          fontWeight="bold"
                        >
                          {formatCurrency(terminalRevenue)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        backgroundColor: "rgba(25, 118, 210, 0.02)",
                        border: "1px solid rgba(25, 118, 210, 0.05)",
                        height: "100%",
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                          mb: 1,
                          color: "primary",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <PaidIcon fontSize="small" />
                        Наличные операции
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <Box
                            sx={{
                              mb: 1,
                              p: 1,
                              border: "1px solid",
                              borderColor: "divider",
                              borderRadius: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Начальный остаток
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {formatCurrency(initialBalance)}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                          <Box
                            sx={{
                              mb: 1,
                              p: 1,
                              border: "1px solid",
                              borderColor: "divider",
                              borderRadius: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Наличные в кассе до инкассации
                            </Typography>
                            <Typography
                              variant="body1"
                              color="primary"
                              fontWeight="medium"
                            >
                              {formatCurrency(cashInRegister)}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                          <Box
                            sx={{
                              mb: 1,
                              p: 1,
                              border: "1px solid",
                              borderColor: "divider",
                              borderRadius: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Нал. выручка без вычета возвратов
                            </Typography>
                            <Typography
                              variant="body1"
                              color="success.main"
                              fontWeight="medium"
                            >
                              {formatCurrency(cashRevenue + cashReturns)}
                            </Typography>
                          </Box>
                        </Grid>

                        {expensesDetails.length > 0 ? (
                          <Grid item xs={12}>
                            <Box
                              sx={{
                                mb: 1,
                                p: 1,
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                gutterBottom
                              >
                                Расходы
                              </Typography>
                              <TableContainer
                                component={Paper}
                                variant="outlined"
                                sx={{ mb: 1 }}
                              >
                                <Table
                                  size="small"
                                  sx={{
                                    "& td, & th": { py: 0.5, px: 1 },
                                    "& tr:last-child td": { pb: 0.5 },
                                    "& tr:first-child th": { pt: 0.5 },
                                  }}
                                >
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Описание</TableCell>
                                      <TableCell align="right">Сумма</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {expensesDetails.map((item, index) => (
                                      <TableRow key={index}>
                                        <TableCell>
                                          {item.description}
                                        </TableCell>
                                        <TableCell
                                          align="right"
                                          sx={{ color: "error.main" }}
                                        >
                                          -{formatCurrency(item.amount)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                    <TableRow>
                                      <TableCell sx={{ fontWeight: "bold" }}>
                                        Итого
                                      </TableCell>
                                      <TableCell
                                        align="right"
                                        sx={{
                                          fontWeight: "bold",
                                          color: "error.main",
                                        }}
                                      >
                                        -{formatCurrency(expenses)}
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          </Grid>
                        ) : (
                          <Grid item xs={12} sm={6} md={4}>
                            <Box
                              sx={{
                                mb: 1,
                                p: 1,
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                gutterBottom
                              >
                                Расходы
                              </Typography>
                              <Typography
                                variant="body1"
                                color="error"
                                fontWeight="small"
                              >
                                -{formatCurrency(expenses)}
                              </Typography>
                            </Box>
                          </Grid>
                        )}

                        {cashReturnsDetails.length > 0 ? (
                          <Grid item xs={12}>
                            <Box
                              sx={{
                                mb: 1,
                                p: 1,
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                gutterBottom
                              >
                                Возвраты наличными
                              </Typography>
                              <TableContainer
                                component={Paper}
                                variant="outlined"
                                sx={{ mb: 1 }}
                              >
                                <Table
                                  size="small"
                                  sx={{
                                    "& td, & th": { py: 0.5, px: 1 },
                                    "& tr:last-child td": { pb: 0.5 },
                                    "& tr:first-child th": { pt: 0.5 },
                                  }}
                                >
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Описание</TableCell>
                                      <TableCell align="right">Сумма</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {cashReturnsDetails.map((item, index) => (
                                      <TableRow key={index}>
                                        <TableCell>
                                          {item.description}
                                        </TableCell>
                                        <TableCell
                                          align="right"
                                          sx={{ color: "error.main" }}
                                        >
                                          -{formatCurrency(item.amount)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                    <TableRow>
                                      <TableCell sx={{ fontWeight: "bold" }}>
                                        Итого
                                      </TableCell>
                                      <TableCell
                                        align="right"
                                        sx={{
                                          fontWeight: "bold",
                                          color: "error.main",
                                        }}
                                      >
                                        -{formatCurrency(cashReturns)}
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          </Grid>
                        ) : (
                          <Grid item xs={12} sm={6} md={4}>
                            <Box
                              sx={{
                                mb: 1,
                                p: 1,
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                gutterBottom
                              >
                                Возвраты наличными
                              </Typography>
                              <Typography
                                variant="body1"
                                color="error"
                                fontWeight="medium"
                              >
                                -{formatCurrency(cashReturns)}
                              </Typography>
                            </Box>
                          </Grid>
                        )}

                        {cashDepositsDetails.length > 0 ? (
                          <Grid item xs={12}>
                            <Box
                              sx={{
                                mb: 1,
                                p: 1,
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                gutterBottom
                              >
                                Внесения наличных
                              </Typography>
                              <TableContainer
                                component={Paper}
                                variant="outlined"
                                sx={{ mb: 1 }}
                              >
                                <Table
                                  size="small"
                                  sx={{
                                    "& td, & th": { py: 0.5, px: 1 },
                                    "& tr:last-child td": { pb: 0.5 },
                                    "& tr:first-child th": { pt: 0.5 },
                                  }}
                                >
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Описание</TableCell>
                                      <TableCell align="right">Сумма</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {cashDepositsDetails.map((item, index) => (
                                      <TableRow key={index}>
                                        <TableCell>
                                          {item.description}
                                        </TableCell>
                                        <TableCell
                                          align="right"
                                          sx={{ color: "primary.main" }}
                                        >
                                          {formatCurrency(item.amount)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                    <TableRow>
                                      <TableCell sx={{ fontWeight: "bold" }}>
                                        Итого
                                      </TableCell>
                                      <TableCell
                                        align="right"
                                        sx={{
                                          fontWeight: "bold",
                                          color: "primary.main",
                                        }}
                                      >
                                        {formatCurrency(cashDeposits)}
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          </Grid>
                        ) : (
                          <Grid item xs={12} sm={6} md={4}>
                            <Box
                              sx={{
                                mb: 1,
                                p: 1,
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                gutterBottom
                              >
                                Внесения наличных
                              </Typography>
                              <Typography
                                variant="body1"
                                color="primary"
                                fontWeight="medium"
                              >
                                {formatCurrency(cashDeposits)}
                              </Typography>
                            </Box>
                          </Grid>
                        )}

                        <Grid item xs={12} sm={6} md={4}>
                          <Box
                            sx={{
                              mb: 1,
                              p: 1,
                              border: "1px solid",
                              borderColor: "divider",
                              borderRadius: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Выемка из кассы (инкассация)
                            </Typography>
                            <Typography
                              variant="body1"
                              color="error"
                              fontWeight="medium"
                            >
                              -{formatCurrency(cashWithdrawal)}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <Box
                            sx={{
                              p: 2,
                              backgroundColor: "rgba(25, 118, 210, 0.04)",
                              borderRadius: 2,
                              display: "flex",
                              justifyContent: "space-between",
                              border: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            <Typography variant="subtitle1" fontWeight="bold">
                              Итого наличная выручка:
                            </Typography>
                            <Typography
                              variant="subtitle1"
                              color="primary"
                              fontWeight="bold"
                            >
                              {formatCurrency(cashRevenue)}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    mt: 1,
                    textAlign: "center",
                    p: 1,
                    borderRadius: 3,
                    backgroundColor: "rgba(25, 118, 210, 0.04)",
                    border: "1px solid rgba(25, 118, 210, 0.1)",
                  }}
                >
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    Конечный остаток: {formatCurrency(finalBalance)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Typography variant="body2" color="text.secondary">
              При закрытии смены все данные будут сохранены и отправлены в базу.
              После закрытия данные будут сброшены для новой смены, а конечный
              остаток станет начальным остатком для новой смены.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            position: "sticky",
            bottom: 0,
            px: { xs: 2, md: 4 },
            py: 2,
            bgcolor: "background.paper",
            borderTop: "1px solid rgba(0,0,0,0.08)",
          }}
        >
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
                px: 4,
                py: 1.25,
                borderRadius: "10px",
                minWidth: 180,
                fontSize: "1rem",
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSubmitClick}
              variant="contained"
              style={{ backgroundColor: getMainColor() }}
              disabled={isSubmitting}
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
              sx={{
                px: 4,
                py: 1.25,
                borderRadius: "10px",
                fontWeight: "bold",
                minWidth: 200,
                fontSize: "1rem",
              }}
            >
              {isSubmitting ? "Отправка..." : "Отправить данные"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Окно подтверждения */}
      <Dialog
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={300}
      >
        <DialogTitle
          sx={{
            backgroundColor: getMainColor(),
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Подтверждение
        </DialogTitle>
        <DialogContent sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Вы уверены, что хотите отправить данные смены? После отправки данные
            будут сохранены и сброшены для новой смены, а конечный остаток
            станет начальным остатком для новой смены.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: "center", gap: 2 }}>
          <Button
            onClick={() => setShowConfirmation(false)}
            variant="outlined"
            color="inherit"
            sx={{ px: 3, py: 1.25, borderRadius: "8px" }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleConfirmSubmit}
            variant="contained"
            style={{ backgroundColor: getMainColor() }}
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
            sx={{
              px: 3,
              py: 1.25,
              borderRadius: "8px",
              fontWeight: "bold",
            }}
          >
            {isSubmitting ? "Отправка..." : "Подтвердить"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={isErrorToastOpen}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          handleErrorToastClose();
        }}
        autoHideDuration={null}
      >
        <Alert
          onClose={handleErrorToastClose}
          severity="error"
          variant="filled"
          sx={{ width: "100%", minWidth: 360 }}
        >
          {submitError ||
            "Ошибка при отправке данных. Пожалуйста, попробуйте снова."}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ShiftSummary;
