"use client";

import BranchForm from "@/components/forms/BranchForm";

const NewBranchPage = () => {
    return (
        <div className="bg-[#f9fafb] min-h-screen">
            <BranchForm isEditMode={false} />
        </div>
    );
};

export default NewBranchPage;
