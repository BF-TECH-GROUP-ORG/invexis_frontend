"use client";
    import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
  CircularProgress,
  Card,
} from "@mui/material";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Paper,
  InputAdornment,
  Select,
} from "@mui/material";
import { HiArrowRight, HiArrowLeft } from "react-icons/hi2";
import { ThemeRegistry } from "@/providers/ThemeRegistry";
import { useMutation } from "@tanstack/react-query";
import { createWorker } from "@/services/workersService";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

const positions = [
  "Sales Representative",
  "Cashier",
  "Manager",
  "Stock Keeper",
];

const departments = ["sales", "finance", "logistics", "hr"];

const genders = ["male", "female", "other"];

const steps = ["Personal Information", "Job Information", "Contact & Address"];

export default function AddWorkerForm() {
  const router = useRouter();
  const locale = useLocale();
  const [activeStep, setActiveStep] = useState(0);

  const [worker, setWorker] = useState({
    firstName: "",
    lastName: "",
    // username: "",
    email: "",
    phone: "",
    countryCode: "+250",
    password: "",
    role: "worker",
    dateOfBirth: "",
    gender: "",
    nationalId: "",
    position: "",
    department: "",
    companies: ["09a89de8-4a0f-4f40-a4ce-bcef7bfc364d"], // TODO: Fetch from API or context
    shops: ["shop-uuid-123"], // TODO: Fetch from API or context
    emergencyContact: { name: "", phone: "" },
    address: { street: "", city: "", state: "", postalCode: "", country: "" },
    preferences: {
      language: "en",
      notifications: { email: true, sms: true, inApp: true },
    },
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [errorDialog, setErrorDialog] = useState({
    open: false,
    message: "",
    details: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange = (key, value) => {
    setWorker((prev) => ({ ...prev, [key]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleNestedChange = (parent, key, value) => {
    setWorker((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [key]: value },
    }));
    // Clear nested field error
    const errorKey = `${parent}.${key}`;
    if (fieldErrors[errorKey]) {
      setFieldErrors((prev) => ({ ...prev, [errorKey]: "" }));
    }
  };

  // Get errors for a specific step
  const getStepErrors = (step) => {
    const errors = {};

    if (step === 0) {
      // Personal Information validation
      if (!worker.firstName.trim()) errors.firstName = "First name is required";
      if (!worker.lastName.trim()) errors.lastName = "Last name is required";
      // if (!worker.username.trim()) errors.username = "Username is required";
      if (!worker.email.trim()) {
        errors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(worker.email)) {
        errors.email = "Email is invalid";
      }
      if (!worker.phone.trim()) {
        errors.phone = "Phone is required";
      } else if (!/^\+?[1-9]\d{1,14}$/.test(worker.phone.replace(/[\s-=]/g, ""))) {
        errors.phone = "Invalid phone format (e.g., +250...)";
      }
      if (!worker.password.trim()) {
        errors.password = "Password is required";
      } else if (worker.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }
      if (!worker.gender) errors.gender = "Gender is required";
    }

    if (step === 1) {
      // Job Information validation
      if (!worker.position) errors.position = "Position is required";
      if (!worker.department) errors.department = "Department is required";
      if (worker.nationalId && !/^[A-Z0-9]{5,20}$/.test(worker.nationalId)) {
        errors.nationalId = "National ID must be 5-20 uppercase alphanumeric characters";
      }
    }

    if (step === 2) {
      // Contact & Address validation
      if (!worker.emergencyContact.name.trim()) {
        errors["emergencyContact.name"] = "Emergency contact name is required";
      }

      if (!worker.emergencyContact.phone.trim()) {
        errors["emergencyContact.phone"] = "Emergency contact phone is required";
      } else if (!/^\+?[1-9]\d{1,14}$/.test(worker.emergencyContact.phone.replace(/[\s-]/g, ""))) {
        errors["emergencyContact.phone"] = "Invalid phone format (e.g., +250...)";
      }

      // Address validation
      if (!worker.address.street.trim()) errors["address.street"] = "Street is required";
      if (!worker.address.city.trim()) errors["address.city"] = "City is required";
      if (!worker.address.state.trim()) errors["address.state"] = "State is required";
      if (!worker.address.postalCode.trim()) errors["address.postalCode"] = "Postal code is required";
      if (!worker.address.country.trim()) errors["address.country"] = "Country is required";
    }

    return errors;
  };

  // Validate current step
  const validateStep = (step) => {
    const errors = getStepErrors(step);
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate ALL steps
  const validateAllSteps = () => {
    let allErrors = {};
    let firstErrorStep = -1;

    for (let i = 0; i < steps.length; i++) {
      const stepErrors = getStepErrors(i);
      if (Object.keys(stepErrors).length > 0) {
        allErrors = { ...allErrors, ...stepErrors };
        if (firstErrorStep === -1) firstErrorStep = i;
      }
    }

    setFieldErrors(allErrors);
    return { isValid: Object.keys(allErrors).length === 0, firstErrorStep };
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Create worker mutation
  const createWorkerMutation = useMutation({
    mutationFn: createWorker,
    onSuccess: (data) => {
      setSnackbar({
        open: true,
        message: "Worker created successfully!",
        severity: "success",
      });

      // Redirect to workers list after 1.5 seconds
      setTimeout(() => {
        router.push(`/${locale}/inventory/workers/list`);
      });
    },
    onError: (error) => {
      console.error("Worker creation error:", error);
      const errorMessage = error.response?.data?.message ||
        error.message ||
        "Failed to create worker. Please check your connection and try again.";

      setErrorDialog({
        open: true,
        message: errorMessage,
        details: error.response?.data || null,
      });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate ALL steps before submission
    const { isValid, firstErrorStep } = validateAllSteps();

    if (!isValid) {
      // If there are errors, go to the first step with errors
      if (firstErrorStep !== -1) {
        setActiveStep(firstErrorStep);
      }
      return;
    }

    // Prepare payload
    const payload = { ...worker };

    // Clean payload based on backend requirements
    delete payload.username; // Backend says "username" is not allowed
    delete payload.department; // Backend says "department" is not allowed

    // Format fields
    if (payload.nationalId) {
      payload.nationalId = payload.nationalId.toUpperCase().replace(/[^A-Z0-9]/g, "");
    }

    if (payload.emergencyContact?.phone) {
      payload.emergencyContact.phone = payload.emergencyContact.phone.replace(/[\s-]/g, "");
    }

    if (payload.phone) {
      payload.phone = payload.phone.replace(/[\s-=]/g, "");
    }

    // Submit to backend
    await createWorkerMutation.mutateAsync(payload);
  };

  // Render step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Typography variant="h6" fontWeight={600} color="#081422" gutterBottom>
              Personal Information
            </Typography>
            <div className="flex gap-4 w-full">
              <TextField
                label="First Name"
                value={worker.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                required
                error={!!fieldErrors.firstName}
                helperText={fieldErrors.firstName}
                fullWidth
              />
              <TextField
                label="Last Name"
                value={worker.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                required
                error={!!fieldErrors.lastName}
                helperText={fieldErrors.lastName}
                fullWidth
              />
            </div>
            {/* <TextField
              label="Username"
              value={worker.username}
              onChange={(e) => handleChange("username", e.target.value)}
              required
              error={!!fieldErrors.username}
              helperText={fieldErrors.username}
              fullWidth
            /> */}

            <TextField
              label="Email"
              type="email"
              value={worker.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              fullWidth
            />
            <TextField
  label="Phone"
  value={
    worker.phone.startsWith(worker.countryCode || "+250")
      ? worker.phone.slice((worker.countryCode || "+250").length)
      : worker.phone
  }
  onChange={(e) => {
    const code = worker.countryCode || "+250";
    handleChange("phone", code + e.target.value);
  }}
  required
  error={!!fieldErrors.phone}
  helperText={fieldErrors.phone}
  fullWidth
  variant="outlined"   // ← gives the border you want
  InputProps={{
    startAdornment: (
      <InputAdornment position="start" sx={{ p: 0 }}>
        <Select
          value={worker.countryCode || "+250"}
          onChange={(e) => {
            const newCode = e.target.value;
            const currentCode = worker.countryCode || "+250";
            const currentLocal = worker.phone.startsWith(currentCode)
              ? worker.phone.slice(currentCode.length)
              : worker.phone;

            handleChange("countryCode", newCode);
            handleChange("phone", newCode + currentLocal);
          }}
          variant="standard"
          disableUnderline
          sx={{
            background: "transparent",

            // remove all borders, focus rings, hover states
            "& .MuiSelect-select": {
              padding: 0,
              paddingRight: "6px !important",
              border: "none !important",
              outline: "none !important",
              background: "transparent",
            },
            "& .MuiSelect-select:focus": {
              outline: "none !important",
              background: "transparent",
            },
            "& fieldset": { border: "none" },
            "&:hover": { background: "transparent" },
            "&.Mui-focused": {
              outline: "none !important",
              border: "none !important",
              background: "transparent",
            }
          }}
          MenuProps={{
            PaperProps: { sx: { maxHeight: 300 } }
          }}
        >
          {[
            { code: "+250", flag: "🇷🇼" },
            { code: "+255", flag: "🇹🇿" },
            { code: "+256", flag: "🇺🇬" },
            { code: "+257", flag: "🇧🇮" },
            { code: "+243", flag: "🇨🇩" },
          ].map((option) => (
            <MenuItem key={option.code} value={option.code}>
              <span style={{ marginRight: "8px", fontSize: "1.2rem" }}>
                {option.flag}
              </span>
              {option.code}
            </MenuItem>
          ))}
        </Select>

        {/* Divider like the screenshot */}
        <div
          style={{
            width: "1px",
            height: "26px",
            background: "#ccc",
            marginLeft: "6px",
            marginRight: "8px",
          }}
        />
      </InputAdornment>
    ),
  }}
  sx={{
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      background: "transparent",
    },
    "& .MuiOutlinedInput-input": {
      paddingLeft: "4px", // ensures typing is not blocked
    }
  }}
/>

            <TextField
              label="Password"
              type="password"
              value={worker.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              fullWidth
            />
            <TextField
              label="Date of Birth"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={worker.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              fullWidth
            />
            <TextField
              select
              label="Gender"
              value={worker.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              required
              error={!!fieldErrors.gender}
              helperText={fieldErrors.gender}
              fullWidth
            >
              {genders.map((g) => (
                <MenuItem key={g} value={g}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Typography variant="h6" fontWeight={600} color="#081422" gutterBottom>
              Job Information
            </Typography>
            <TextField
              label="National ID"
              value={worker.nationalId}
              onChange={(e) => handleChange("nationalId", e.target.value.toUpperCase())}
              error={!!fieldErrors.nationalId}
              helperText={fieldErrors.nationalId}
              fullWidth
            />
            <TextField
              select
              label="Position"
              value={worker.position}
              onChange={(e) => handleChange("position", e.target.value)}
              required
              error={!!fieldErrors.position}
              helperText={fieldErrors.position}
              fullWidth
            >
              {positions.map((pos) => (
                <MenuItem key={pos} value={pos}>
                  {pos}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Department"
              value={worker.department}
              onChange={(e) => handleChange("department", e.target.value)}
              required
              error={!!fieldErrors.department}
              helperText={fieldErrors.department}
              fullWidth
            >
              {departments.map((dep) => (
                <MenuItem key={dep} value={dep}>
                  {dep.charAt(0).toUpperCase() + dep.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Typography variant="h6" fontWeight={600} color="#081422" gutterBottom>
              Emergency Contact
            </Typography>
            <TextField
              label="Emergency Contact Name"
              value={worker.emergencyContact.name}
              onChange={(e) =>
                handleNestedChange("emergencyContact", "name", e.target.value)
              }
              required
              error={!!fieldErrors["emergencyContact.name"]}
              helperText={fieldErrors["emergencyContact.name"]}
              fullWidth
            />
            <TextField
              label="Emergency Contact Phone"
              value={worker.emergencyContact.phone}
              onChange={(e) =>
                handleNestedChange("emergencyContact", "phone", e.target.value)
              }
              required
              error={!!fieldErrors["emergencyContact.phone"]}
              helperText={fieldErrors["emergencyContact.phone"]}
              fullWidth
            />

            <Typography variant="h6" fontWeight={600} color="#081422" gutterBottom sx={{ mt: 2 }}>
              Address
            </Typography>
            <TextField
              label="Street"
              value={worker.address.street}
              onChange={(e) =>
                handleNestedChange("address", "street", e.target.value)
              }
              required
              error={!!fieldErrors["address.street"]}
              helperText={fieldErrors["address.street"]}
              fullWidth
            />
            <TextField
              label="City"
              value={worker.address.city}
              onChange={(e) =>
                handleNestedChange("address", "city", e.target.value)
              }
              required
              error={!!fieldErrors["address.city"]}
              helperText={fieldErrors["address.city"]}
              fullWidth
            />
            <TextField
              label="State"
              value={worker.address.state}
              onChange={(e) =>
                handleNestedChange("address", "state", e.target.value)
              }
              required
              error={!!fieldErrors["address.state"]}
              helperText={fieldErrors["address.state"]}
              fullWidth
            />
            <TextField
              label="Postal Code"
              value={worker.address.postalCode}
              onChange={(e) =>
                handleNestedChange("address", "postalCode", e.target.value)
              }
              required
              error={!!fieldErrors["address.postalCode"]}
              helperText={fieldErrors["address.postalCode"]}
              fullWidth
            />
            <TextField
              label="Country"
              value={worker.address.country}
              onChange={(e) =>
                handleNestedChange("address", "country", e.target.value)
              }
              required
              error={!!fieldErrors["address.country"]}
              helperText={fieldErrors["address.country"]}
              fullWidth
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (


const steps = [
  "Personal Details",
  "Account Details",
  "Tax Details",
  "Summary",
  "Receipt",
];

export default function AddNewWorkerForm({
  activeStep,
  handleNext,
  handleBack,
  handleSubmit,
  renderStepContent,
  createWorkerMutation,
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f7fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Card
        elevation={8}
        sx={{
          maxWidth: 1100,
          width: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          mx: 2,
        }}
      >
        {/* LEFT SIDE - Form Content */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 4, md: 6 },
            bgcolor: "white",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              fontWeight={700}
              color="#081422"
              sx={{ fontSize: { xs: "1.8rem", md: "2.2rem" } }}
            >
              Add New Worker
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Complete all steps to create a new worker account
            </Typography>
          </Box>

          {/* Step Content */}
          <Box sx={{ flexGrow: 1, minHeight: 420 }}>
            {renderStepContent(activeStep)}
          </Box>

          {/* Navigation - Fixed at bottom */}
          <Box
            sx={{
              mt: 6,
              pt: 4,
              borderTop: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<HiArrowLeft />}
              variant="outlined"
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                px: 4,
                py: 1.5,
                fontWeight: 600,
                borderColor: "#081422",
                color: "#081422",
              }}
            >
              Back
            </Button>

            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
              endIcon={
                createWorkerMutation.isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <HiArrowRight />
                )
              }
              disabled={createWorkerMutation.isLoading}
              sx={{
                bgcolor: "#00a89d", // DNB teal
                "&:hover": { bgcolor: "#008a80" },
                borderRadius: "12px",
                textTransform: "none",
                px: 5,
                py: 1.5,
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(0, 168, 157, 0.3)",
              }}
            >
              {createWorkerMutation.isLoading
                ? "Creating..."
                : activeStep === steps.length - 1
                ? "Create Worker"
                : "Next"}
            </Button>
          </Box>
        </Box>

        {/* RIGHT SIDE - Vertical Stepper */}
        <Box
          sx={{
            width: { xs: "100%", lg: 300 },
            bgcolor: "#f8fffe",
            borderLeft: { lg: "1px solid #e0e0e0" },
            borderTop: { xs: "1px solid #e0e0e0", lg: "none" },
            p: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Stepper
            activeStep={activeStep}
            orientation="vertical"
            sx={{
              width: "100%",
              "& .MuiStepLabel-label": {
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "#081422",
                mt: 1,
              },
              "& .MuiStepLabel-label.Mui-active": {
                color: "#00a89d",
                fontWeight: 700,
              },
              "& .MuiStepLabel-label.Mui-completed": {
                color: "#00a89d",
              },
              "& .MuiStepIcon-root": {
                width: 42,
                height: 42,
                fontSize: "1.4rem",
              },
              "& .MuiStepIcon-root.Mui-active": {
                color: "#00a89d",
                fontWeight: "bold",
              },
              "& .MuiStepIcon-root.Mui-completed": {
                color: "#00a89d",
              },
              "& .MuiStepConnector-line": {
                borderLeftWidth: "3px",
                borderColor: "#00a89d",
                minHeight: "60px",
              },
              "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line": {
                borderColor: "#00a89d",
              },
              "& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line": {
                borderColor: "#00a89d",
              },
            }}
          >
            {steps.map((label, index) => (
              <Step key={label} completed={activeStep > index}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      "& .MuiStepIcon-text": {
                        fontWeight: 700,
                        fontSize: "1rem",
                      },
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {index + 1}. {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Card>
    </Box>
  );
}
  );
}







