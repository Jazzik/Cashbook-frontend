import React from "react";
import { Box, Button, Typography } from "@mui/material";

interface ShiftClosedScreenProps {
  onOpenNewShift: () => void;
}

const ShiftClosedScreen: React.FC<ShiftClosedScreenProps> = ({ onOpenNewShift }) => {
  return (
    <Box
      sx={{
        backgroundColor: "#ffffff",
        width: "100%",
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        px: 2,
      }}
    >
      <Typography
        variant="h3"
        align="center"
        sx={{ fontWeight: "bold", color: "error.main" }}
      >
        Смена закрыта
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={onOpenNewShift}
        sx={{
          mt: 2,
          px: 4,
          py: 1.5,
          borderRadius: 2,
          fontWeight: "bold",
        }}
      >
        Открыть новую смену
      </Button>
    </Box>
  );
};

export default ShiftClosedScreen;


