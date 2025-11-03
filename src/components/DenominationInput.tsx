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
  // Храним строковые значения для полей ввода, чтобы корректно работать с пустой строкой
  const [inputValues, setInputValues] = useState<Record<string, string>>({
    note5000: String(initialDenominations.note5000 ?? 0),
    note2000: String(initialDenominations.note2000 ?? 0),
    note1000: String(initialDenominations.note1000 ?? 0),
    note500: String(initialDenominations.note500 ?? 0),
    note200: String(initialDenominations.note200 ?? 0),
    note100: String(initialDenominations.note100 ?? 0),
    note50: String(initialDenominations.note50 ?? 0),
    coin10: String(initialDenominations.coin10 ?? 0),
    coin5: String(initialDenominations.coin5 ?? 0),
    coin2: String(initialDenominations.coin2 ?? 0),
    coin1: String(initialDenominations.coin1 ?? 0),
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    let { value } = e.target;

    // Разрешаем только цифры
    value = value.replace(/\D+/g, "");

    // Убираем лидирующие нули (кроме единственного нуля)
    if (value.length > 1) {
      value = value.replace(/^0+/, "");
    }

    // Обновляем отображаемое значение сразу
    setInputValues((prev) => ({ ...prev, [name]: value }));

    // Пустая строка не обновляет счётчик, ждём blur или следующего ввода
    if (value === "") return;

    let numberValue = parseInt(value, 10) || 0;

    // Применяем лимиты, если заданы доступные купюры
    if (availableDenominations) {
      const availableValue =
        availableDenominations[name as keyof Denominations] || 0;
      numberValue = Math.min(numberValue, availableValue);
      // Если после клэмпа число стало меньше исходного — обновим строку тоже
      if (String(numberValue) !== value) {
        setInputValues((prev) => ({ ...prev, [name]: String(numberValue) }));
      }
    }

    updateDenomination(name, numberValue);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const current = inputValues[name] ?? "0";
    if (current === "0") {
      // Очищаем, чтобы первый введённый символ заменял 0
      setInputValues((prev) => ({ ...prev, [name]: "" }));
    } else {
      // Выделяем весь текст для удобной замены
      requestAnimationFrame(() => {
        e.target.select();
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const current = inputValues[name];
    if (current === "" || current == null) {
      // Возвращаем 0, если все символы стерты
      setInputValues((prev) => ({ ...prev, [name]: "0" }));
      updateDenomination(name, 0);
      return;
    }
    // Синхронизируем число (на случай, если остались лидирующие нули)
    const normalized = String(parseInt(current, 10) || 0);
    if (normalized !== current) {
      setInputValues((prev) => ({ ...prev, [name]: normalized }));
    }
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
    // Синхронизируем строковое отображение с числом
    setInputValues((prev) => ({ ...prev, [name]: String(value) }));
    const newTotal = calculateTotal(updatedDenominations);
    setTotal(newTotal);
    onChange(updatedDenominations, newTotal);
  };

  // Update component state when initialDenominations changes
  useEffect(() => {
    setDenominations(initialDenominations);
    setTotal(calculateTotal(initialDenominations));
    setInputValues({
      note5000: String(initialDenominations.note5000 ?? 0),
      note2000: String(initialDenominations.note2000 ?? 0),
      note1000: String(initialDenominations.note1000 ?? 0),
      note500: String(initialDenominations.note500 ?? 0),
      note200: String(initialDenominations.note200 ?? 0),
      note100: String(initialDenominations.note100 ?? 0),
      note50: String(initialDenominations.note50 ?? 0),
      coin10: String(initialDenominations.coin10 ?? 0),
      coin5: String(initialDenominations.coin5 ?? 0),
      coin2: String(initialDenominations.coin2 ?? 0),
      coin1: String(initialDenominations.coin1 ?? 0),
    });
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
                    type="text"
                    value={inputValues[item.name] ?? "0"}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    inputMode="numeric"
                    InputProps={{
                      readOnly: readOnly,
                      inputProps: {
                        inputMode: "numeric",
                        pattern: "[0-9]*",
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
