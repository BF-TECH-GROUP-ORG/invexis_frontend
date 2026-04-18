"use client";

import React, { useState, useMemo } from "react";
import { Box, Button, TextField, MenuItem, Typography, CircularProgress, Stepper, Step, StepLabel, StepConnector, Card, InputAdornment, Select } from "@mui/material";
import Link from "next/link";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createWorker, updateWorker } from "@/services/workersService";
import { getBranches } from "@/services/branches";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { getDepartmentsByCompany } from "@/services/departmentsService";

const genders = ["male", "female", "other"];

// Helper function to ensure all fields have default values
const getDefaultWorker = () => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "worker",
  dateOfBirth: "",
  gender: "",
  nationalId: "",
  department: "",
  companies: [],
  shops: [],
  emergencyContact: { name: "", phone: "" },
  address: {
    street: "KG ST 001 P",
    city: "Kigali",
    state: "Kigali",
    postalCode: "0000",
    country: "Rwanda",
  },
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
  const t = useTranslations("management.workers.form");
  const router = useRouter();
  const locale = useLocale();
  const { data: session } = useSession();
  const [activeStep, setActiveStep] = useState(0);
  const queryClient = useQueryClient();
  const [worker, setWorker] = useState(() => initializeWorkerData(initialData));

  const stepLabels = useMemo(
    () => [t("personalInfo"), t("jobInfo"), "Review & Submit"],
    [t]
  );

  const companyObj = session?.user?.companies?.[0];
  const companyId =
    typeof companyObj === "string"
      ? companyObj
      : companyObj?.id || companyObj?._id;

  const options = useMemo(
    () =>
      session?.accessToken
        ? { headers: { Authorization: `Bearer ${session.accessToken}` } }
        : null,
    [session?.accessToken]
  );

  // React Query for branches
  const { data: branchesData } = useQuery({
    queryKey: ["branches", companyId],
    queryFn: () => getBranches(companyId, options),
    enabled: !!companyId && !!options,
  });

  const availableShops = useMemo(() => {
    const response = branchesData;
    const list = Array.isArray(response)
      ? response
      : response?.shops || response?.branches || response?.data || [];
    return Array.isArray(list) ? list : [];
  }, [branchesData]);

  // React Query for departments
  const { data: departmentsData } = useQuery({
    queryKey: ["departments", companyId],
    queryFn: () => getDepartmentsByCompany(companyId, options),
    enabled: !!companyId && !!options,
  });

  const availableDepartments = useMemo(() => {
    return Array.isArray(departmentsData) ? departmentsData : [];
  }, [departmentsData]);

  // Update worker state when initialData changes (e.g., after fetching in edit mode)
  React.useEffect(() => {
    if (initialData) {
      setWorker(initializeWorkerData(initialData));
    }
  }, [initialData]);

  // Ensure companyId is in worker state
  React.useEffect(() => {
    if (companyId) {
      setWorker((prev) => {
        if (prev.companies?.includes(companyId)) return prev;
        return { ...prev, companies: [companyId] };
      });
    }
  }, [companyId]);

  // Automation: Sync Emergency Contact with Personal Info
  React.useEffect(() => {
    setWorker((prev) => {
      const newName = `${prev.firstName} ${prev.lastName}`.trim();
      const newPhone = prev.phone;
      if (
        prev.emergencyContact.name === newName &&
        prev.emergencyContact.phone === newPhone
      )
        return prev;
      return {
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          name: newName,
          phone: newPhone,
        },
      };
    });
  }, [worker.firstName, worker.lastName, worker.phone]);

  // Automation: Ensure phone prefix is '7' (Rwanda standard)
  React.useEffect(() => {
    const code = worker.countryCode || "+250";
    if (worker.phone && worker.phone.startsWith(code)) {
      const local = worker.phone.slice(code.length);
      if (local.length > 0 && local[0] !== "7") {
        setWorker((prev) => {
          const newLocal = "7" + local.slice(0, 8);
          if (prev.phone === code + newLocal) return prev;
          return { ...prev, phone: code + newLocal };
        });
      }
    }
  }, [worker.phone, worker.countryCode]);

  // Persistence: Save to local storage
  React.useEffect(() => {
    if (!isEditMode) {
      const savedData = localStorage.getItem("worker_wizard_data");
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setWorker(initializeWorkerData(parsed.worker));
          setActiveStep(parsed.activeStep || 0);
        } catch (e) {
          console.error("Failed to parse saved worker data", e);
        }
      }
    }
  }, [isEditMode]);

  React.useEffect(() => {
    if (!isEditMode) {
      const timeout = setTimeout(() => {
        localStorage.setItem(
          "worker_wizard_data",
          JSON.stringify({ worker, activeStep })
        );
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [worker, activeStep, isEditMode]);

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
      if (!worker.firstName.trim())
        errors.firstName = t("validation.required", { field: t("firstName") });
      if (!worker.lastName.trim())
        errors.lastName = t("validation.required", { field: t("lastName") });
      if (!worker.email.trim())
        errors.email = t("validation.required", { field: t("email") });
      else if (!/\S+@\S+\.\S+/.test(worker.email))
        errors.email = t("validation.invalidEmail");
      if (!worker.phone.trim())
        errors.phone = t("validation.required", { field: t("phone") });
      else if (!/^\+?[1-9]\d{1,14}$/.test(worker.phone.replace(/[\s-=]/g, "")))
        errors.phone = t("validation.invalidPhone");

      if (!worker.gender)
        errors.gender = t("validation.required", { field: t("gender") });
    }

    if (step === 1) {
      if (!worker.department)
        errors.department = t("validation.required", { field: t("department") });
      if (worker.nationalId) {
        if (!/^[1][0-9]{15}$/.test(worker.nationalId)) {
          errors.nationalId = "National ID must be 16 digits and start with 1";
        }
      } else {
        errors.nationalId = t("validation.required", { field: t("nationalId") });
      }
      if (!worker.shops || !worker.shops[0]) {
        errors.shops = t("validation.required", { field: t("shop") });
      }
    }

    if (step === 2) {
      // Review step technically has no "errors" unless something changed back on previous steps
      return errors;
    }

    return errors;
  };

  const validateStep = (step) => {
    const errors = getStepErrors(step);
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const areAllStepsValid = () => {
    for (let i = 0; i < stepLabels.length; i++) {
      if (Object.keys(getStepErrors(i)).length > 0) return false;
    }
    return true;
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
      queryClient.invalidateQueries({ queryKey: ["workers", companyId] });
      // Invalidate broader patterns just in case
      queryClient.invalidateQueries({ queryKey: ["workers"] });

      if (!isEditMode) {
        localStorage.removeItem("worker_wizard_data");
      }

      setSnackbar({
        open: true,
        message: isEditMode
          ? t("buttons.update") + " - Success"
          : t("buttons.create") + " - Success",
        severity: "success",
      });

      // Force Next.js router refresh to pick up server-side changes
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

    const selectedDept = availableDepartments.find(
      (dept) => (dept.id || dept._id || dept.department_id) === worker.department
    );

    if (selectedDept) {
      payload.assignedDepartments = [selectedDept.display_name || selectedDept.name || selectedDept.department_name];
    }

    delete payload.username;
    delete payload.password;
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
              {t("personalInfo")}
            </Typography>
            <div className="flex gap-4 w-full">
              <TextField
                label={t("firstName")}
                value={worker.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                required
                error={!!fieldErrors.firstName}
                helperText={fieldErrors.firstName}
                fullWidth
              />
              <TextField
                label={t("lastName")}
                value={worker.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                required
                error={!!fieldErrors.lastName}
                helperText={fieldErrors.lastName}
                fullWidth
              />
            </div>

            <TextField
              label={t("email")}
              type="email"
              value={worker.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              fullWidth
            />

            <TextField
              label={t("phone")}
              value={
                (worker.phone || "").startsWith(worker.countryCode || "+250")
                  ? (worker.phone || "").slice(
                    (worker.countryCode || "+250").length
                  )
                  : worker.phone || ""
              }
              onChange={(e) => {
                const code = worker.countryCode || "+250";
                let val = e.target.value.replace(/[^0-9]/g, "");
                if (val.length > 0 && val[0] !== "7") {
                  val = "7" + val;
                }
                if (val.length > 9) val = val.slice(0, 9);
                handleChange("phone", code + val);
              }}
              required
              error={!!fieldErrors.phone}
              helperText={fieldErrors.phone || "Local number starting with 7"}
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
              label={t("dob")}
              type="date"
              InputLabelProps={{ shrink: true }}
              value={worker.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              fullWidth
            />

            <TextField
              select
              label={t("gender")}
              value={worker.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              required
              error={!!fieldErrors.gender}
              helperText={fieldErrors.gender}
              fullWidth
            >
              {genders.map((g) => (
                <MenuItem key={g} value={g}>
                  {t(`genders.${g}`)}
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
              {t("jobInfo")}
            </Typography>
            <TextField
              label={t("nationalId")}
              value={worker.nationalId}
              required
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                if (val.length > 0 && val[0] !== "1") return;
                if (val.length <= 16) {
                  handleChange("nationalId", val);
                }
              }}
              error={!!fieldErrors.nationalId}
              helperText={
                fieldErrors.nationalId || "Must be 16 digits starting with 1"
              }
              fullWidth
            />
            <TextField
              select
              label={t("department")}
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
                  {t("placeholders.noDept")}
                </MenuItem>
              )}
            </TextField>

            <TextField
              select
              label={t("shop")}
              value={worker.shops[0] || ""}
              onChange={(e) => handleChange("shops", [e.target.value])}
              required
              error={!!fieldErrors.shops}
              helperText={fieldErrors.shops}
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h6" fontWeight={700} color="#081422">
              Review & Submit
            </Typography>
            <Card
              elevation={0}
              variant="outlined"
              sx={{
                borderRadius: "16px",
                p: 3,
                bgcolor: "#fff",
                border: "1px solid #e5e7eb",
                boxShadow: "none",
                "& *": { boxShadow: "none !important" },
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    FULL NAME
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {worker.firstName} {worker.lastName}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    EMAIL ADDRESS
                  </Typography>
                  <Typography variant="body1">
                    {worker.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    PHONE NUMBER
                  </Typography>
                  <Typography variant="body1">
                    {worker.phone}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    NATIONAL ID
                  </Typography>
                  <Typography variant="body1">
                    {worker.nationalId}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    DEPARTMENT
                  </Typography>
                  <Typography variant="body1">
                    {availableDepartments.find(
                      (d) => (d.id || d._id || d.department_id) === worker.department
                    )?.name || worker.department}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    OFFICE / SHOP
                  </Typography>
                  <Typography variant="body1">
                    {availableShops.find(
                      (s) => (s.id || s._id) === worker.shops[0]
                    )?.name || "Not Assigned"}
                  </Typography>
                </Box>
              </div>

              <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #e0e0e0" }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Automatic Assignments:
                </Typography>
                <div className="flex flex-wrap gap-x-8 gap-y-2">
                  <Box>
                    <Typography variant="caption" color="text.secondary">Address:</Typography>
                    <Typography variant="body2">{worker.address.city}, {worker.address.country}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Emergency Contact:</Typography>
                    <Typography variant="body2">{worker.firstName} (Self)</Typography>
                  </Box>
                </div>
              </Box>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  const isStepValid = (step) => {
    return Object.keys(getStepErrors(step)).length === 0;
  };

  return (
    <Box
      sx={{
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
          <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box>
              <Typography
                variant="h4"
                fontWeight={700}
                color="#081422"
                sx={{ fontSize: { xs: "1.8rem", md: "2.2rem" } }}
              >
                {isEditMode ? t("editTitle") : t("addTitle")}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                {isEditMode ? t("editDesc") : t("addDesc")}
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
            <Button
              variant="outlined"
              onClick={() => router.push(`/${locale}/inventory/workers/list`)}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
                borderColor: "#081422",
                color: "#081422",
                "&:hover": { borderColor: "#fe6600", color: "#fe6600" },
              }}
            >
              Back to Workers
            </Button>
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
              {t("buttons.back")}
            </Button>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {isEditMode && activeStep !== stepLabels.length - 1 && (
                <Button
                  variant="outlined"
                  onClick={handleSubmit}
                  disabled={createWorkerMutation.isLoading || !areAllStepsValid()}
                  sx={{
                    borderRadius: "12px",
                    textTransform: "none",
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    color: "#fe6600",
                    borderColor: "#fe6600",
                    "&:hover": { bgcolor: "#fff5f0", borderColor: "#cc5200" },
                  }}
                >
                  {createWorkerMutation.isLoading
                    ? t("buttons.updating")
                    : t("buttons.update")}
                </Button>
              )}

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
                disabled={createWorkerMutation.isLoading || (activeStep === stepLabels.length - 1 && !areAllStepsValid())}
                sx={{
                  bgcolor: "#fe6600",
                  "&:hover": { bgcolor: "#cc5200" },
                  borderRadius: "12px",
                  textTransform: "none",
                  px: 5,
                  py: 1.5,
                  fontWeight: 600,
                }}
              >
                {createWorkerMutation.isLoading
                  ? isEditMode
                    ? t("buttons.updating")
                    : t("buttons.creating")
                  : activeStep === stepLabels.length - 1
                    ? isEditMode
                      ? t("buttons.update")
                      : t("buttons.create")
                    : t("buttons.next")}
              </Button>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            width: { xs: "0", lg: 500 },
            display: { xs: "none", lg: "block" },
            borderLeft: "1px solid #e0e0e0",
            py: 6,
            px: 4,
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
            {stepLabels.map((label, index) => {
              const isPassed = index < activeStep;
              const isCurrent = index === activeStep;
              const isValid = isStepValid(index);
              const isError = (isPassed || isCurrent) && !isValid;

              return (
                <Step key={label} completed={isPassed && isValid}>
                  <StepLabel
                    onClick={() => setActiveStep(index)}
                    sx={{ cursor: "pointer" }}
                    StepIconComponent={() => (
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: "50%",
                          border: "3px solid",
                          borderColor:
                            isError
                              ? "#ef4444"
                              : index === activeStep
                                ? "#fe6600"
                                : index < activeStep
                                  ? "#10b981"
                                  : "#d0d0d0",
                          backgroundColor:
                            isError
                              ? "#ef4444"
                              : index === activeStep
                                ? "#fe6600"
                                : index < activeStep
                                  ? "#10b981"
                                  : "transparent",
                          color:
                            index === activeStep || (isPassed && isValid) ? "white" : isError ? "white" : "#666",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.2rem",
                          fontWeight: 700,
                          transition: "all 0.3s ease",
                        }}
                      >
                        {isError ? "✕" : index < activeStep ? "✓" : index + 1}
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
              );
            })}
          </Stepper>
        </Box>
      </div>
    </Box>
  );
}
