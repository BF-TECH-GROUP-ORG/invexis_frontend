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
import { getCompanyDetails, getAllCompanies, transferToShop, transferToCompany } from "@/services/stockService";
import { getBranches } from "@/services/branches";
import { SellProduct } from "@/services/salesService";
import TransferSuccessModal from "./TransferSuccessModal";

export default function TransferModal({ open, onClose, selectedItems, companyId, userId, mode = 'company', currentShopId }) {
    const [targetCompany, setTargetCompany] = useState("");
    const [targetShop, setTargetShop] = useState("");
    const [reason, setReason] = useState("");
    const [notes, setNotes] = useState("");
    const [validationError, setValidationError] = useState("");
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [targetName, setTargetName] = useState("");

    // Reset state when modal opens or mode changes
    useEffect(() => {
        if (open) {
            setTargetCompany("");
            setTargetShop("");
            setReason("");
            setNotes("");
            setValidationError("");
            setSuccessModalOpen(false);
        }
    }, [open, mode]);

    // Fetch current company details to get category
    const { data: currentCompany, isLoading: loadingCurrentCompany } = useQuery({
        queryKey: ["companyDetails", companyId],
        queryFn: () => getCompanyDetails(companyId),
        enabled: !!companyId && open,
    });

    // Fetch all companies (for Cross-Company mode)
    const { data: allCompanies, isLoading: loadingAllCompanies } = useQuery({
        queryKey: ["allCompanies"],
        queryFn: getAllCompanies,
        enabled: open && mode === 'company',
    });

    // Fetch shops for current company (for Intra-Company mode)
    const { data: currentCompanyShops, isLoading: loadingCurrentShops } = useQuery({
        queryKey: ["allShops", companyId],
        queryFn: () => getBranches(companyId),
        enabled: open && mode === 'shop' && !!companyId,
    });

    // Fetch shops for selected target company (for Cross-Company mode)
    const { data: targetCompanyShops, isLoading: loadingTargetShops } = useQuery({
        queryKey: ["targetShops", targetCompany],
        queryFn: () => getBranches(targetCompany),
        enabled: open && mode === 'company' && !!targetCompany,
    });

    // Filter companies based on category matching
    const companiesList = allCompanies?.data || [];
    const companyDetails = currentCompany?.data || currentCompany;

    const eligibleCompanies = companiesList.filter(company => {
        // Exclude current company
        if (company.id === companyId || company._id === companyId) return false;

        // Get current company's category ID
        let currentCategoryId = companyDetails?.category;

        if (typeof currentCategoryId === 'object' && currentCategoryId !== null) {
            currentCategoryId = currentCategoryId.id || currentCategoryId._id || currentCategoryId.level2;
        }

        if (!currentCategoryId && companyDetails?.category_ids?.length > 0) {
            currentCategoryId = companyDetails.category_ids[0];
        }

        const targetCategoryIds = company.category_ids || [];

        if (!currentCategoryId) return false;

        return Array.isArray(targetCategoryIds) && targetCategoryIds.includes(currentCategoryId);
    }) || [];

    // Sales Mutation
    const sellMutation = useMutation({
        mutationFn: (payload) => SellProduct(payload, false),
        onError: (error) => {
            console.error("Sales creation failed during transfer:", error);
            setValidationError(`Sales creation failed: ${error.response?.data?.message || error.message}`);
        }
    });

    // Transfer mutation
    const transferMutation = useMutation({
        mutationFn: (payload) => {
            if (mode === 'shop') {
                return transferToShop(companyId, currentShopId, payload);
            } else {
                return transferToCompany(companyId, currentShopId, payload);
            }
        },
        onSuccess: () => {
            onClose();
            setSuccessModalOpen(true);
        },
        onError: (error) => {
            console.error("Transfer failed:", error);
            setValidationError(`Transfer failed: ${error.response?.data?.message || error.message}`);
        }
    });

    const handleSubmit = async () => {
        if (mode === 'company' && !targetCompany) {
            setValidationError("Please select a target company.");
            return;
        }
        if (!targetShop) { // Target shop is required for both modes now
            setValidationError("Please select a target shop.");
            return;
        }
        if (!reason.trim()) {
            setValidationError("Please provide a reason for the transfer.");
            return;
        }

        const items = Object.values(selectedItems).map(item => ({
            productId: item.productId,
            productName: item.name,
            quantity: item.qty,
            unitPrice: item.price,
            totalPrice: item.price * item.qty,
            discount: 0,
            shopId: currentShopId
        }));

        const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

        // Determine target name for display
        let targetDisplayName = "";
        if (mode === 'shop') {
            const shop = currentCompanyShops?.data?.find(s => (s.id || s._id) === targetShop);
            targetDisplayName = shop?.name || shop?.shopName || "Target Shop";
        } else {
            const company = eligibleCompanies.find(c => (c.id || c._id) === targetCompany);
            targetDisplayName = company?.name || company?.companyName || "Target Company";
        }
        setTargetName(targetDisplayName);

        // 1. Create Sales Record
        const salesPayload = {
            companyId: companyId,
            shopId: currentShopId,
            soldBy: userId,
            customerName: `Transfer to: ${targetDisplayName}`,
            customerPhone: "N/A",
            customerEmail: "",
            items,
            paymentMethod: "Transfer",
            paymentId: `TRF-${Date.now()}`,
            totalAmount,
            discountAmount: 0,
            isTransfer: true, // Mark as transfer
            transferTarget: {
                mode,
                targetCompanyId: mode === 'company' ? targetCompany : null,
                targetShopId: targetShop
            }
        };

        try {
            await sellMutation.mutateAsync(salesPayload);

            // 2. Execute Transfer if sales creation successful
            let transferPayload;

            if (mode === 'shop') {
                // Intra-Company Payload
                transferPayload = {
                    transfers: Object.values(selectedItems).map(item => ({
                        productId: item.productId,
                        quantity: item.qty
                    })),
                    toShopId: targetShop,
                    reason: reason,
                    userId: userId,
                    notes: notes
                };
            } else {
                // Cross-Company Payload
                transferPayload = {
                    transfers: Object.values(selectedItems).map(item => ({
                        productId: item.productId,
                        quantity: item.qty,
                        pricingOverride: {
                            price: item.price,
                            costPrice: item.minPrice // Assuming minPrice maps to costPrice or similar
                        }
                    })),
                    toCompanyId: targetCompany,
                    toShopId: targetShop,
                    reason: reason,
                    userId: userId
                };
            }

            transferMutation.mutate(transferPayload);

        } catch (error) {
            // Error handled in sellMutation onError
        }
    };

    const handleSuccessClose = () => {
        setSuccessModalOpen(false);
        onClose();
    };

    const isLoading = loadingCurrentCompany ||
        (mode === 'company' ? (loadingAllCompanies || loadingTargetShops) : loadingCurrentShops);

    const shopsToDisplay = mode === 'shop' ? (currentCompanyShops?.data || []) : (targetCompanyShops?.data || []);

    return (
        <>
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
                    {mode === 'company' ? 'Cross-Company Transfer' : 'Intra-Company Transfer'}
                </DialogTitle>

                <DialogContent sx={{ pt: 3 }}>
                    {isLoading && !targetCompanyShops ? ( // Show loading only if initial data is loading
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
                            </Box>

                            {validationError && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {validationError}
                                </Alert>
                            )}

                            {/* Target Company Selection (Only for Cross-Company) */}
                            {mode === 'company' && (
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Target Company</InputLabel>
                                    <Select
                                        value={targetCompany}
                                        label="Target Company"
                                        onChange={(e) => {
                                            setTargetCompany(e.target.value);
                                            setTargetShop(""); // Reset shop when company changes
                                            setValidationError("");
                                        }}
                                    >
                                        {eligibleCompanies.length === 0 ? (
                                            <MenuItem disabled value="">
                                                No eligible companies found
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
                            )}

                            {/* Target Shop Selection (Required for both, but depends on company selection for Cross-Company) */}
                            <FormControl fullWidth sx={{ mb: 2 }} disabled={mode === 'company' && !targetCompany}>
                                <InputLabel>Target Shop</InputLabel>
                                <Select
                                    value={targetShop}
                                    label="Target Shop"
                                    onChange={(e) => {
                                        setTargetShop(e.target.value);
                                        setValidationError("");
                                    }}
                                >
                                    {shopsToDisplay.length === 0 ? (
                                        <MenuItem disabled value="">
                                            {mode === 'company' && !targetCompany
                                                ? "Select a company first"
                                                : "No shops found"}
                                        </MenuItem>
                                    ) : (
                                        shopsToDisplay
                                            .filter(shop => shop.id !== currentShopId && shop._id !== currentShopId) // Exclude current shop
                                            .map((shop) => (
                                                <MenuItem key={shop.id || shop._id} value={shop.id || shop._id}>
                                                    {shop.name || shop.shopName || "Unnamed Shop"}
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
                        disabled={isLoading || transferMutation.isPending || sellMutation.isPending}
                    >
                        {transferMutation.isPending || sellMutation.isPending ? "Processing..." : "Confirm Transfer"}
                    </Button>
                </DialogActions>
            </Dialog>

            <TransferSuccessModal
                isOpen={successModalOpen}
                onClose={handleSuccessClose}
                targetName={targetName}
                mode={mode}
            />
        </>
    );
}
