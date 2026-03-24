"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
    Box,
    Button,
    Typography,
    TextField,
    CircularProgress,
    MenuItem,
    Select,
    FormControl,
    Card,
    Stepper,
    Step,
    StepLabel,
    StepConnector,
    Alert,
} from "@mui/material";
import { MapPin, ArrowRight, ArrowLeft } from "lucide-react";
import { createBranch, updateBranch } from "@/services/branches";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const BranchForm = ({ initialData = null, isEditMode = false, companyId: propCompanyId }) => {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("common");
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    const companyId = propCompanyId || session?.user?.companies?.[0]?.id || session?.user?.companies?.[0]?._id || session?.user?.companies?.[0];

    // Form Steps
    const stepLabels = ["Basic Info", "Location Details", "Review & Submit"];
    const [activeStep, setActiveStep] = useState(0);

    // Initial State
    const getDefaultBranch = () => ({
        companyId: companyId || "",
        name: "",
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
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    });

    const [formData, setFormData] = useState(() => {
        if (initialData) {
            return {
                ...getDefaultBranch(),
                ...initialData,
                latitude: initialData.latitude?.toString() || "",
                longitude: initialData.longitude?.toString() || "",
            };
        }
        return getDefaultBranch();
    });

    const [errors, setErrors] = useState({});
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState("");

    // Detect companyId on mount if not provided
    useEffect(() => {
        if (companyId && !formData.companyId) {
            setFormData(prev => ({ ...prev, companyId }));
        }
    }, [companyId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const getStepErrors = (step) => {
        const newErrors = {};
        if (step === 0) {
            if (!formData.name) newErrors.name = "Branch Name is required";
            if (!formData.capacity) newErrors.capacity = "Capacity is required";
        } else if (step === 1) {
            if (!formData.address_line1) newErrors.address_line1 = "Address Line 1 is required";
            if (!formData.city) newErrors.city = "City is required";
            if (!formData.country) {
                newErrors.country = "Country code is required";
            } else if (formData.country.length !== 2) {
                newErrors.country = "Must be a 2-letter code (e.g., RW)";
            }
        }
        return newErrors;
    };

    const isStepValid = (step) => Object.keys(getStepErrors(step)).length === 0;

    const areAllStepsValid = () => {
        for (let i = 0; i < stepLabels.length; i++) {
            if (!isStepValid(i)) return false;
        }
        return true;
    };

    const handleNext = () => {
        const stepErrors = getStepErrors(activeStep);
        if (Object.keys(stepErrors).length === 0) {
            setActiveStep((prev) => prev + 1);
        } else {
            setErrors(stepErrors);
        }
    };

    const handleBack = () => setActiveStep((prev) => prev - 1);

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
                // Update coordinates immediately for faster UX
                setFormData(prev => ({ ...prev, latitude: latitude.toString(), longitude: longitude.toString() }));

                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
                    if (!response.ok) throw new Error('Failed to fetch address');
                    const data = await response.json();
                    const address = data.address || {};

                    setFormData(prev => ({
                        ...prev,
                        address_line1: [address.road, address.house_number].filter(Boolean).join(' ') || prev.address_line1,
                        city: address.city || address.town || address.village || prev.city,
                        country: address.country_code?.toUpperCase() || prev.country,
                        postal_code: address.postcode || prev.postal_code
                    }));
                } catch (error) {
                    console.error("Error getting address:", error);
                    setLocationError("Could not fetch address details, but coordinates were saved");
                } finally {
                    setLocationLoading(false);
                }
            },
            (error) => {
                setLocationError("Unable to retrieve your location. Please check browser permissions.");
                setLocationLoading(false);
            },
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 10000 }
        );
    };

    const mutation = useMutation({
        mutationFn: (payload) => isEditMode 
            ? updateBranch(initialData.id || initialData._id, payload, companyId)
            : createBranch(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["branches", companyId] });
            queryClient.invalidateQueries({ queryKey: ["branches"] });
            if (isEditMode) queryClient.invalidateQueries({ queryKey: ["branch", initialData.id || initialData._id] });

            router.refresh();
            router.push(`/${locale}/inventory/companies`);
        },
        onError: (err) => {
            console.error("Error saving branch:", err);
            setLocationError(err.response?.data?.message || t("common.error_occurred"));
        }
    });

    const handleSubmit = async () => {
        if (!areAllStepsValid()) {
            const allErrors = {};
            for (let i = 0; i < stepLabels.length; i++) {
                Object.assign(allErrors, getStepErrors(i));
            }
            setErrors(allErrors);
            return;
        }

        const payload = {
            ...formData,
            country: formData.country.toUpperCase(),
            latitude: formData.latitude !== "" ? parseFloat(formData.latitude) : null,
            longitude: formData.longitude !== "" ? parseFloat(formData.longitude) : null,
            capacity: Number(formData.capacity),
            created_by: session?.user?.id || session?.user?._id,
        };

        mutation.mutate(payload);
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <Typography variant="h6" fontWeight={700} color="#081422">Basic Branch Info</Typography>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <FormControl fullWidth>
                                <Select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="open">Open</MenuItem>
                                    <MenuItem value="closed">Closed</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    </Box>
                );
            case 1:
                return (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <Box sx={{ 
                            display: "flex", 
                            flexDirection: { xs: "column", sm: "row" }, 
                            alignItems: { xs: "stretch", sm: "center" }, 
                            justifyContent: "space-between",
                            gap: 2
                        }}>
                            <Typography variant="h6" fontWeight={700} color="#081422">Location Details</Typography>
                            <Button
                                startIcon={<MapPin size={20} />}
                                onClick={handleGetLocation}
                                disabled={locationLoading}
                                variant="outlined"
                                sx={{
                                    borderRadius: "16px",
                                    textTransform: "none",
                                    color: "#fe6600",
                                    borderColor: "#fe6600",
                                    px: { xs: 2.5, sm: 4 },
                                    py: 1.8,
                                    fontSize: { xs: "95%", sm: "105%" },
                                    fontWeight: 700,
                                    width: { xs: "100%", sm: "auto" },
                                    "&:hover": { bgcolor: "rgba(254, 102, 0, 0.04)", borderColor: "#cc5200" }
                                }}
                            >
                                {locationLoading ? "Detecting..." : "Detect My Location"}
                            </Button>
                        </Box>
                        {locationError && <Alert severity="error">{locationError}</Alert>}
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
                        <TextField
                            fullWidth
                            label="Address Line 2 (Optional)"
                            name="address_line2"
                            value={formData.address_line2}
                            onChange={handleChange}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <TextField
                                fullWidth
                                label="Region / State"
                                name="region"
                                value={formData.region}
                                onChange={handleChange}
                            />
                            <TextField
                                fullWidth
                                label="Country Code"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                error={!!errors.country}
                                helperText={errors.country || "Enter 2-letter code (e.g. RW)"}
                                inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <TextField
                                fullWidth
                                label="Postal Code"
                                name="postal_code"
                                value={formData.postal_code}
                                onChange={handleChange}
                            />
                            <TextField
                                fullWidth
                                label="Latitude"
                                name="latitude"
                                type="number"
                                value={formData.latitude}
                                onChange={handleChange}
                            />
                            <TextField
                                fullWidth
                                label="Longitude"
                                name="longitude"
                                type="number"
                                value={formData.longitude}
                                onChange={handleChange}
                            />
                        </div>
                    </Box>
                );
            case 2:
                return (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <Typography variant="h6" fontWeight={700} color="#081422">Review & Submit</Typography>
                        <Card elevation={0} variant="outlined" sx={{ borderRadius: "16px", p: 3, border: "1px solid #e5e7eb", boxShadow: "none" }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DetailItem label="BRANCH NAME" value={formData.name} />
                                <DetailItem label="CAPACITY" value={formData.capacity} />
                                <DetailItem label="STATUS" value={formData.status?.toUpperCase()} />
                                <DetailItem label="ADDRESS" value={`${formData.address_line1} ${formData.address_line2 || ""}`} />
                                <DetailItem label="CITY & COUNTRY" value={`${formData.city}, ${formData.country}`} />
                                <DetailItem label="TIMEZONE" value={formData.timezone} />
                            </div>
                        </Card>
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Box sx={{ maxWidth: "1200px", mx: "auto", p: { xs: 2, md: 4 } }}>
            {/* Header */}
            <Box sx={{ 
                display: "flex", 
                flexDirection: { xs: "column", md: "row" }, 
                justifyContent: "space-between", 
                alignItems: { xs: "flex-start", md: "center" }, 
                mb: 4,
                gap: 2
            }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="#081422" sx={{ fontSize: { xs: "1.75rem", md: "2.125rem" } }}>
                        {isEditMode ? "Update Shop" : "Add New Shop"}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {isEditMode ? "Modify branch details and settings" : "Create a new branch for your company"}
                    </Typography>
                </Box>
                <Button
                    startIcon={<ArrowLeft size={18} />}
                    onClick={() => router.push(`/${locale}/inventory/companies`)}
                    sx={{ 
                        color: "#666", 
                        textTransform: "none", 
                        fontWeight: 600,
                        bgcolor: { xs: "#f3f4f6", md: "transparent" },
                        px: { xs: 2, md: 1 },
                        borderRadius: "8px",
                        "&:hover": { bgcolor: "#e5e7eb" }
                    }}
                >
                    {locale === 'en' ? 'Back' : t('buttons.back')}
                </Button>
            </Box>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Form Main Area */}
                <Box sx={{ flex: 1, bgcolor: "white", borderRadius: "24px", p: { xs: 3, md: 5 }, border: "1px solid #e0e0e0" }}>
                    {renderStepContent(activeStep)}

                    {/* Footer Buttons */}
                    <Box sx={{ 
                        mt: 6, 
                        pt: 4, 
                        borderTop: "1px solid #e0e0e0", 
                        display: "flex", 
                        flexDirection: { xs: "column-reverse", sm: "row" },
                        justifyContent: "space-between", 
                        alignItems: { xs: "stretch", sm: "center" },
                        gap: 2
                    }}>
                        <Button
                            onClick={handleBack}
                            disabled={activeStep === 0 || mutation.isLoading}
                            startIcon={<ArrowLeft size={18} />}
                            variant="outlined"
                            sx={{ 
                                borderRadius: "12px", 
                                textTransform: "none", 
                                px: { xs: 2, sm: 4 }, 
                                py: 1.5, 
                                fontWeight: 600, 
                                color: "#081422", 
                                borderColor: "#081422",
                                minWidth: { xs: "auto", sm: "120px" },
                                width: { xs: "100%", sm: "auto" }
                            }}
                        >
                            <Box sx={{ display: { xs: "none", sm: "inline" } }}>
                                {t("buttons.back")}
                            </Box>
                            <Box sx={{ display: { xs: "inline", sm: "none" } }}>
                                Back
                            </Box>
                        </Button>

                        <Box sx={{ 
                            display: "flex", 
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: { xs: "stretch", sm: "center" }, 
                            gap: 2 
                        }}>
                            {isEditMode && activeStep !== stepLabels.length - 1 && (
                                <Button
                                    variant="outlined"
                                    onClick={handleSubmit}
                                    disabled={mutation.isLoading || !areAllStepsValid()}
                                    sx={{ 
                                        borderRadius: "12px", 
                                        textTransform: "none", 
                                        px: 4, 
                                        py: 1.5, 
                                        fontWeight: 600, 
                                        color: "#fe6600", 
                                        borderColor: "#fe6600",
                                        width: { xs: "100%", sm: "auto" }
                                    }}
                                >
                                    {mutation.isLoading ? "Updating..." : "Update Shop"}
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                onClick={activeStep === stepLabels.length - 1 ? handleSubmit : handleNext}
                                endIcon={mutation.isLoading ? <CircularProgress size={20} color="inherit" /> : <ArrowRight size={18} />}
                                disabled={mutation.isLoading || (activeStep === stepLabels.length - 1 && !areAllStepsValid())}
                                sx={{ 
                                    bgcolor: "#fe6600", 
                                    "&:hover": { bgcolor: "#cc5200" }, 
                                    borderRadius: "12px", 
                                    textTransform: "none", 
                                    px: 5, 
                                    py: 1.5, 
                                    fontWeight: 600,
                                    width: { xs: "100%", sm: "auto" }
                                }}
                            >
                                {activeStep === stepLabels.length - 1 
                                    ? (isEditMode ? "Update Shop" : "Create Shop") 
                                    : "Next Step"}
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* Sidebar Stepper */}
                <Box sx={{ width: { xs: "100%", lg: 320 }, display: { xs: "none", lg: "block" }, py: 2 }}>
                    <Stepper activeStep={activeStep} orientation="vertical" connector={<StepConnector sx={{ "& .MuiStepConnector-line": { borderLeftWidth: "3px", borderColor: "#d0d0d0", minHeight: "40px", ml: "15px" } }} />}>
                        {stepLabels.map((label, index) => {
                            const isPassed = index < activeStep;
                            const isCurrent = index === activeStep;
                            const isValid = isStepValid(index);
                            const isError = (isPassed || isCurrent) && !isValid;

                            return (
                                <Step key={label}>
                                    <StepLabel
                                        onClick={() => setActiveStep(index)}
                                        sx={{ cursor: "pointer" }}
                                        StepIconComponent={() => (
                                            <Box sx={{
                                                width: 52, height: 52, borderRadius: "50%", border: "3px solid",
                                                borderColor: isError ? "#ef4444" : isCurrent ? "#fe6600" : isPassed ? "#10b981" : "#d0d0d0",
                                                backgroundColor: isError ? "#ef4444" : isCurrent ? "#fe6600" : isPassed ? "#10b981" : "transparent",
                                                color: (isCurrent || (isPassed && isValid) || isError) ? "white" : "#666",
                                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 700
                                            }}>
                                                {isError ? "✕" : isPassed ? "✓" : index + 1}
                                            </Box>
                                        )}
                                    >
                                        <Box ml={2}>
                                            <Typography variant="body2" fontWeight={isCurrent ? 700 : 600} color={isCurrent ? "#081422" : "#666"}>{label}</Typography>
                                            <Typography variant="caption" sx={{ color: "#999" }}>Step {index + 1} of 3</Typography>
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
};

const DetailItem = ({ label, value }) => (
    <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
        <Typography variant="body1" fontWeight={600} sx={{ color: "#081422" }}>{value || "Not specified"}</Typography>
    </Box>
);

export default BranchForm;
