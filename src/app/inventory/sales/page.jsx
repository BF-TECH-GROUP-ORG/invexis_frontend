"use client";
import { Button, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import NavBar from "@/components/layouts/NavBar";
import SideBar from "@/components/layouts/SideBar";
import { Trash, DownloadCloud } from "lucide-react";
import { Inter, Roboto } from "next/font/google";

const roboto = Inter({
  subsets: ["latin"],
  weight: "400",
});

const rows = [
  {
    id: 1,
    ProductName: "Alice",
    Category: 24,
    UnitPrice: 100,
    InStock: 10,
    Discount: "20%",
    Date: "12/09/2024",
    TotalValue: 40,
    action: "more",
  },
  {
    id: 2,
    ProductName: "Alice",
    Category: 24,
    UnitPrice: 100,
    InStock: 10,
    Discount: "20%",
    Date: "12/09/2024",
    TotalValue: 40,
    action: "more",
  },
  {
    id: 4,
    ProductName: "Alice",
    Category: 24,
    UnitPrice: 100,
    InStock: 10,
    Discount: "20%",
    Date: "12/09/2024",
    TotalValue: 40,
    action: "more",
  },
];

const columns = [
  { field: "id", headerName: "Sale", width: 70 },
  { field: "ProductName", headerName: "Product Name", width: 130 },
  { field: "Category", headerName: "Category", width: 90 },
  { field: "UnitPrice", headerName: "Unit Price (FRW)", width: 200 },
  { field: "InStock", headerName: "In Stock", width: 160 },
  { field: "Discount", headerName: "Discount", width: 120 },
  { field: "Date", headerName: "Date", width: 120 },
  { field: "TotalValue", headerName: "Total Value", width: 120 },
  { field: "action", headerName: "View", width: 10 },
];

const SalesPage = () => {
  const myfilter = [
    { id: 1, name: "Delete", icon: <Trash size={18} /> },
    { id: 2, name: "Export", icon: <DownloadCloud size={18} /> },
  ];

  const navigation = useRouter();
  return (
    <>
      {/* <NavBar />
        <SideBar /> */}
      <section
        className={`${roboto.className} px-2 sm:px-5 md:px-5 lg:px-20 transition-all duration-300 ml-20 z-40`}
      >
        <div className="space-y-3 sm:text-center md:text-left">
          <h1 className="text-2xl font-bold text-orange-600">
            Top Selling Items
          </h1>
          <p className="space-x-2 text-md">
            <span>Dashboard</span>
            <span>/</span>
            <span>Sales</span>
            <span>/</span>
            <span className="text-gray-400">List</span>
          </p>
        </div>

        <div className="w-full  border border-gray-300 shadow-lg shadow-gray-100 mt-10 rounded-3xl">
          <div className="w-ful">
            <div className="border-b justify-end flex w-full  bg-amber-600">
              <ul className="space-x-2">
                {myfilter.map((content, index) => (
                  <Button
                    key={index}
                    sx={{
                      textTransform: "none",
                      color: "white",
                      borderRadius: 10,
                      ":focus": { color: "white" },
                    }}
                    variant="text"
                    className="space-x-3 bg-orange-600"
                  >
                    <i>{content.icon}</i>
                    <span> {content.name}</span>
                  </Button>
                ))}
              </ul>
            </div>

            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={5}
              onRowClick={(params) => {
                navigation.push(`/inventory/sales/${params.id}`);
              }}
              rowHeight={60}
              sx={{
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#1976d2",
                  color: "gray",
                  fontSize: 16,
                  fontWeight: "extrabold",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#f5f5f5",
                  color: "black",
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid #ddd",
                },
              }}
            />
          </div>
        </div>
      </section>
    </>
  );
};
export default SalesPage;
