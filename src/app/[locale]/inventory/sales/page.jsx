"use client";
import { Trash, DownloadCloud } from "lucide-react";
import { Jost } from "next/font/google";
import DataTable from "./table";
import Link from "next/link";
import { Button } from "@/components/shared/button";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";

const jost = Jost({
  weight: "400",
  subsets: ["latin"],
});

const SalesPage = () => {
  const myfilter = [
    { id: 1, name: "Delete", icon: <Trash size={18} /> },
    { id: 2, name: "Export", icon: <DownloadCloud size={18} /> },
  ];

  const locale = useLocale();
  const t = useTranslations("sales");


  return (
    <>
     <section className="w-full  inline-grid" >
      <div className="space-y-10 w-full" >
         <div className="space-y-5 flex justify-between  ">
          <div>
            <h1 className="text-2xl font-medium ">{t("title")}</h1>
           <p className="space-x-10  font-light"><span>{t("dashboard")}</span><span>.</span><span>{t("products")}</span><span>.</span><span className="text-gray-500">{t("list")}</span></p>
          </div>
          <div>
         <Link href={`/${locale}/inventory/sales/sellProduct/sale`} ><button  className="px-8 py-3 rounded-lg bg-orange-500  text-white cursor-pointer" >{t("stockOut")}</button></Link>
          </div>
      </div>
      <DataTable />
      </div>
     </section>
    </>
  );
};

export default SalesPage;













