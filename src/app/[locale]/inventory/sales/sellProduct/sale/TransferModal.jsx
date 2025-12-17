"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Typography,
    Box,
    CircularProgress,
    Alert
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getCompanyDetails, getAllCompanies, transferProducts } from "@/services/stockService";

export default function TransferModal({ open, onClose, selectedItems, companyId, userId }) {
    const [targetCompany, setTargetCompany] = useState("");
    const [reason, setReason] = useState("");
    const [notes, setNotes] = useState("");
    const [validationError, setValidationError] = useState("");

    // Fetch current company details to get category
    const { data: currentCompany, isLoading: loadingCurrentCompany } = useQuery({
        queryKey: ["companyDetails", companyId],
        queryFn: () => getCompanyDetails(companyId),
        enabled: !!companyId && open,
    });

    // Fetch all companies
    const { data: allCompanies, isLoading: loadingAllCompanies } = useQuery({
        queryKey: ["allCompanies"],
        queryFn: getAllCompanies,
        enabled: open,
    });

    // Filter companies based on level2 category
    const companiesList = allCompanies?.data || [];

    const companyDetails = currentCompany?.data || currentCompany;

    const eligibleCompanies = companiesList.filter(company => {
        // Exclude current company
        if (company.id === companyId || company._id === companyId) return false;

        // Check if categories match
        const currentCategory = companyDetails?.category?.level2 || companyDetails?.category;
        const targetCategory = company.category?.level2 || company.category;

        if (process.env.NODE_ENV === 'development') {
            console.log(`Checking company ${company.name}: Current Cat: ${currentCategory}, Target Cat: ${targetCategory}`);
        }

        // If target company has no category, it won't match. 
        // Note: The provided API response for companies list doesn't seem to include 'category'.
        // This filter might return empty if the backend doesn't provide category in the list.
        return currentCategory && targetCategory && currentCategory === targetCategory;
    }) || [];

    // Transfer mutation
    const transferMutation = useMutation({
        mutationFn: (payload) => transferProducts(payload),
        onSuccess: () => {
            onClose();
            alert("Transfer initiated successfully!");
            // Reset form
            setTargetCompany("");
            setReason("");
            setNotes("");
        },
        onError: (error) => {
            console.error("Transfer failed:", error);
            setValidationError(`Transfer failed: ${error.response?.data?.message || error.message}`);
        }
    });

    const handleSubmit = () => {
        if (!targetCompany) {
            setValidationError("Please select a target company.");
            return;
        }
        if (!reason.trim()) {
            setValidationError("Please provide a reason for the transfer.");
            return;
        }

        const payload = {
            transfers: Object.values(selectedItems).map(item => ({
                productId: item.productId,
                quantity: item.qty
            })),
            toShopId: targetCompany, // Mapping selected company to toShopId as per plan assumption
            reason: reason,
            userId: userId,
            notes: notes
        };

        transferMutation.mutate(payload);
    };

    const isLoading = loadingCurrentCompany || loadingAllCompanies;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 }
            }}
        >
            <DialogTitle sx={{ bgcolor: "#1976d2", color: "white", fontWeight: "bold" }}>
                Transfer Products
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                {isLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Box sx={{ mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Products to Transfer:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {Object.values(selectedItems).length} items selected
                            </Typography>
                            <Box sx={{ mt: 1, maxHeight: 100, overflowY: "auto" }}>
                                {Object.values(selectedItems).map(item => (
                                    <Typography key={item.productId} variant="caption" display="block">
                                        • {item.name} (Qty: {item.qty})
                                    </Typography>
                                ))}
                            </Box>
                        </Box>

                        {validationError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {validationError}
                            </Alert>
                        )}

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Target Company</InputLabel>
                            <Select
                                value={targetCompany}
                                label="Target Company"
                                onChange={(e) => {
                                    setTargetCompany(e.target.value);
                                    setValidationError("");
                                }}
                            >
                                {eligibleCompanies.length === 0 ? (
                                    <MenuItem disabled value="">
                                        No eligible companies found with same category
                                    </MenuItem>
                                ) : (
                                    eligibleCompanies.map((company) => (
                                        <MenuItem key={company.id || company._id} value={company.id || company._id}>
                                            {company.name || company.companyName}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Reason"
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                setValidationError("");
                            }}
                            placeholder="e.g., Monthly redistribution"
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="Notes (Optional)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            multiline
                            rows={3}
                        />
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={isLoading || transferMutation.isPending || eligibleCompanies.length === 0}
                >
                    {transferMutation.isPending ? "Transferring..." : "Confirm Transfer"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
