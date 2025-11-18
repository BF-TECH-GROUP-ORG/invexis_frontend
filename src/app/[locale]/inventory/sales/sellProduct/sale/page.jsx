"use client"
import CurrentInventory from "./stockProducts"
import { useRouter } from "next/navigation"
import { ArrowBack } from "@mui/icons-material"

const SaleProduct = () =>{
    const router = useRouter()
    
    return(
        <>
        <div className="mb-5">
            <button onClick={() => router.back()} 
            className="border  px-4 py-2 flex items-center space-x-2 cursor-pointer rounded-xl  mb-3">
            <ArrowBack /><span>Back</span></button>
            <h1 className="text-2xl font-medium">Stock Out Product</h1>
            <p>Record details for products leaving the store or warehouse</p>
        </div>
        <section>
            <CurrentInventory />
        </section>
        </>
    )
}

export default SaleProduct