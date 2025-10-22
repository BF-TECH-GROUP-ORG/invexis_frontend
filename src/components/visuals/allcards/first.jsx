import { BarChart } from "@mui/icons-material"
import Link from "next/link"
const FirstCard = () =>{
    return(
        <>
         <div className="ring  flex  ring-gray-200 p-4 rounded  bg-white">
                 <div className="w-full grid grid-rows-1">
                     <div className=" h-full">
                           <BarChart className="text-orange-400  text-xl" />
                     </div>
                     <div>
                              <h1>Total Stock Revenue</h1>
                              <p className="text-2xl font-black">5,000,000</p>
                          </div>
                    
                 </div>
                     
                 <div className="w-full flex justify-end items-end">
                   <Link href={`/inventory/products/list`}  ><button className="cursor-pointer hover:text-gray-500">Inventory</button> </Link>
                 </div>
         
                  </div>
        </>
    )
}

export default FirstCard
