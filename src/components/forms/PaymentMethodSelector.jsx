"use client";

import {
  Box,
  TextField,
  Typography,
  InputAdornment,
  Grid
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getPaymentMethodsList, requiresPhone } from "@/constants/paymentMethods";

/**
 * PaymentMethodSelector Component
 * Displays payment method options with icons/images and optional phone input
 */
const PaymentMethodSelector = ({
  paymentMethod,
  onPaymentMethodChange,
  phone = "",
  onPhoneChange,
  type = "debt",
  compact = false
}) => {
  const methods = getPaymentMethodsList(type);
  const isPhoneRequired = requiresPhone(paymentMethod, type);

  return (
    <Box sx={{ width: "100%" }}>
      {/* Payment Method Grid */}
      <Typography variant="subtitle2" sx={{ mb: 1.5, color: "text.secondary", fontWeight: 600, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
        Select Payment Method <span style={{ color: "#EF4444" }}>*</span>
      </Typography>

      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {methods.map((method) => {
          const isSelected = paymentMethod === method.id;
          return (
            <Grid
              item
              xs={4}
              sm={compact ? 4 : 4}
              md={compact ? 4 : 2.4} // 5 items per row on large screens
              key={method.id}
            >
              <Box
                onClick={() => onPaymentMethodChange(method.id)}
                sx={{
                  position: "relative",
                  border: `1.5px solid ${isSelected ? "#FF6D00" : "#E5E7EB"}`,
                  borderRadius: "12px",
                  p: { xs: 1.5, sm: 2 },
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: isSelected ? "#FFF7ED" : "white",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  height: { xs: 80, sm: 100 },
                  textAlign: "center",
                  "&:hover": {
                    borderColor: "#FF6D00",
                    bgcolor: "#FFF7ED",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(255, 109, 0, 0.08)"
                  },
                  "&::after": isSelected ? {
                    content: '""',
                    position: "absolute",
                    top: -1,
                    bottom: -1,
                    left: -1,
                    right: -1,
                    borderRadius: "12px",
                    border: "1px solid #FF6D00",
                    pointerEvents: "none"
                  } : {}
                }}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <CheckCircleIcon
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      fontSize: 18,
                      color: "#FF6D00"
                    }}
                  />
                )}

                <Box sx={{
                  height: { xs: 30, sm: 40 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: { xs: 1, sm: 1.5 }
                }}>
                  {method.image ? (
                    <Box
                      component="img"
                      src={method.image}
                      alt={method.label}
                      sx={{
                        height: "100%",
                        width: "auto",
                        maxWidth: "100%",
                        objectFit: "contain",
                        opacity: isSelected ? 1 : 0.8,
                        transition: "opacity 0.3s ease"
                      }}
                    />
                  ) : (
                    <Typography
                      variant="h4"
                      sx={{
                        opacity: isSelected ? 1 : 0.5,
                        fontSize: "2rem"
                      }}
                    >
                      {method.icon}
                    </Typography>
                  )}
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? "#9A3412" : "#4B5563",
                    fontSize: "0.75rem",
                    transition: "color 0.3s ease"
                  }}
                >
                  {method.label}
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* Conditional Phone Input for Mobile Payments */}
      {isPhoneRequired && (
        <Box sx={{
          mb: 2,
          p: { xs: 2.5, sm: 3 },
          borderRadius: "12px",
          bgcolor: "#F9FAFB",
          border: "1px solid #E5E7EB",
          animation: "fadeIn 0.3s ease-out"
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: "text.primary" }}>
            Payment Phone Number
          </Typography>
          <TextField
            fullWidth
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="e.g. 07XXXXXXXX"
            type="tel"
            error={phone && phone.length < 10}
            helperText={phone && phone.length < 10 ? "Please enter a valid phone number" : `Funds will be requested from this number via ${methods.find((m) => m.id === paymentMethod)?.label}`}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box sx={{ color: "#6B7280", fontWeight: 600 }}>+250</Box>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                bgcolor: "white",
                "&.Mui-focused fieldset": {
                  borderColor: "#FF6D00"
                }
              }
            }}
          />
        </Box>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
};

export default PaymentMethodSelector;
