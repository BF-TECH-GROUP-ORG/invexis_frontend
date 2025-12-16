"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLocale } from "next-intl";
import {
    Box,
    Button,
    Typography,
    TextField,
    CircularProgress,
    Snackbar,
    Alert
} from "@mui/material";
import { getBranchById, updateBranch } from "@/services/branches";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

const steps = [
    { label: "Basic Info", description: "Step 1 of 3" },
    { label: "Location Details", description: "Step 2 of 3" },
    { label: "Settings & Review", description: "Step 3 of 3" }
];

const EditBranchPage = () => {
    const router = useRouter();
    const locale = useLocale();
    const params = useParams();
    const branchId = params.id;
    const queryClient = useQueryClient();

    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        capacity: "",
        address_line1: "",
        address_line2: "",
        city: "",
        region: "",
        country: "",
        postal_code: "",
        timezone: "UTC",
    });

    const [errors, setErrors] = useState({});
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    const { data: session } = useSession();
    const companyObj = session?.user?.companies?.[0];
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

    // Fetch branch data
    const { data: branchData, isLoading: isFetchingBranch } = useQuery({
        queryKey: ["branch", branchId],
        queryFn: () => getBranchById(branchId, companyId),
        enabled: !!branchId && !!companyId,
        select: (response) => {
            // API returns { data: {...}, success: true }
            return response?.data || response;
        },
    });

    // Populate form when branch data is loaded
    useEffect(() => {
        if (branchData) {
            setFormData({
                name: branchData.name || "",
                capacity: branchData.capacity || "",
                address_line1: branchData.address_line1 || "",
                address_line2: branchData.address_line2 || "",
                city: branchData.city || "",
                region: branchData.region || "",
                country: branchData.country || "",
                postal_code: branchData.postal_code || "",
                timezone: branchData.timezone || "UTC",
            });
        }
    }, [branchData]);

    const updateMutation = useMutation({
        mutationFn: ({ id, data, companyId }) => updateBranch(id, data, companyId),
        onSuccess: () => {
            queryClient.invalidateQueries(["branches"]);
            queryClient.invalidateQueries(["branch", branchId]);

            setSnackbar({
                open: true,
                message: "Branch updated successfully!",
                severity: "success"
            });

            setTimeout(() => {
                router.push(`/${locale}/inventory/companies`);
            }, 1500);
        },
        onError: (err) => {
            console.error("Update error:", err);
            setSnackbar({
                open: true,
                message: err.response?.data?.message || "Failed to update branch. Please try again.",
                severity: "error"
            });
            setError("Failed to update branch. Please try again.");
        }
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
                companyId: companyId,
                name: formData.name,
                address_line1: formData.address_line1,
                address_line2: formData.address_line2,
                city: formData.city,
                region: formData.region,
                country: formData.country.toUpperCase(),
                postal_code: formData.postal_code,
                capacity: Number(formData.capacity),
                timezone: formData.timezone,
            };

            await updateMutation.mutateAsync({ id: branchId, data: payload, companyId });
        } catch (err) {
            console.error("Submission error:", err);
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

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box>
                                <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                                    Branch Name <span style={{ color: "#d32f2f" }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="name"
                                    placeholder="e.g. Main Branch"
                                    value={formData.name}
                                    onChange={handleChange}
                                    error={!!errors.name}
                                    helperText={errors.name}
                                    variant="outlined"
                                />
                            </Box>

                            <Box>
                                <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                                    Capacity <span style={{ color: "#d32f2f" }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="capacity"
                                    type="number"
                                    placeholder="e.g., 1000"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    error={!!errors.capacity}
                                    helperText={errors.capacity}
                                    variant="outlined"
                                />
                            </Box>

                            <Box>
                                <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                                    Timezone <span style={{ color: "#d32f2f" }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="timezone"
                                    placeholder="e.g., UTC, EST, PST"
                                    value={formData.timezone}
                                    onChange={handleChange}
                                    variant="outlined"
                                />
                            </Box>
                        </Box>
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

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box>
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
                            </Box>

                            <Box>
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
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Box sx={{ flex: 1 }}>
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
                                </Box>

                                <Box sx={{ flex: 1 }}>
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
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Box sx={{ flex: 1 }}>
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
                                </Box>

                                <Box sx={{ flex: 1 }}>
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
                                </Box>
                            </Box>
                        </Box>
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

                        <Alert severity="info" sx={{ mt: 2 }}>
                            Please review your information before updating. Once submitted, the branch will be updated with the new information.
                        </Alert>

                        <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                            <Typography variant="body2" fontWeight="600" sx={{ mb: 2 }}>
                                Review Your Changes:
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="body2"><strong>Branch Name:</strong> {formData.name}</Typography>
                                <Typography variant="body2"><strong>Capacity:</strong> {formData.capacity}</Typography>
                                <Typography variant="body2"><strong>Address:</strong> {formData.address_line1} {formData.address_line2}</Typography>
                                <Typography variant="body2"><strong>City:</strong> {formData.city}</Typography>
                                <Typography variant="body2"><strong>Region:</strong> {formData.region || 'N/A'}</Typography>
                                <Typography variant="body2"><strong>Country:</strong> {formData.country}</Typography>
                                <Typography variant="body2"><strong>Postal Code:</strong> {formData.postal_code || 'N/A'}</Typography>
                                <Typography variant="body2"><strong>Timezone:</strong> {formData.timezone}</Typography>
                            </Box>
                        </Box>
                    </Box>
                );
            default:
                return "Unknown step";
        }
    };

    if (isFetchingBranch) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                <CircularProgress size={60} sx={{ color: "#FF6D00" }} />
            </Box>
        );
    }

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
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Update Branch"}
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

export default EditBranchPage;
