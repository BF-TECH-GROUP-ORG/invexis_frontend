"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
    Box,
    Stepper,
    Step,
    StepLabel,
    Button,
    Typography,
    TextField,
    Paper,
    Grid,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Alert,
    CircularProgress,
    Snackbar
} from "@mui/material";
import { createBranch } from "@/services/branches";

const steps = ["Basic Information", "Location Details", "Settings & Review"];

const NewBranchPage = () => {
    const router = useRouter();
    const locale = useLocale();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        companyId: "07f0c16d-95af-4cd6-998b-edfea57d87d7",
        name: "",
        created_by: "",
        capacity: "",
        status: "open",
        address_line1: "",
        address_line2: "",
        city: "",
        region: "",
        country: "",
        postal_code: "",
        latitude: "",
        longitude: "",
        timezone: "UTC",
    });

    const [errors, setErrors] = useState({});
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" // 'success' | 'error'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateStep = (step) => {
        const newErrors = {};
        let isValid = true;

        if (step === 0) {
            if (!formData.name) newErrors.name = "Branch Name is required";
            if (!formData.created_by) newErrors.created_by = "Created By is required";
            if (!formData.capacity) newErrors.capacity = "Capacity is required";
        } else if (step === 1) {
            if (!formData.address_line1) newErrors.address_line1 = "Address Line 1 is required";
            if (!formData.city) newErrors.city = "City is required";
            if (!formData.country) {
                newErrors.country = "Country code is required";
            } else if (formData.country.length !== 2) {
                newErrors.country = "Country must be a 2-letter code (e.g., US, GB, CA)";
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            isValid = false;
        }

        return isValid;
    };

    const handleNext = () => {
        if (validateStep(activeStep)) {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleSubmit = async () => {
        if (!validateStep(activeStep)) return;

        setLoading(true);
        setError("");

        try {
            const payload = {
                ...formData,
                id: crypto.randomUUID(),
                country: formData.country.toUpperCase(),
                capacity: Number(formData.capacity),
                latitude: formData.latitude ? Number(formData.latitude) : null,
                longitude: formData.longitude ? Number(formData.longitude) : null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            await createBranch(payload);

            // Show success message
            setSnackbar({
                open: true,
                message: "Branch created successfully!",
                severity: "success"
            });

            // Redirect after a short delay
            setTimeout(() => {
                router.push(`/${locale}/inventory/companies`);
            }, 1500);
        } catch (err) {
            console.error("Submission error:", err);

            // Show error message
            setSnackbar({
                open: true,
                message: err.response?.data?.message || "Failed to create branch. Please try again.",
                severity: "error"
            });

            setError("Failed to create branch. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Branch Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                error={!!errors.name}
                                helperText={errors.name}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Created By"
                                name="created_by"
                                value={formData.created_by}
                                onChange={handleChange}
                                error={!!errors.created_by}
                                helperText={errors.created_by}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Capacity"
                                name="capacity"
                                type="number"
                                value={formData.capacity}
                                onChange={handleChange}
                                error={!!errors.capacity}
                                helperText={errors.capacity}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    label="Status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="open">Open</MenuItem>
                                    <MenuItem value="closed">Closed</MenuItem>
                                    <MenuItem value="maintenance">Maintenance</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                );
            case 1:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Address Line 1"
                                name="address_line1"
                                value={formData.address_line1}
                                onChange={handleChange}
                                error={!!errors.address_line1}
                                helperText={errors.address_line1}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Address Line 2"
                                name="address_line2"
                                value={formData.address_line2}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="City"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                error={!!errors.city}
                                helperText={errors.city}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Region"
                                name="region"
                                value={formData.region}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Country Code"
                                name="country"
                                placeholder="e.g., US, GB, CA"
                                value={formData.country}
                                onChange={handleChange}
                                error={!!errors.country}
                                helperText={errors.country || "Enter 2-letter country code"}
                                required
                                inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Postal Code"
                                name="postal_code"
                                value={formData.postal_code}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                );
            case 2:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Latitude"
                                name="latitude"
                                type="number"
                                value={formData.latitude}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Longitude"
                                name="longitude"
                                type="number"
                                value={formData.longitude}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Timezone"
                                name="timezone"
                                value={formData.timezone}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Alert severity="info" sx={{ mt: 2 }}>
                                Please review your information before submitting.
                            </Alert>
                        </Grid>
                    </Grid>
                );
            default:
                return "Unknown step";
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
                Add New Branch
            </Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Paper sx={{ p: 4, borderRadius: 2 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <form>
                    {renderStepContent(activeStep)}

                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 }}>
                        <Button
                            disabled={activeStep === 0 || loading}
                            onClick={handleBack}
                            variant="outlined"
                        >
                            Back
                        </Button>
                        {activeStep === steps.length - 1 ? (
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={loading}
                                sx={{ bgcolor: "#FF6D00", "&:hover": { bgcolor: "#E65100" } }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Create Branch"}
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                sx={{ bgcolor: "#FF6D00", "&:hover": { bgcolor: "#E65100" } }}
                            >
                                Next
                            </Button>
                        )}
                    </Box>
                </form>
            </Paper>

            {/* Success/Error Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default NewBranchPage;
