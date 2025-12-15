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
  StepConnector,
  Card,
  InputAdornment,
  Select,
} from "@mui/material";
import Link from "next/link";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import { useMutation } from "@tanstack/react-query";
import { createWorker, updateWorker } from "@/services/workersService";
import { getBranches } from "@/services/branches";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { getDepartmentsByCompany } from "@/services/departmentsService";

// const positions = [
//   "Sales Representative",
//   "Cashier",
//   "Manager",
//   "Stock Keeper",
// ];
const genders = ["male", "female", "other"];
const stepLabels = [
  "Personal Information",
  "Job Information",
  "Contact & Address",
];

// Helper function to ensure all fields have default values
const getDefaultWorker = () => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  // countryCode: "+250",
  password: "",
  role: "worker",
  dateOfBirth: "",
  gender: "",
  nationalId: "",
  // position: "",
  department: "",
  companies: [],
  shops: [],
  emergencyContact: { name: "", phone: "" },
  address: { street: "", city: "", state: "", postalCode: "", country: "" },
  preferences: {
    language: "en",
    notifications: { email: true, sms: true, inApp: true },
  },
});

// Helper to merge initialData with defaults to avoid undefined values
const initializeWorkerData = (data) => {
  const defaults = getDefaultWorker();
  if (!data) return defaults;

  return {
    ...defaults,
    ...data,
    emergencyContact: {
      ...defaults.emergencyContact,
      ...(data.emergencyContact || {}),
    },
    address: {
      ...defaults.address,
      ...(data.address || {}),
    },
    preferences: {
      ...defaults.preferences,
      ...(data.preferences || {}),
      notifications: {
        ...defaults.preferences.notifications,
        ...(data.preferences?.notifications || {}),
      },
    },
  };
};

export default function AddWorkerForm({ initialData, isEditMode = false }) {
  const router = useRouter();
  const locale = useLocale();
  const { data: session } = useSession();
  const [activeStep, setActiveStep] = useState(0);
  const [worker, setWorker] = useState(() => initializeWorkerData(initialData));

  const [availableShops, setAvailableShops] = useState([]);
  const [availableDepartments, setAvailableDepartments] = useState([]);

  // Update worker state when initialData changes (e.g., after fetching in edit mode)
  React.useEffect(() => {
    if (initialData) {
      setWorker(initializeWorkerData(initialData));
    }
  }, [initialData]);

  // Fetch shops and departments when component mounts or company changes
  React.useEffect(() => {
    const fetchShopsAndDepartments = async () => {
      const companyObj = session?.user?.companies?.[0];
      const companyId =
        typeof companyObj === "string"
          ? companyObj
          : companyObj?.id || companyObj?._id;

      if (companyId) {
        // Update worker state with companyId if not already set
        setWorker((prev) => {
          if (
            prev.companies &&
            Array.isArray(prev.companies) &&
            prev.companies.includes(companyId)
          )
            return prev;
          return { ...prev, companies: [companyId] };
        });

        // Fetch shops
        const response = await getBranches(companyId);
        const shopsList = Array.isArray(response)
          ? response
          : response?.shops || response?.branches || response?.data || [];

        console.log("Processed shops list:", shopsList);
        setAvailableShops(Array.isArray(shopsList) ? shopsList : []);

        // Fetch departments
        const departments = await getDepartmentsByCompany(companyId);
        console.log("Fetched departments:", departments);
        setAvailableDepartments(Array.isArray(departments) ? departments : []);
      }
    };
    if (session) {
      fetchShopsAndDepartments();
    }
  }, [session]);

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
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleNestedChange = (parent, key, value) => {
    setWorker((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [key]: value },
    }));
    const errorKey = `${parent}.${key}`;
    if (fieldErrors[errorKey])
      setFieldErrors((prev) => ({ ...prev, [errorKey]: "" }));
  };

  const getStepErrors = (step) => {
    const errors = {};
    if (step === 0) {
      if (!worker.firstName.trim()) errors.firstName = "First name is required";
      if (!worker.lastName.trim()) errors.lastName = "Last name is required";
      if (!worker.email.trim()) errors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(worker.email))
        errors.email = "Email is invalid";
      if (!worker.phone.trim()) errors.phone = "Phone is required";
      else if (!/^\+?[1-9]\d{1,14}$/.test(worker.phone.replace(/[\s-=]/g, "")))
        errors.phone = "Invalid phone format (e.g., +250...)";
      if (!isEditMode) {
        if (!worker.password.trim()) errors.password = "Password is required";
        else if (worker.password.length < 6)
          errors.password = "Password must be at least 6 characters";
      }
      if (!worker.gender) errors.gender = "Gender is required";
    }

    if (step === 1) {
      // if (!worker.position) errors.position = "Position is required";
      if (!worker.department) errors.department = "Department is required";
      if (worker.nationalId && !/^[A-Z0-9]{5,20}$/.test(worker.nationalId))
        errors.nationalId =
          "National ID must be 5-20 uppercase alphanumeric characters";
    }

    if (step === 2) {
      if (!worker.emergencyContact.name.trim())
        errors["emergencyContact.name"] = "Emergency contact name is required";
      if (!worker.emergencyContact.phone.trim())
        errors["emergencyContact.phone"] =
          "Emergency contact phone is required";
      else if (
        !/^\+?[1-9]\d{1,14}$/.test(
          worker.emergencyContact.phone.replace(/[\s-]/g, "")
        )
      )
        errors["emergencyContact.phone"] =
          "Invalid phone format (e.g., +250...)";
      if (!worker.address.street.trim())
        errors["address.street"] = "Street is required";
      if (!worker.address.city.trim())
        errors["address.city"] = "City is required";
      if (!worker.address.state.trim())
        errors["address.state"] = "State is required";
      if (!worker.address.postalCode.trim())
        errors["address.postalCode"] = "Postal code is required";
      if (!worker.address.country.trim())
        errors["address.country"] = "Country is required";
    }

    return errors;
  };

  const validateStep = (step) => {
    const errors = getStepErrors(step);
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAllSteps = () => {
    let allErrors = {};
    let firstErrorStep = -1;
    for (let i = 0; i < stepLabels.length; i++) {
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
    if (validateStep(activeStep)) setActiveStep((s) => s + 1);
  };

  const handleBack = () => setActiveStep((s) => Math.max(0, s - 1));

  const createWorkerMutation = useMutation({
    mutationFn: (data) =>
      isEditMode
        ? updateWorker(initialData.id || initialData._id, data)
        : createWorker(data),
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: isEditMode
          ? "Worker updated successfully!"
          : "Worker created successfully!",
        severity: "success",
      });
      router.refresh();
      setTimeout(() => router.push(`/${locale}/inventory/workers/list`), 1500);
    },
    onError: (error) => {
      console.error("Worker save error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        (isEditMode ? "Failed to update worker" : "Failed to create worker");
      setErrorDialog({
        open: true,
        message: errorMessage,
        details: error?.response?.data || null,
      });
    },
  });

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const { isValid, firstErrorStep } = validateAllSteps();
    if (!isValid) {
      if (firstErrorStep !== -1) setActiveStep(firstErrorStep);
      return;
    }

    const payload = { ...worker };
    delete payload.username;
    delete payload.department;

    if (payload.nationalId)
      payload.nationalId = payload.nationalId
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
    if (payload.emergencyContact?.phone)
      payload.emergencyContact.phone = payload.emergencyContact.phone.replace(
        /[\s-]/g,
        ""
      );
    if (payload.phone) payload.phone = payload.phone.replace(/[\s-=]/g, "");

    await createWorkerMutation.mutateAsync(payload);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Typography
              variant="h6"
              fontWeight={600}
              color="#081422"
              gutterBottom
            >
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
                (worker.phone || "").startsWith(worker.countryCode || "+250")
                  ? (worker.phone || "").slice(
                      (worker.countryCode || "+250").length
                    )
                  : worker.phone || ""
              }
              onChange={(e) => {
                const code = worker.countryCode || "+250";
                handleChange("phone", code + e.target.value);
              }}
              required
              error={!!fieldErrors.phone}
              helperText={fieldErrors.phone}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ p: 0 }}>
                    <Select
                      value={worker.countryCode || "+250"}
                      onChange={(e) => {
                        const newCode = e.target.value;
                        const currentCode = worker.countryCode || "+250";
                        const currentLocal = worker.phone.startsWith(
                          currentCode
                        )
                          ? worker.phone.slice(currentCode.length)
                          : worker.phone;
                        handleChange("countryCode", newCode);
                        handleChange("phone", newCode + currentLocal);
                      }}
                      variant="standard"
                      disableUnderline
                      sx={{
                        background: "transparent",
                        "& .MuiSelect-select": { padding: 0 },
                      }}
                      MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                    >
                      {[
                        { code: "+250", flag: "🇷🇼" },
                        { code: "+255", flag: "🇹🇿" },
                        { code: "+256", flag: "🇺🇬" },
                        { code: "+257", flag: "🇧🇮" },
                        { code: "+243", flag: "🇨🇩" },
                      ].map((option) => (
                        <MenuItem key={option.code} value={option.code}>
                          <span
                            style={{ marginRight: "8px", fontSize: "1.2rem" }}
                          >
                            {option.flag}
                          </span>
                          {option.code}
                        </MenuItem>
                      ))}
                    </Select>
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
                "& .MuiOutlinedInput-input": { paddingLeft: "4px" },
              }}
            />

            <TextField
              label="Password"
              type="password"
              value={worker.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required={!isEditMode}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              fullWidth
              placeholder={
                isEditMode ? "Leave blank to keep current password" : ""
              }
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
            <Typography
              variant="h6"
              fontWeight={600}
              color="#081422"
              gutterBottom
            >
              Job Information
            </Typography>
            <TextField
              label="National ID"
              value={worker.nationalId}
              onChange={(e) =>
                handleChange("nationalId", e.target.value.toUpperCase())
              }
              error={!!fieldErrors.nationalId}
              helperText={fieldErrors.nationalId}
              fullWidth
            />
            {/* <TextField
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
            </TextField> */}
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
              {availableDepartments.length > 0 ? (
                availableDepartments.map((dept) => (
                  <MenuItem
                    key={dept.id || dept._id || dept.department_id}
                    value={dept.id || dept._id || dept.department_id}
                  >
                    {dept.display_name || dept.name || dept.department_name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  No departments available
                </MenuItem>
              )}
            </TextField>

            <TextField
              select
              label="Shop"
              value={worker.shops[0] || ""}
              onChange={(e) => handleChange("shops", [e.target.value])}
              fullWidth
            >
              {availableShops.map((shop) => (
                <MenuItem key={shop.id || shop._id} value={shop.id || shop._id}>
                  {shop.name || shop.shopName || "Unnamed Shop"}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Typography
              variant="h6"
              fontWeight={600}
              color="#081422"
              gutterBottom
            >
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
            <Typography
              variant="h6"
              fontWeight={600}
              color="#081422"
              gutterBottom
              sx={{ mt: 2 }}
            >
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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
      className="border-2 border-gray-200 rounded-xl"
    >
      <div className="flex w-full items-center">
        <Box
          sx={{
            flex: 1,
            p: { xs: 4, md: 6 },
            bgcolor: "white",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              fontWeight={700}
              color="#081422"
              sx={{ fontSize: { xs: "1.8rem", md: "2.2rem" } }}
            >
              {isEditMode ? "Edit Worker" : "Add New Worker"}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {isEditMode
                ? "Update worker information"
                : "Complete all steps to create a new worker account"}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              inventory /
              <span className="hover:text-orange-500 cursor-pointer font-bold  ">
                <Link
                  href={`/${locale}/inventory/workers/list`}
                  prefetch={true}
                >
                  workers
                </Link>{" "}
              </span>{" "}
              /{" "}
              <span className="text-orange-500 cursor-pointer font-bold  ">
                {isEditMode ? "Edit-Worker" : "Add-Worker"}
              </span>{" "}
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, minHeight: 420 }}>
            {renderStepContent(activeStep)}
          </Box>

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
              onClick={
                activeStep === stepLabels.length - 1 ? handleSubmit : handleNext
              }
              endIcon={
                createWorkerMutation.isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <HiArrowRight />
                )
              }
              disabled={createWorkerMutation.isLoading}
              sx={{
                bgcolor: "#",
                "&:hover": { bgcolor: "#fe6600ff" },
                borderRadius: "12px",
                textTransform: "none",
                px: 5,
                py: 1.5,
                fontWeight: 600,
              }}
            >
              {createWorkerMutation.isLoading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : activeStep === stepLabels.length - 1
                ? isEditMode
                  ? "Update Worker"
                  : "Create Worker"
                : "Next"}
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            width: { xs: "100%", lg: 500 },
            borderTop: { xs: "1px solid #e0e0e0", lg: "none" },
            py: { xs: 4, lg: 6 },
            px: { xs: 2, lg: 0 },
          }}
        >
          <Stepper
            activeStep={activeStep}
            orientation="vertical"
            connector={
              <StepConnector
                sx={{
                  "& .MuiStepConnector-line": {
                    borderLeftWidth: "3px",
                    borderColor: "#d0d0d0",
                    minHeight: "40px",
                    marginLeft: "15px",
                  },
                }}
              />
            }
          >
            {stepLabels.map((label, index) => (
              <Step key={label} completed={activeStep > index}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: "50%",
                        border: "3px solid",
                        borderColor:
                          index === activeStep
                            ? "#fe6600"
                            : index < activeStep
                            ? "#fe6600"
                            : "#d0d0d0",
                        backgroundColor:
                          index === activeStep ? "#fe6600" : "transparent",
                        color: index === activeStep ? "white" : "#666",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1 rem",
                        fontWeight: 700,
                        transition: "all 0.3s ease",
                      }}
                    >
                      {index < activeStep ? "✓" : index + 1}
                    </Box>
                  )}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        fontSize: "1rem",
                        color: index <= activeStep ? "#081422" : "#888",
                        mb: 0.5,
                      }}
                    >
                      {label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#666", fontSize: "0.8rem" }}
                    >
                      Step {index + 1} of {stepLabels.length}
                    </Typography>
                  </Box>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </div>
    </div>
  );
}
