"use client";

import {
  Box,
  TextField,
  Typography,
  InputAdornment,
  Grid
} from "@mui/material";
import { getPaymentMethodsList, requiresPhone } from "@/constants/paymentMethods";

/**
 * PaymentMethodSelector Component
 * Displays payment method options with icons/images and optional phone input
 * 
 * @param {string} paymentMethod - Currently selected payment method
 * @param {function} onPaymentMethodChange - Callback when payment method changes
 * @param {string} phone - Phone number (for mobile money methods)
 * @param {function} onPhoneChange - Callback when phone changes
 * @param {string} type - "debt" or "sales" (for determining which methods list to use)
 * @param {boolean} compact - If true, uses smaller buttons (optional)
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
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
        Payment Method <span style={{ color: "#d32f2f" }}>*</span>
      </Typography>

      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {methods.map((method) => (
          <Grid
            item
            xs={6}
            sm={compact ? 4 : 3}
            key={method.id}
          >
            <Box
              onClick={() => onPaymentMethodChange(method.id)}
              sx={{
                border: `2px solid ${
                  paymentMethod === method.id ? "#FF6D00" : "#e0e0e0"
                }`,
                borderRadius: 2,
                p: compact ? 1 : 1.5,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: paymentMethod === method.id ? "#FFF3E0" : "white",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#FF6D00",
                  bgcolor: "#fff8f0"
                },
                height: compact ? 70 : 100,
                textAlign: "center"
              }}
            >
              {method.image ? (
                <Box
                  component="img"
                  src={method.image}
                  alt={method.label}
                  sx={{
                    height: compact ? 24 : 32,
                    width: "auto",
                    maxWidth: "100%",
                    objectFit: "contain",
                    mb: compact ? 0.25 : 0.5,
                    filter:
                      paymentMethod === method.id ? "none" : "grayscale(100%)",
                    opacity: paymentMethod === method.id ? 1 : 0.7
                  }}
                />
              ) : method.icon ? (
                <Typography
                  variant={compact ? "body1" : "h5"}
                  sx={{ mb: compact ? 0.25 : 0.5 }}
                >
                  {method.icon}
                </Typography>
              ) : null}
              <Typography
                variant={compact ? "caption" : "caption"}
                fontWeight={600}
                color={
                  paymentMethod === method.id ? "#E65100" : "text.secondary"
                }
                sx={{
                  fontSize: compact ? "10px" : "12px"
                }}
              >
                {method.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Conditional Phone Input for Mobile Payments */}
      {isPhoneRequired && (
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label={`Phone Number for ${
              methods.find((m) => m.id === paymentMethod)?.label
            }`}
            value={phone}
            onChange={(e) => {
              const value = e.target.value;
              onPhoneChange(value);
            }}
            placeholder="e.g. +250788123456"
            type="tel"
            helperText={`Enter the phone number to be used for ${
              methods.find((m) => m.id === paymentMethod)?.label
            } payment`}
            error={!phone || phone.length < 10}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: "#FF6D00"
                }
              },
              "& .MuiOutlinedInput-input::placeholder": {
                opacity: 0.7
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default PaymentMethodSelector;
