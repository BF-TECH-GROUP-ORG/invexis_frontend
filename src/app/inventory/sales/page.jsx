'use client'
import { Button , TextField , Table } from "@mui/material"
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'firstName', headerName: 'First name', width: 130 },
  { field: 'lastName', headerName: 'Last name', width: 130 },
  {
    field: 'age',
    headerName: 'Age',
    type: 'number',
    width: 90,
  },
  {
    field: 'fullName',
    headerName: 'Full name',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 160,
    valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
  },
];

const rows = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];

const paginationModel = { page: 0, pageSize: 5 };


const SalesPage = () =>{
    const myfilter = [
        {id:1,name:"All"},
        {id:2,name:"Pending"},
        {id:3,name:"Completed"},
        {id:4,name:"Cancelled"}
    ]
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
               <div className="border-b-2 border-gray-300">
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
                            color="gray"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                "&.Mui-focused fieldset": {
                                 borderColor: "gray", 
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
                                 borderColor: "gray", 
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
                 
                </div>

           </div>
         </section>
        </>
    )
}
export default SalesPage