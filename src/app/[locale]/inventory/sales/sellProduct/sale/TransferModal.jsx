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
import { useTranslations, useLocale } from "next-intl";

export default function TransferModal({ open, onClose, selectedItems, companyId, userId, mode = 'company', currentShopId }) {
    const t = useTranslations('sellProduct.modals.transfer');
    const tAlerts = useTranslations('sellProduct.alerts');
    const tCustomer = useTranslations('sellProduct.modals.customer');
    const tActions = useTranslations('sellProduct.actions');
    const locale = useLocale();
    const [targetCompany, setTargetCompany] = useState("");
    const [targetShop, setTargetShop] = useState("");
    const [reason, setReason] = useState("");
    const [notes, setNotes] = useState("");
    const [validationError, setValidationError] = useState("");
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [targetName, setTargetName] = useState("");
    const [isDebt, setIsDebt] = useState(false);
    const [amountPaidNow, setAmountPaidNow] = useState(0);

    // Reset state when modal opens or mode changes
    useEffect(() => {
        if (open) {
            setTargetCompany("");
            setTargetShop("");
            setReason("");
            setNotes("");
            setValidationError("");
            setSuccessModalOpen(false);
            setIsDebt(false);
            setAmountPaidNow(0);
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
    // getAllCompanies returns Axios response, need to extract data property
    const companiesList = allCompanies?.data?.data || allCompanies?.data || [];
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
            const errMsg = error.response?.data?.message || error.message;
            setValidationError(tAlerts('saleFailed', { error: errMsg }));
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
            const errMsg = error.response?.data?.message || error.message;
            setValidationError(tAlerts('transferFailed', { error: errMsg }));
        }
    });

    const handleSubmit = async () => {
        if (mode === 'company' && !targetCompany) {
            setValidationError(t('errors.selectCompany'));
            return;
        }
        if (!targetShop) { // Target shop is required for both modes now
            setValidationError(t('errors.selectShop'));
            return;
        }
        if (!reason.trim()) {
            setValidationError(t('errors.reasonRequired'));
            return;
        }

        const items = Object.values(selectedItems).map(item => ({
            productId: item.productId,
            productName: item.name,
            quantity: item.qty,
            unitPrice: item.price,
            totalPrice: item.price * item.qty,
            costPrice: item.cost || 0,
            discount: 0,
            shopId: currentShopId
        }));

        const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

        // Determine target name for display
        let targetDisplayName = "";
        if (mode === 'shop') {
            const shop = currentCompanyShops?.data?.find(s => (s.id || s._id) === targetShop);
            targetDisplayName = shop?.name || shop?.shopName || t('errors.noShops');
        } else {
            const company = eligibleCompanies.find(c => (c.id || c._id) === targetCompany);
            targetDisplayName = company?.name || company?.companyName || t('errors.noCompanies');
        }
        setTargetName(targetDisplayName);

        // 1. Create Sales Record
        const salesPayload = {
            companyId: companyId,
            shopId: currentShopId,
            soldBy: userId,
            customerName: `${useTranslations('sales')('transfer')}: ${targetDisplayName}`,
            customerPhone: "N/A",
            customerEmail: "",
            items,
            paymentMethod: "Transfer",
            paymentId: `TRF-${Date.now()}`,
            totalAmount,
            amountPaidNow: isDebt ? parseFloat(amountPaidNow) || 0 : totalAmount,
            discountAmount: 0,
            isDebt: !!isDebt,
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
                            costPrice: item.cost || 0
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

    // getBranches() returns the array directly, not wrapped in .data
    const shopsToDisplay = mode === 'shop' ? (currentCompanyShops || []) : (targetCompanyShops || []);

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="lg"
                fullWidth
                TransitionProps={{
                    timeout: {
                        enter: 400,
                        exit: 300
                    }
                }}
                PaperProps={{
                    sx: {
                        borderRadius: { xs: "0px", md: "16px" },
                        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25), 0 0 1px rgba(0, 0, 0, 0.1)",
                        bgcolor: "#FFFFFF",
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        minHeight: { xs: "auto", md: "600px" },
                        animation: open ? "slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)" : "slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "@keyframes slideUp": {
                            from: {
                                opacity: 0,
                                transform: "translateY(30px)"
                            },
                            to: {
                                opacity: 1,
                                transform: "translateY(0)"
                            }
                        },
                        "@keyframes slideDown": {
                            from: {
                                opacity: 1,
                                transform: "translateY(0)"
                            },
                            to: {
                                opacity: 0,
                                transform: "translateY(30px)"
                            }
                        }
                    }
                }}
            >
                {/* Premium Header - Left Side - Hidden on Mobile */}
                <Box sx={{
                    display: { xs: "none", md: "flex" },
                    background: "linear-gradient(135deg, #1F2937 0%, #111827 100%)",
                    padding: "40px 32px",
                    borderRadius: "16px 0 0 16px",
                    flex: "0 0 35%",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    animation: open ? "slideInLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1)" : "slideOutLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "@keyframes slideInLeft": {
                        from: {
                            opacity: 0,
                            transform: "translateX(-40px)"
                        },
                        to: {
                            opacity: 1,
                            transform: "translateX(0)"
                        }
                    },
                    "@keyframes slideOutLeft": {
                        from: {
                            opacity: 1,
                            transform: "translateX(0)"
                        },
                        to: {
                            opacity: 0,
                            transform: "translateX(-40px)"
                        }
                    }
                }}>
                    <Box>
                        <Typography variant="h5" sx={{
                            color: "white",
                            fontWeight: 700,
                            fontSize: "2rem",
                            letterSpacing: "-0.5px",
                            mb: 1
                        }}>
                            {mode === 'company' ? t('titleCross') : t('titleIntra')}
                        </Typography>
                        <Typography variant="body2" sx={{
                            color: "#D1D5DB",
                            fontWeight: 500,
                            fontSize: "0.95rem",
                            lineHeight: 1.6
                        }}>
                            {mode === 'company'
                                ? t('subtitleCross')
                                : t('subtitleIntra')}
                        </Typography>
                    </Box>

                    {/* Transfer Summary Card - Left Side */}
                    <Box sx={{
                        width: "100%",
                        p: "20px 24px",
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(10px)",
                        animation: open ? "scaleIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both" : "scaleOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "@keyframes scaleIn": {
                            from: {
                                opacity: 0,
                                transform: "scale(0.95)"
                            },
                            to: {
                                opacity: 1,
                                transform: "scale(1)"
                            }
                        },
                        "@keyframes scaleOut": {
                            from: {
                                opacity: 1,
                                transform: "scale(1)"
                            },
                            to: {
                                opacity: 0,
                                transform: "scale(0.95)"
                            }
                        }
                    }}>
                        <Typography variant="caption" sx={{
                            color: "#D1D5DB",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            display: "block",
                            mb: 1
                        }}>
                            {t('totalValue')}
                        </Typography>
                        <Typography variant="h4" sx={{
                            color: "#FBBF24",
                            fontWeight: 800,
                            fontSize: "1.875rem",
                            mb: 1
                        }}>
                            {new Intl.NumberFormat(locale).format(Object.values(selectedItems).reduce((sum, item) => sum + (item.price * item.qty), 0))} FRW
                        </Typography>
                        <Typography variant="caption" sx={{
                            color: "#9CA3AF",
                            display: "block"
                        }}>
                            {t('selected', { count: Object.keys(selectedItems).length })}
                        </Typography>
                    </Box>
                </Box>

                <DialogContent sx={{
                    pt: { xs: 2, md: 4 },
                    pb: { xs: 20, md: 24 },
                    px: { xs: 2, md: 4 },
                    flex: 1,
                    overflow: "auto",
                    position: "relative",
                    width: { xs: "100%", md: "auto" },
                    animation: open ? "slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1)" : "slideOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "@keyframes slideInRight": {
                        from: {
                            opacity: 0,
                            transform: "translateX(40px)"
                        },
                        to: {
                            opacity: 1,
                            transform: "translateX(0)"
                        }
                    },
                    "@keyframes slideOutRight": {
                        from: {
                            opacity: 1,
                            transform: "translateX(0)"
                        },
                        to: {
                            opacity: 0,
                            transform: "translateX(40px)"
                        }
                    }
                }}>
                    {isLoading && !targetCompanyShops ? (
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {validationError && (
                                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                    {validationError}
                                </Alert>
                            )}

                            {/* Target Company Selection (Only for Cross-Company) */}
                            {mode === 'company' && (
                                <Box sx={{
                                    mb: 3,
                                    animation: open ? "fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.15s both" : "fadeOutDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    "@keyframes fadeInUp": {
                                        from: {
                                            opacity: 0,
                                            transform: "translateY(20px)"
                                        },
                                        to: {
                                            opacity: 1,
                                            transform: "translateY(0)"
                                        }
                                    },
                                    "@keyframes fadeOutDown": {
                                        from: {
                                            opacity: 1,
                                            transform: "translateY(0)"
                                        },
                                        to: {
                                            opacity: 0,
                                            transform: "translateY(20px)"
                                        }
                                    }
                                }}>
                                    <Typography variant="body2" sx={{
                                        color: "#111827",
                                        fontWeight: 600,
                                        mb: 1.2,
                                        fontSize: "0.95rem"
                                    }}>
                                        {t('targetCompany')} <span style={{ color: "#FF6D00" }}>*</span>
                                    </Typography>
                                    <FormControl fullWidth>
                                        <Select
                                            value={targetCompany}
                                            onChange={(e) => {
                                                setTargetCompany(e.target.value);
                                                setTargetShop("");
                                                setValidationError("");
                                            }}
                                            sx={{
                                                borderRadius: "10px",
                                                "& .MuiOutlinedInput-root": {
                                                    "& fieldset": {
                                                        borderColor: "#E5E7EB",
                                                        borderWidth: "1.5px"
                                                    },
                                                    "&:hover fieldset": {
                                                        borderColor: "#D1D5DB"
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#FF6D00",
                                                        borderWidth: "2px"
                                                    }
                                                }
                                            }}
                                        >
                                            {eligibleCompanies.length === 0 ? (
                                                <MenuItem disabled value="">
                                                    {t('errors.noCompanies')}
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
                                </Box>
                            )}

                            {/* Target Shop Selection */}
                            <Box sx={{
                                mb: 3,
                                animation: open ? "fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.25s both" : "fadeOutDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                "@keyframes fadeInUp": {
                                    from: {
                                        opacity: 0,
                                        transform: "translateY(20px)"
                                    },
                                    to: {
                                        opacity: 1,
                                        transform: "translateY(0)"
                                    }
                                },
                                "@keyframes fadeOutDown": {
                                    from: {
                                        opacity: 1,
                                        transform: "translateY(0)"
                                    },
                                    to: {
                                        opacity: 0,
                                        transform: "translateY(20px)"
                                    }
                                }
                            }}>
                                <Typography variant="body2" sx={{
                                    color: "#111827",
                                    fontWeight: 600,
                                    mb: 1.2,
                                    fontSize: "0.95rem"
                                }}>
                                    {t('targetShop')} <span style={{ color: "#FF6D00" }}>*</span>
                                </Typography>
                                <FormControl fullWidth disabled={mode === 'company' && !targetCompany}>
                                    <Select
                                        value={targetShop}
                                        onChange={(e) => {
                                            setTargetShop(e.target.value);
                                            setValidationError("");
                                        }}
                                        sx={{
                                            borderRadius: "10px",
                                            "& .MuiOutlinedInput-root": {
                                                "& fieldset": {
                                                    borderColor: "#E5E7EB",
                                                    borderWidth: "1.5px"
                                                },
                                                "&:hover fieldset": {
                                                    borderColor: "#D1D5DB"
                                                },
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "#FF6D00",
                                                    borderWidth: "2px"
                                                }
                                            }
                                        }}
                                    >
                                        {shopsToDisplay.length === 0 ? (
                                            <MenuItem disabled value="">
                                                {mode === 'company' && !targetCompany
                                                    ? t('placeholders.shop')
                                                    : t('errors.noShops')}
                                            </MenuItem>
                                        ) : (
                                            shopsToDisplay
                                                .filter(shop => shop.id !== currentShopId && shop._id !== currentShopId)
                                                .map((shop) => (
                                                    <MenuItem key={shop.id || shop._id} value={shop.id || shop._id}>
                                                        {shop.name || shop.shopName || t('errors.noShops')}
                                                    </MenuItem>
                                                ))
                                        )}
                                    </Select>
                                </FormControl>
                            </Box>

                            {/* Reason Field */}
                            <Box sx={{
                                mb: 3,
                                animation: open ? "fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.35s both" : "fadeOutDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                "@keyframes fadeInUp": {
                                    from: {
                                        opacity: 0,
                                        transform: "translateY(20px)"
                                    },
                                    to: {
                                        opacity: 1,
                                        transform: "translateY(0)"
                                    }
                                },
                                "@keyframes fadeOutDown": {
                                    from: {
                                        opacity: 1,
                                        transform: "translateY(0)"
                                    },
                                    to: {
                                        opacity: 0,
                                        transform: "translateY(20px)"
                                    }
                                }
                            }}>
                                <Typography variant="body2" sx={{
                                    color: "#111827",
                                    fontWeight: 600,
                                    mb: 1.2,
                                    fontSize: "0.95rem"
                                }}>
                                    {t('reason')} <span style={{ color: "#FF6D00" }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder={t('placeholders.reason')}
                                    value={reason}
                                    onChange={(e) => {
                                        setReason(e.target.value);
                                        setValidationError("");
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            bgcolor: "#FFFFFF",
                                            borderRadius: "10px",
                                            fontWeight: 500,
                                            fontSize: "0.95rem",
                                            "& fieldset": {
                                                borderColor: "#E5E7EB",
                                                borderWidth: "1.5px"
                                            },
                                            "&:hover fieldset": {
                                                borderColor: "#D1D5DB"
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#FF6D00",
                                                borderWidth: "2px"
                                            }
                                        },
                                        "& .MuiOutlinedInput-input": {
                                            padding: "12px 16px",
                                            color: "#111827"
                                        }
                                    }}
                                />
                            </Box>

                            {/* Notes Field */}
                            <Box sx={{
                                mb: 4,
                                animation: open ? "fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.45s both" : "fadeOutDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                "@keyframes fadeInUp": {
                                    from: {
                                        opacity: 0,
                                        transform: "translateY(20px)"
                                    },
                                    to: {
                                        opacity: 1,
                                        transform: "translateY(0)"
                                    }
                                },
                                "@keyframes fadeOutDown": {
                                    from: {
                                        opacity: 1,
                                        transform: "translateY(0)"
                                    },
                                    to: {
                                        opacity: 0,
                                        transform: "translateY(20px)"
                                    }
                                }
                            }}>
                                <Typography variant="body2" sx={{
                                    color: "#111827",
                                    fontWeight: 600,
                                    mb: 1.2,
                                    fontSize: "0.95rem"
                                }}>
                                    {t('notes')}
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder={t('placeholders.notes')}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    multiline
                                    rows={3}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            bgcolor: "#FFFFFF",
                                            borderRadius: "10px",
                                            fontWeight: 500,
                                            "& fieldset": {
                                                borderColor: "#E5E7EB",
                                                borderWidth: "1.5px"
                                            },
                                            "&:hover fieldset": {
                                                borderColor: "#D1D5DB"
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#FF6D00",
                                                borderWidth: "2px"
                                            }
                                        },
                                        "& .MuiOutlinedInput-input": {
                                            padding: "12px 16px",
                                            color: "#111827"
                                        }
                                    }}
                                />
                            </Box>

                            {/* Debt Transfer Toggle - Only for Cross-Company Mode */}
                            {mode === 'company' && (
                                <Box sx={{
                                    mb: 4,
                                    p: "16px 20px",
                                    bgcolor: "#F3E8FF",
                                    borderRadius: "10px",
                                    border: "1.5px solid #E9D5FF",
                                    animation: open ? "fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.55s both" : "fadeOutDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    "@keyframes fadeInUp": {
                                        from: {
                                            opacity: 0,
                                            transform: "translateY(20px)"
                                        },
                                        to: {
                                            opacity: 1,
                                            transform: "translateY(0)"
                                        }
                                    },
                                    "@keyframes fadeOutDown": {
                                        from: {
                                            opacity: 1,
                                            transform: "translateY(0)"
                                        },
                                        to: {
                                            opacity: 0,
                                            transform: "translateY(20px)"
                                        }
                                    }
                                }}>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: isDebt ? 2 : 0 }}>
                                        <Box>
                                            <Typography variant="body2" sx={{
                                                color: "#111827",
                                                fontWeight: 600,
                                                fontSize: "0.95rem"
                                            }}>
                                                {t('debtTransfer')}
                                            </Typography>
                                            <Typography variant="caption" sx={{
                                                color: "#7C3AED",
                                                fontSize: "0.8rem"
                                            }}>
                                                {t('debtTransferSubtitle')}
                                            </Typography>
                                        </Box>
                                        <button
                                            type="button"
                                            onClick={() => setIsDebt(!isDebt)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${isDebt ? "bg-orange-500" : "bg-gray-200"}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${isDebt ? "translate-x-6" : "translate-x-1"}`} />
                                        </button>
                                    </Box>

                                    {isDebt && (
                                        <>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                                                {t('totalValue')}: <strong style={{ color: "#E65100" }}>{new Intl.NumberFormat(locale).format(Object.values(selectedItems).reduce((sum, item) => sum + (item.price * item.qty), 0))} FRW</strong>
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                label={tCustomer('initialPayment')}
                                                type="number"
                                                value={amountPaidNow}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    const total = Object.values(selectedItems).reduce((sum, item) => sum + (item.price * item.qty), 0);
                                                    if (val > total) {
                                                        return;
                                                    }
                                                    setAmountPaidNow(e.target.value);
                                                }}
                                                inputProps={{ min: 0 }}
                                                helperText={`${t('debtTransferSubtitle')}: ${new Intl.NumberFormat(locale).format(Object.values(selectedItems).reduce((sum, item) => sum + (item.price * item.qty), 0) - (parseFloat(amountPaidNow) || 0))} FRW`}
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        bgcolor: "#FFFFFF",
                                                        borderRadius: "8px",
                                                        "& fieldset": {
                                                            borderColor: "#E9D5FF"
                                                        },
                                                        "&:hover fieldset": {
                                                            borderColor: "#DDD6FE"
                                                        },
                                                        "&.Mui-focused fieldset": {
                                                            borderColor: "#7C3AED"
                                                        }
                                                    }
                                                }}
                                            />
                                        </>
                                    )}
                                </Box>
                            )}
                        </>
                    )}
                </DialogContent>

                {/* Premium Footer - Responsive */}
                <Box sx={{
                    borderTop: "1px solid #E5E7EB",
                    padding: { xs: "16px", md: "20px 28px" },
                    bgcolor: "#F9FAFB",
                    borderRadius: { xs: "0", md: "0 0 16px 16px" },
                    display: "flex",
                    gap: "12px",
                    justifyContent: "flex-end",
                    position: { xs: "relative", md: "absolute" },
                    bottom: { xs: "auto", md: 0 },
                    right: { xs: "auto", md: 0 },
                    left: { xs: "auto", md: "35%" },
                    width: { xs: "100%", md: "auto" }
                }}>
                    <Button
                        onClick={onClose}
                        sx={{
                            color: "#6B7280",
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            textTransform: "none",
                            px: "24px",
                            py: "10px",
                            borderRadius: "8px",
                            border: "1.5px solid #E5E7EB",
                            bgcolor: "#FFFFFF",
                            transition: "all 0.2s ease",
                            "&:hover": {
                                bgcolor: "#F3F4F6",
                                borderColor: "#D1D5DB",
                                color: "#374151"
                            }
                        }}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={isLoading || transferMutation.isPending || sellMutation.isPending}
                        sx={{
                            bgcolor: "#FF6D00",
                            color: "white",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            textTransform: "none",
                            px: "32px",
                            py: "10px",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(255, 109, 0, 0.3)",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            "&:hover": {
                                bgcolor: "#E65100",
                                boxShadow: "0 8px 20px rgba(255, 109, 0, 0.4)",
                                transform: "translateY(-2px)"
                            },
                            "&:disabled": {
                                bgcolor: "#D1D5DB",
                                color: "#F3F4F6",
                                boxShadow: "none",
                                cursor: "not-allowed"
                            }
                        }}
                    >
                        {transferMutation.isPending || sellMutation.isPending ? tActions('processing') : t('confirm')}
                    </Button>
                </Box>
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
