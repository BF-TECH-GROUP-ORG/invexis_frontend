"use client";

import { useParams } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import { getBranchById } from "@/services/branches";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import BranchForm from "@/components/forms/BranchForm";

const EditBranchPage = () => {
    const params = useParams();
    const branchId = params.id;
    const { data: session } = useSession();
    const companyObj = session?.user?.companies?.[0];
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

    // Fetch branch data
    const { data: branchData, isLoading: isFetchingBranch } = useQuery({
        queryKey: ["branch", branchId],
        queryFn: () => getBranchById(branchId, companyId),
        enabled: !!branchId && !!companyId,
        select: (response) => response?.data || response,
    });

    if (isFetchingBranch) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                <CircularProgress size={60} sx={{ color: "#fe6600" }} />
            </Box>
        );
    }

    return (
        <div className="bg-[#f9fafb] min-h-screen">
            <BranchForm initialData={branchData} isEditMode={true} companyId={companyId} />
        </div>
    );
};

export default EditBranchPage;
