'use client'
import { Button , TextField } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";

const rows = [
  {
    id: 1,
    name: "Alice",
    age: 24,
    email: "alice@example.com",
    phone: "+250788111111",
    country: "Rwanda",
    city: "Kigali",
    status: "Active",
    role: "Developer",
    joined: "2023-01-10",
  },
  {
    id: 2,
    name: "Bob",
    age: 30,
    email: "bob@example.com",
    phone: "+250788222222",
    country: "Kenya",
    city: "Nairobi",
    status: "Inactive",
    role: "Designer",
    joined: "2022-11-20",
  },
  // ... add more rows
  {
    id: 3,
    name: "Alice",
    age: 24,
    email: "alice@example.com",
    phone: "+250788111111",
    country: "Rwanda",
    city: "Kigali",
    status: "Active",
    role: "Developer",
    joined: "2023-01-10",
  },
  {
    id: 4,
    name: "Bob",
    age: 30,
    email: "bob@example.com",
    phone: "+250788222222",
    country: "Kenya",
    city: "Nairobi",
    status: "Inactive",
    role: "Designer",
    joined: "2022-11-20",
  },
];

const columns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "name", headerName: "Name", width: 130 },
  { field: "age", headerName: "Age", width: 90 },
  { field: "email", headerName: "Email", width: 200 },
  { field: "phone", headerName: "Phone", width: 160 },
  { field: "country", headerName: "Country", width: 120 },
  { field: "city", headerName: "City", width: 120 },
  { field: "status", headerName: "Status", width: 120 },
  { field: "role", headerName: "Role", width: 150 },
  { field: "joined", headerName: "Joined Date", width: 150 },
];




const SalesPage = () =>{
    const myfilter = [
        {id:1,name:"All"},
        {id:2,name:"Pending"},
        {id:3,name:"Completed"},
        {id:4,name:"Cancelled"}
    ]

    const navigation = useRouter()
    return(
        <>
         <section className="py-16 sm:py-20 px-5 sm:px-10 md:px-16 lg:px-20">
           <div className="space-y-5">
             <h1 className="text-2xl font-bold">Orders</h1>
            <ul className="flex space-x-5 text-md">
                <li>Dashboard</li>
                <li><p className="space-x-5"><span>.</span>  <span>Orders</span></p></li>
            </ul>
           </div>

           <div className="w-full  border border-gray-300 shadow-lg shadow-gray-100 mt-10 rounded-3xl">
            <div className="w-ful">
               <div className="border-b border-gray-300">
                  <ul>
                    {
                        myfilter.map((content , index)=>(
                           <Button key={index}  sx={{textTransform:"none",color:"gray",height:50, paddingX:5,":focus":{color:"black"}}} variant="text" >{content.name}</Button>
                        ))
                    }
                </ul>
               </div>
                <div className="mt-5 p-4 gap-3 grid md:grid-cols-2 sm:grid-cols-1 lg:grid-cols-2">
                    <div className=" gap-3 grid md:grid-cols-2 sm:grid-cols-1 lg:grid-cols-2">
                       <div><TextField
                            fullWidth
                            label="Start Date"
                            placeholder="DD/MM/YY"
                            variant="outlined"
                            color="orange"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                "&.Mui-focused fieldset": {
                                 borderColor: "orange", 
                                },
                                },
                            }}
                            />
                        </div>
                       <div>
                        <TextField
                            fullWidth
                            label="Start Date"
                            placeholder="DD/MM/YY"
                            variant="outlined"
                            color="gray"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                "&.Mui-focused fieldset": {
                                 borderColor: "orange", 
                                },
                                },
                            }}
                            />
                       </div>
                    </div>
                    <div className="w-full">
                        <TextField  placeholder="Search customer or order number" fullWidth color="gray" />
                    </div>
                </div>

                 <DataGrid
                  
                  rows={rows}
                  columns={columns}
                  pageSize={5}
                  onRowClick={(params)=>{
                    navigation.push(`/inventory/sales/${params.id}`)
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
      color:"black"
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
    )
}
export default SalesPage