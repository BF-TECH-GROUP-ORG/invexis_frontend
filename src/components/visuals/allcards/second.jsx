"use client"
import { ShoppingBag } from "@mui/icons-material"
import Link from "next/link"

const SecondCard = () =>{
    return(
        <>
        <div className="ring  flex  ring-gray-200 p-4 rounded  bg-white">
        <div className="w-full grid grid-rows-2">
            <div className=" h-full">
                     <ShoppingBag className="text-orange-400  text-xl" />
            </div>
            <div>
                     <h1>Total Products Sold</h1>
                     <p className="text-2xl font-black">1000</p>
                 </div>
           
        </div>
            
        <div className="w-full flex justify-end items-end">
          <Link href={`/inventory/sales`}><button className="cursor-pointer hover:text-gray-500  " >Sales</button></Link>  
        </div>

         </div>
        </>
    )
}

export default SecondCard



//                     


//  