"use client";

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
    username: "",
    email: "",
    phone: "",
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
      if (!worker.username.trim()) errors.username = "Username is required";
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
            <TextField
              label="Username"
              value={worker.username}
              onChange={(e) => handleChange("username", e.target.value)}
              required
              error={!!fieldErrors.username}
              helperText={fieldErrors.username}
              fullWidth
            />
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
              value={worker.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
              error={!!fieldErrors.phone}
              helperText={fieldErrors.phone}
              fullWidth
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
    <ThemeRegistry>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          maxWidth: 800,
          mx: "auto",
          mt: 4,
          p: 4,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" fontWeight={700} color="#081422" gutterBottom>
            Add New Worker
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Complete all steps to create a new worker account
          </Typography>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step Content */}
          <Box sx={{ minHeight: 400, mb: 3 }}>
            {renderStepContent(activeStep)}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<HiArrowLeft />}
              variant="outlined"
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                px: 3,
              }}
            >
              Back
            </Button>

            <Box sx={{ display: "flex", gap: 2 }}>
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={
                    createWorkerMutation.isLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <HiArrowRight />
                    )
                  }
                  disabled={createWorkerMutation.isLoading}
                  sx={{
                    backgroundColor: "#081422",
                    "&:hover": { backgroundColor: "#0b2036" },
                    borderRadius: "10px",
                    textTransform: "none",
                    px: 4,
                  }}
                >
                  {createWorkerMutation.isLoading ? "Creating..." : "Create Worker"}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  endIcon={<HiArrowRight />}
                  sx={{
                    backgroundColor: "#081422",
                    "&:hover": { backgroundColor: "#0b2036" },
                    borderRadius: "10px",
                    textTransform: "none",
                    px: 4,
                  }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Error Dialog */}
        <Dialog
          open={errorDialog.open}
          onClose={() => setErrorDialog({ open: false, message: "", details: null })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: "#d32f2f", color: "white", fontWeight: "bold" }}>
            Error Creating Worker
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              {errorDialog.message}
            </Typography>
            {errorDialog.details && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {JSON.stringify(errorDialog.details, null, 2)}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setErrorDialog({ open: false, message: "", details: null })}
              variant="outlined"
            >
              Close
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{ bgcolor: "#FF6D00", "&:hover": { bgcolor: "#E65100" } }}
            >
              Try Again
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeRegistry>
  );
}
