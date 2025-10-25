import { ShoppingBag } from "@mui/icons-material"
import Link from "next/link"
import { ArrowUpNarrowWide } from "lucide-react"
const FourthCard = () =>{
    return(
        <>
         <div className="ring flex ring-gray-200 p-4 rounded bg-white ">
                 <div className="w-full grid grid-rows-2">
                     <div className=" h-full">
                              <ArrowUpNarrowWide className="text-orange-400  text-xl" />
                     </div>
                     <div>
                              <h1>Top-Selling Product</h1>
                              <p  className="text-2xl font-black">
                                Electronics
                              </p>
                          </div>
                    
                 </div>
                     
                 <div className="w-full flex justify-end items-end">
                    <Link href={`/inventory/analytics/tsp`}> <button className="cursor-pointer hover:text-gray-500">View</button></Link>
                 </div>
         
                  </div>
        </>
    )
}

export default FourthCard