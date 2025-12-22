"use client";
import { useQuery } from "@tanstack/react-query";
import { MultiProductSalesTable } from "./table";
import { getAllProducts } from "@/services/salesService";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function MultiSalesDemo() {
    const { data: products = [], isLoading, error } = useQuery({
        queryKey: ["products"],
        queryFn: getAllProducts,
    });

    const handleSell = (payload) => {
        console.log("=== SELL PAYLOAD ===");
        console.log(JSON.stringify(payload, null, 2));
        console.log("====================");

        // Here you would call your actual API
        // Example:
        // const fullPayload = {
        //   ...payload,
        //   companyId: "a6e0c5ff-8665-449d-9864-612ab1c9b9f2",
        //   customerName: "Walk-in Customer",
        //   customerPhone: "+250788000000",
        //   paymentMethod: "cash",
        //   totalAmount: payload.items.reduce((sum, item) => 
        //     sum + (item.sellingPrice * item.quantity), 0
        //   )
        // };
        // await SellProduct(fullPayload);

        alert(`Selling ${payload.items.length} products! Check console for payload.`);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <CircularProgress sx={{ color: "#FF6D00" }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">
                    Failed to load products: {error.message}
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <MultiProductSalesTable
                products={products}
                onSell={handleSell}
            />
        </Box>
    );
}
