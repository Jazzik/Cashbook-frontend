import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Paper,
  Chip,
  ButtonGroup,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Denominations, emptyDenominations } from "../types";
import { calculateTotal, formatCurrency } from "../utils/calculations";
import { TEXT_FIELD_STYLES } from "../styles";

interface DenominationInputProps {
  title: string;
  initialDenominations?: Denominations;
  onChange: (denominations: Denominations, total: number) => void;
  readOnly?: boolean;
  availableDenominations?: Denominations; // Доступные купюры в кассе
}

const DenominationInput: React.FC<DenominationInputProps> = ({
  title,
  initialDenominations = emptyDenominations,
  onChange,
  readOnly = false,
  availableDenominations,
}) => {
  const [denominations, setDenominations] =
    useState<Denominations>(initialDenominations);
  const [total, setTotal] = useState<number>(
    calculateTotal(initialDenominations)
  );

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = parseInt(value) || 0;
    updateDenomination(name, numberValue);
  };

  // Increment and decrement functions
  const incrementValue = (name: string) => {
    const currentValue = denominations[name as keyof Denominations] as number;
    const availableValue =
      availableDenominations?.[name as keyof Denominations] || 0;

    // Проверяем, не превышает ли новое значение доступное количество
    if (availableDenominations && currentValue >= availableValue) {
      return; // Не увеличиваем, если достигли лимита
    }

    updateDenomination(name, currentValue + 1);
  };

  const decrementValue = (name: string) => {
    const currentValue = denominations[name as keyof Denominations] as number;
    if (currentValue > 0) {
      updateDenomination(name, currentValue - 1);
    }
  };

  // Common function to update denomination
  const updateDenomination = (name: string, value: number) => {
    // Проверяем лимиты, если доступные купюры заданы
    if (availableDenominations) {
      const availableValue =
        availableDenominations[name as keyof Denominations] || 0;
      value = Math.min(value, availableValue); // Не позволяем превысить доступное количество
    }

    // Не позволяем отрицательные значения
    value = Math.max(0, value);

    const updatedDenominations = {
      ...denominations,
      [name]: value,
    };

    setDenominations(updatedDenominations);
    const newTotal = calculateTotal(updatedDenominations);
    setTotal(newTotal);
    onChange(updatedDenominations, newTotal);
  };

  // Update component state when initialDenominations changes
  useEffect(() => {
    setDenominations(initialDenominations);
    setTotal(calculateTotal(initialDenominations));
  }, [initialDenominations]);

  // Define denomination items with their labels and values
  const denominationItems = [
    {
      name: "note5000",
      label: "5000 ₽",
      value: denominations.note5000,
      color: "#EC7C04FF",
    },
    {
      name: "note2000",
      label: "2000 ₽",
      value: denominations.note2000,
      color: "#2196F3",
    },
    {
      name: "note1000",
      label: "1000 ₽",
      value: denominations.note1000,
      color: "#7EB6CCFF",
    },
    {
      name: "note500",
      label: "500 ₽",
      value: denominations.note500,
      color: "#F24C4CFF",
    },
    {
      name: "note200",
      label: "200 ₽",
      value: denominations.note200,
      color: "#4B9F42FF",
    },
    {
      name: "note100",
      label: "100 ₽",
      value: denominations.note100,
      color: "#D5AB41FF",
    },
    {
      name: "note50",
      label: "50 ₽",
      value: denominations.note50,
      color: "#85A8BAFF",
    },
    {
      name: "coin10",
      label: "10 ₽",
      value: denominations.coin10,
      color: "#7DCC96FF",
    },
    {
      name: "coin5",
      label: "5 ₽",
      value: denominations.coin5,
      color: "#7F7D82FF",
    },
    {
      name: "coin2",
      label: "2 ₽",
      value: denominations.coin2,
      color: "#3F51B5",
    },
    {
      name: "coin1",
      label: "1 ₽",
      value: denominations.coin1,
      color: "#00BCD4",
    },
  ];

  // Number of rows to fill the first column before wrapping to the second
  const gridRows = Math.ceil(denominationItems.length / 2);

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2, borderRadius: "12px" }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#424242" }}
      >
        {title}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gridAutoFlow: "column",
            gridTemplateRows: `repeat(${gridRows}, auto)` as any,
            gap: 2,
            "@media (max-width: 600px)": {
              gridTemplateColumns: "1fr",
              gridAutoFlow: "row",
              gridTemplateRows: "none",
            },
          }}
        >
          {denominationItems.map((item) => {
            const availableValue =
              availableDenominations?.[item.name as keyof Denominations] || 0;
            const isAtLimit =
              availableDenominations && item.value >= availableValue;

            return (
              <Box
                key={item.name}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Chip
                  label={item.label}
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: item.color,
                    color: "white",
                    fontSize: "1.2rem",
                    height: "40px",
                    minWidth: "100px",
                  }}
                />
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <ButtonGroup size="small" variant="outlined">
                    <Button
                      onClick={() => decrementValue(item.name)}
                      disabled={
                        readOnly ||
                        denominations[item.name as keyof Denominations] === 0
                      }
                      sx={{
                        minWidth: "32px",
                        height: "32px",
                        fontSize: "1rem",
                        borderColor: item.color,
                        color: item.color,
                        "&:hover": {
                          borderColor: item.color,
                          backgroundColor: `${item.color}10`,
                        },
                      }}
                    >
                      <RemoveIcon fontSize="small" />
                    </Button>
                    <Button
                      onClick={() => incrementValue(item.name)}
                      disabled={readOnly || isAtLimit}
                      sx={{
                        minWidth: "32px",
                        height: "32px",
                        fontSize: "1rem",
                        borderColor: item.color,
                        color: item.color,
                        "&:hover": {
                          borderColor: item.color,
                          backgroundColor: `${item.color}10`,
                        },
                      }}
                    >
                      <AddIcon fontSize="small" />
                    </Button>
                  </ButtonGroup>
                  <TextField
                    name={item.name}
                    type="number"
                    value={item.value}
                    onChange={handleChange}
                    InputProps={{
                      readOnly: readOnly,
                      inputProps: {
                        min: 0,
                        max: availableDenominations
                          ? availableValue
                          : undefined,
                      },
                      sx: {
                        "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                          {
                            display: "none",
                          },
                      },
                    }}
                    variant="outlined"
                    size="small"
                    sx={{
                      width: "80px",
                      ...TEXT_FIELD_STYLES.denomination,
                    }}
                  />
                  {availableDenominations && (
                    <Typography
                      variant="body1"
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.9rem",
                        fontWeight: "bold",
                        minWidth: "50px",
                        textAlign: "center",
                      }}
                    >
                      /{availableValue}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box
        mt={2}
        sx={{
          textAlign: "right",
          backgroundColor: "#f5f5f5",
          p: 1.5,
          borderRadius: "8px",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1976d2" }}>
          Итого: {formatCurrency(total)}
        </Typography>
      </Box>
    </Paper>
  );
};

export default DenominationInput;
