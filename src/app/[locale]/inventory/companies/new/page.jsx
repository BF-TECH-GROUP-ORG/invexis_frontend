"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
    Alert,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    FormHelperText
} from "@mui/material";
import { MapPin } from "lucide-react";
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

    const { data: session } = useSession();
    const companyObj = session?.user?.companies?.[0];
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

    const [formData, setFormData] = useState({
        companyId: "",
        name: "",
        capacity: "",
        status: "open",
        address_line1: "",
        city: "",
        country: "",
        postal_code: "",
        latitude: "",
        longitude: "",
        timezone: "",
    });

    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState("");

    // Update formData when session is available and set timezone
    useEffect(() => {
        if (companyId) {
            setFormData(prev => ({ ...prev, companyId }));
        }
        // Auto-detect timezone
        const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setFormData(prev => ({ ...prev, timezone: detectedTimezone }));
    }, [companyId]);

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
            if (!formData.capacity) newErrors.capacity = "Capacity is required";
        } else if (step === 1) {
            if (!formData.address_line1) newErrors.address_line1 = "Address Line 1 is required";
            if (!formData.city) newErrors.city = "City is required";
            if (!formData.country) {
                newErrors.country = "Country code is required";
            } else if (formData.country.length !== 2) {
                newErrors.country = "Country must be a 2-letter code (e.g., US, GB, CA)";
            }
            if (!formData.postal_code) newErrors.postal_code = "Postal Code is required";
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

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser");
            return;
        }

        setLocationLoading(true);
        setLocationError("");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                setFormData(prev => ({
                    ...prev,
                    latitude: latitude.toString(),
                    longitude: longitude.toString()
                }));

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
                    );
                    
                    if (!response.ok) throw new Error('Failed to fetch address');
                    
                    const data = await response.json();
                    const address = data.address || {};
                    
                    setFormData(prev => ({
                        ...prev,
                        address_line1: [address.road, address.house_number].filter(Boolean).join(' ') || '',
                        city: address.city || address.town || address.village || '',
                        country: address.country_code?.toUpperCase() || '',
                        postal_code: address.postcode || ''
                    }));
                    
                } catch (error) {
                    console.error("Error getting address:", error);
                    setLocationError("Could not fetch address details");
                } finally {
                    setLocationLoading(false);
                }
            },
            (error) => {
                console.error("Error getting location:", error);
                setLocationError("Unable to retrieve your location");
                setLocationLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const handleSubmit = async () => {
        if (!validateStep(activeStep)) return;

        setLoading(true);
        setError("");

        try {
            // Extract user ID from session - try multiple possible fields
            const userId = session?.user?.id || session?.user?._id || session?.user?.userId || null;
            
            console.log("Session data:", session);
            console.log("User object:", session?.user);
            console.log("Extracted userId:", userId);
            
            const payload = {
                companyId: formData.companyId,
                name: formData.name,
                address_line1: formData.address_line1,
                city: formData.city,
                country: formData.country.toUpperCase(),
                postal_code: formData.postal_code,
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                capacity: Number(formData.capacity),
                timezone: formData.timezone,
                status: formData.status,
                created_by: userId,
            };
            
            console.log("Payload being sent:", payload);

            const result = await createBranch(payload);
            console.log("Branch creation result:", result);

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

                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                                    Branch Name <span style={{ color: "#d32f2f" }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="name"
                                    placeholder="e.g. Downtown Branch"
                                    value={formData.name}
                                    onChange={handleChange}
                                    error={!!errors.name}
                                    helperText={errors.name}
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                                    Capacity <span style={{ color: "#d32f2f" }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="capacity"
                                    type="number"
                                    placeholder="e.g. 1000"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    error={!!errors.capacity}
                                    helperText={errors.capacity}
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                                    Status <span style={{ color: "#d32f2f" }}>*</span>
                                </Typography>
                                <FormControl fullWidth variant="outlined">
                                    <Select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="open">Open</MenuItem>
                                        <MenuItem value="closed">Closed</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                                    Timezone (Auto-detected)
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="timezone"
                                    value={formData.timezone}
                                    onChange={handleChange}
                                    variant="outlined"
                                    disabled
                                    helperText="Automatically detected from your device"
                                />
                            </Grid>
                        </Grid>
                    </Box>
                );
            case 1:
                return (
                    <Box>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                            <Box>
                                <Typography variant="h5" fontWeight="600" gutterBottom>
                                    Location Details
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {steps[1].description}
                                </Typography>
                            </Box>
                            <Button
                                startIcon={<MapPin size={16} />}
                                onClick={handleGetLocation}
                                disabled={locationLoading}
                                variant="outlined"
                                size="small"
                            >
                                {locationLoading ? "Detecting..." : "Use My Location"}
                            </Button>
                        </Box>
                        {locationError && (
                            <Alert severity="error" sx={{ mb: 2 }}>{locationError}</Alert>
                        )}

                        <Grid container spacing={3}>
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

                            <Grid item xs={12} md={4}>
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

                            <Grid item xs={12} md={4}>
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

                            <Grid item xs={12} md={4}>
                                <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                                    Postal Code <span style={{ color: "#d32f2f" }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="postal_code"
                                    placeholder="e.g., 10001"
                                    value={formData.postal_code}
                                    onChange={handleChange}
                                    error={!!errors.postal_code}
                                    helperText={errors.postal_code}
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

                        <Grid spacing={3}>
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
            <div className="flex flex-col-reverse lg:flex-row gap-8 min-h-[600px] max-w-6xl mx-auto p-6">
                {/* Main Form Area */}
                <div className="flex-grow w-full lg:w-3/4">
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

                {/* Divider */}
                <div className="w-full h-px lg:w-px lg:h-auto bg-gray-200 my-4 lg:my-0 lg:mx-4"></div>

                {/* Right Stepper */}
                <div className="w-full lg:w-1/4 lg:min-w-[250px]">
                    <Box className="flex flex-row lg:flex-col space-x-4 lg:space-x-0 lg:space-y-8 sticky top-4 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                        {steps.map((step, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    opacity: index > activeStep ? 0.5 : 1,
                                    minWidth: { xs: "fit-content", lg: "auto" }
                                }}
                                onClick={() => {
                                    if (index < activeStep || (index === activeStep + 1 && validateStep(activeStep))) {
                                        setActiveStep(index);
                                    }
                                }}
                            >
                                <div
                                    className={`
                                        w-10 h-10 rounded-full flex items-center justify-center font-semibold text-base mr-3 flex-shrink-0 transition-all duration-300
                                        ${index === activeStep
                                            ? "bg-[#FF6D00] text-white ring-2 ring-[#FF6D00] ring-offset-2"
                                            : "bg-white text-gray-500 border-2 border-gray-200"}
                                    `}
                                >
                                    {index + 1}
                                </div>
                                <Box sx={{ display: { xs: "none", sm: "block" } }}>
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
