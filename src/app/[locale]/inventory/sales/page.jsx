"use client";
import { Trash, DownloadCloud } from "lucide-react";
import { Jost } from "next/font/google";
import DataTable from "./table";
import Link from "next/link";
import { Button } from "@/components/shared/button";

const jost = Jost({
  weight: "400",
  subsets: ["latin"],
});

const SalesPage = () => {
  const myfilter = [
    { id: 1, name: "Delete", icon: <Trash size={18} /> },
    { id: 2, name: "Export", icon: <DownloadCloud size={18} /> },
  ];


  return (
    <>
     <section className="w-full  inline-grid" >
      <div className="space-y-10" >
      <div className="space-y-5">
        <h1 className="text-2xl font-medium ">Manage and Track All Sales Records</h1>
        <p className="space-x-5 font-light"><span>Dashboard</span><span>.</span><span>Products</span><span>.</span><span className="text-gray-500">List</span></p>
        <Link href="/inventory/sales/sellProduct/sale" ><Button variant="outline" className=" cursor-pointer" >Stock Out</Button></Link>
      </div>
      <DataTable />
      </div>
     </section>
    </>
  );
};

export default SalesPage;













