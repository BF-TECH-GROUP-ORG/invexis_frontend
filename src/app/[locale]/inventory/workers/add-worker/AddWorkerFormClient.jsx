"use client";

import dynamic from "next/dynamic";

const AddWorkerForm = dynamic(() => import("@/components/forms/AddWorkerForm"), { ssr: false });

export default function AddWorkerFormClient(props) {
    return <AddWorkerForm {...props} />;
}
