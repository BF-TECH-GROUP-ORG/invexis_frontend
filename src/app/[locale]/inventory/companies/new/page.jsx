"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
    Box,
    Button,
    Typography,
    TextField,
    Paper,
    Grid,
    CircularProgress,
    Snackbar,
    Alert
} from "@mui/material";
import { createBranch } from "@/services/branches";

const steps = [
    { label: "Basic Info", description: "Step 1 of 3" },
    { label: "Location Details", description: "Step 2 of 3" },
    { label: "Settings & Review", description: "Step 3 of 3" }
];

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
        severity: "success"
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
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
                companyId: formData.companyId,
                name: formData.name,
                address_line1: formData.address_line1,
                address_line2: formData.address_line2,
                city: formData.city,
                region: formData.region,
                country: formData.country.toUpperCase(),
                postal_code: formData.postal_code,
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                capacity: Number(formData.capacity),
                timezone: formData.timezone,
                status: formData.status,
                created_by: formData.created_by,
            };

            await createBranch(payload);

            setSnackbar({
                open: true,
                message: "Branch created successfully!",
                severity: "success"
            });

            setTimeout(() => {
                router.push(`/${locale}/inventory/companies`);
            }, 1500);
        } catch (err) {
            console.error("Error creating branch:", err);
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
                    <Box>
                        <Typography variant="h5" fontWeight="600">
                            Basic Branch Info
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                            {steps[0].description}
                        </Typography>

                        <Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                                    Branch Name <span style={{ color: "#d32f2f" }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="name"
                                    placeholder="e.g. Wireless Noise-Cancelling Headphones"
                                    value={formData.name}
                                    onChange={handleChange}
                                    error={!!errors.name}
                                    helperText={errors.name}
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                                    Created By <span style={{ color: "#d32f2f" }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="created_by"
                                    placeholder="PROD-001"
                                    value={formData.created_by}
                                    onChange={handleChange}
                                    error={!!errors.created_by}
                                    helperText={errors.created_by}
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                                    Capacity <span style={{ color: "#999" }}>(Optional)</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="capacity"
                                    type="number"
                                    placeholder="123456789012"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    error={!!errors.capacity}
                                    helperText={errors.capacity}
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                                    Timezone <span style={{ color: "#d32f2f" }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="timezone"
                                    placeholder="Brief summary for list views..."
                                    value={formData.timezone}
                                    onChange={handleChange}
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                                    Status <span style={{ color: "#999" }}>(Optional)</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    placeholder="Detailed information..."
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    </Box>
                );
            case 1:
                return (
                    <Box>
                        <Typography variant="h5" fontWeight="600" gutterBottom>
                            Location Details
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                            {steps[1].description}
                        </Typography>

                        <Grid  spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                                    Address Line 1 <span style={{ color: "#d32f2f" }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="address_line1"
                                    placeholder="e.g., 123 Main Street"
                                    value={formData.address_line1}
                                    onChange={handleChange}
                                    error={!!errors.address_line1}
                                    helperText={errors.address_line1}
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                                    Address Line 2
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="address_line2"
                                    placeholder="e.g., Apt 4B"
                                    value={formData.address_line2}
                                    onChange={handleChange}
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                                    City <span style={{ color: "#d32f2f" }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="city"
                                    placeholder="e.g., New York"
                                    value={formData.city}
                                    onChange={handleChange}
                                    error={!!errors.city}
                                    helperText={errors.city}
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                                    Region
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="region"
                                    placeholder="e.g., NY"
                                    value={formData.region}
                                    onChange={handleChange}
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                                    Country Code <span style={{ color: "#d32f2f" }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="country"
                                    placeholder="e.g., US, GB, CA"
                                    value={formData.country}
                                    onChange={handleChange}
                                    error={!!errors.country}
                                    helperText={errors.country || "Enter 2-letter country code"}
                                    inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }}
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                                    Postal Code
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="postal_code"
                                    placeholder="e.g., 10001"
                                    value={formData.postal_code}
                                    onChange={handleChange}
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    </Box>
                );
            case 2:
                return (
                    <Box>
                        <Typography variant="h5" fontWeight="600" gutterBottom>
                            Settings & Review
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                            {steps[2].description}
                        </Typography>

                        <Grid  spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                                    Latitude
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="latitude"
                                    type="number"
                                    placeholder="e.g., 40.7128"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                                    Longitude
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="longitude"
                                    type="number"
                                    placeholder="e.g., -74.0060"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    Please review your information before submitting. Once submitted, the branch will be created.
                                </Alert>
                            </Grid>
                        </Grid>
                    </Box>
                );
            default:
                return "Unknown step";
        }
    };

    return (
        <div>
            <div className="flex  items-center justify-center space-x-4">

                {/* top stepper */}
              <div>
                  <div className="">
                    <Box className="flex space-x-24">
                        {steps.map((step, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mb: 3,
                                    cursor: "pointer",
                                    opacity: index > activeStep ? 0.5 : 1,
                                }}
                                onClick={() => {
                                    if (index < activeStep || (index === activeStep + 1 && validateStep(activeStep))) {
                                        setActiveStep(index);
                                    }
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: "50%",
                                        bgcolor: index === activeStep ? "#FF6D00" : "#fff",
                                        color: index === activeStep ? "#fff" : "#666",
                                        border: index === activeStep ? "none" : "2px solid #e0e0e0",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: "600",
                                        fontSize: "16px",
                                        mr: 2,
                                        flexShrink: 0,
                                        transition: "all 0.3s ease"
                                    }}
                                >
                                    {index + 1}
                                </Box>
                                <Box>
                                    <Typography
                                        variant="body2"
                                        fontWeight={index === activeStep ? "600" : "500"}
                                        sx={{ color: index === activeStep ? "#000" : "#666" }}
                                    >
                                        {step.label}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{ color: "#999" }}
                                    >
                                        {step.description}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </div>
                 
                {/* Main Form Area */}
                <div>
                    {renderStepContent(activeStep)}

                    {/* Navigation Buttons */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4, pt: 3, borderTop: "1px solid #e0e0e0" }}>
                        <Button
                            disabled={activeStep === 0 || loading}
                            onClick={handleBack}
                            variant="outlined"
                            sx={{ minWidth: 120 }}
                        >
                            Back
                        </Button>
                        {activeStep === steps.length - 1 ? (
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={loading}
                                sx={{
                                    bgcolor: "#FF6D00",
                                    "&:hover": { bgcolor: "#E65100" },
                                    minWidth: 120
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Create Branch"}
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                sx={{
                                    bgcolor: "#FF6D00",
                                    "&:hover": { bgcolor: "#E65100" },
                                    minWidth: 120
                                }}
                            >
                                Next
                            </Button>
                        )}
                    </Box>
                </div>

              </div>
                {/* Vertical Stepper Sidebar */}
                
               
            </div>

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
        </div>
    );
};

export default NewBranchPage;
