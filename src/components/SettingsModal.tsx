import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  IconButton,
  Grid,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from "@mui/icons-material/Settings";
import ResetIcon from "@mui/icons-material/RestartAlt";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { CardColors, useSettings } from "../context/SettingsContext";

// Color options - preset color palette
const colorOptions = [
  // Blues
  "#1976d2",
  "#0288d1",
  "#0097a7",
  "#00838f",
  "#006064",
  // Purples
  "#7b1fa2",
  "#6a1b9a",
  "#4a148c",
  "#9c27b0",
  "#8e24aa",
  // Reds
  "#d32f2f",
  "#c62828",
  "#b71c1c",
  "#f44336",
  "#e53935",
  // Oranges
  "#f57c00",
  "#ef6c00",
  "#e65100",
  "#ff9800",
  "#fb8c00",
  // Greens
  "#388e3c",
  "#2e7d32",
  "#1b5e20",
  "#4caf50",
  "#43a047",
  // Brown/Gray
  "#5d4037",
  "#4e342e",
  "#3e2723",
  "#607d8b",
  "#455a64",
];

// Card name translations for the UI
const cardNameTranslations: Record<keyof CardColors, string> = {
  initialBalance: "Начальный остаток",
  cashReturns: "Возврат наличными",
  terminal: "Терминал",
  expenses: "Расходы",
  cashDeposits: "Внесение наличных в кассу",
  cashInRegister: "Наличные в кассе",
  cashWithdrawal: "Выемка из кассы",
  shiftSummary: "Закрытие смены",
};

// Create a color swatch component for the color picker
const ColorSwatch: React.FC<{
  color: string;
  selected: boolean;
  onClick: () => void;
}> = ({ color, selected, onClick }) => (
  <Tooltip title={color}>
    <Box
      onClick={onClick}
      sx={{
        width: 30,
        height: 30,
        borderRadius: "4px",
        backgroundColor: color,
        cursor: "pointer",
        border: selected ? "2px solid black" : "2px solid transparent",
        "&:hover": {
          opacity: 0.8,
          transform: "scale(1.1)",
        },
        transition: "all 0.2s ease",
      }}
    />
  </Tooltip>
);

// Settings Modal component
const SettingsModal: React.FC = () => {
  const { cardColors, updateCardColor, resetColors } = useSettings();
  const [open, setOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | false>(
    "colors"
  );

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleReset = () => {
    resetColors();
  };

  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedSection(isExpanded ? panel : false);
    };

  return (
    <>
      <Tooltip title="Настройки">
        <IconButton color="inherit" onClick={handleOpen}>
          <SettingsIcon />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#f5f5f5",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <SettingsIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Настройки</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Accordion
            expanded={expandedSection === "colors"}
            onChange={handleAccordionChange("colors")}
            sx={{ mb: 2 }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ backgroundColor: "#f9f9f9" }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                Цвета карточек
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Выберите цвет для каждой карточки
                </Typography>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ResetIcon />}
                  onClick={handleReset}
                  sx={{ mb: 2 }}
                >
                  Сбросить к исходным цветам
                </Button>

                <Grid container spacing={3}>
                  {Object.keys(cardColors).map((cardKey) => (
                    <Grid item key={cardKey} xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          {cardNameTranslations[cardKey as keyof CardColors]}
                        </Typography>
                        <Grid container spacing={1}>
                          {colorOptions.map((color) => (
                            <Grid item key={color}>
                              <ColorSwatch
                                color={color}
                                selected={
                                  cardColors[cardKey as keyof CardColors] ===
                                  color
                                }
                                onClick={() =>
                                  updateCardColor(
                                    cardKey as keyof CardColors,
                                    color
                                  )
                                }
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </AccordionDetails>
          </Accordion>
        </DialogContent>

        <DialogActions sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
          <Button onClick={handleClose} variant="contained">
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SettingsModal;
