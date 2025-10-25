import {  Warehouse } from "@mui/icons-material"
import Link from "next/link"
const ThirdCard = () =>{
    return(
        <>
         <div className="ring  flex  ring-gray-200 p-4 rounded bg-white ">
                 <div className="w-full grid grid-rows-2">
                     <div className=" h-full">
                              <Warehouse className="text-orange-400  text-xl" />
                     </div>
                     <div>
                              <h1>Total Stock Remaining</h1>
                              <p className="text-2xl font-black">35%</p>
                          </div>
                    
                 </div>
                     
                 <div className="w-full flex justify-end items-end">
                   <Link href={`/inventory/stock`}><button className="cursor-pointer hover:text-gray-500">Stock In</button></Link>
                 </div>
         
                  </div>
        </>
    )
}

export default ThirdCard