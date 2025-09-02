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
}

const DenominationInput: React.FC<DenominationInputProps> = ({
  title,
  initialDenominations = emptyDenominations,
  onChange,
  readOnly = false,
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
      color: "#4CAF50",
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
      color: "#9C27B0",
    },
    {
      name: "note500",
      label: "500 ₽",
      value: denominations.note500,
      color: "#FF9800",
    },
    {
      name: "note200",
      label: "200 ₽",
      value: denominations.note200,
      color: "#795548",
    },
    {
      name: "note100",
      label: "100 ₽",
      value: denominations.note100,
      color: "#E91E63",
    },
    {
      name: "note50",
      label: "50 ₽",
      value: denominations.note50,
      color: "#607D8B",
    },
    {
      name: "coin10",
      label: "10 ₽",
      value: denominations.coin10,
      color: "#FF5722",
    },
    {
      name: "coin5",
      label: "5 ₽",
      value: denominations.coin5,
      color: "#673AB7",
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
          {denominationItems.map((item) => (
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
                  fontSize: "0.85rem",
                  height: "24px",
                  minWidth: "80px",
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
                    disabled={readOnly}
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
              </Box>
            </Box>
          ))}
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
