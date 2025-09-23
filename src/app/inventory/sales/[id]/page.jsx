import { Edit2 , Printer , StepBack } from "lucide-react";
import { Button } from "@mui/material";
import NavBar from '../../../../components/layouts/NavBar'
import SideBar from "@/components/layouts/SideBar";


export default async function eaProduct({params}) {
    const {id} = await params;
    let today = "2 /septmber / 2025  11:11pm"

    const testingData = [
        {id:1,name:""}
    ]
    return(
        <>
        <NavBar />
        <SideBar />
        <section className="py-16 space-y-12 sm:py-20 px-5 sm:px-10 md:px-16 lg:px-20">
            
            <div className="flex w-full justify-between">
                <div className="flex space-x-5 item">
                    <div>
                        <p><StepBack /> </p>
                    </div>
                   <div>
                    <h1 className="text-3xl font-bold flex">Product {id} </h1>
                    <p className="text-gray-400">{today}</p>
                   </div>
                </div>
                <div className="space-x-5 items-center flex">
                    <button className="px-6 py-2 border border-gray-500 transition-all  text-gray-500 rounded-2xl hover:bg-orange-500 hover:border-orange-500 hover:text-white"><Printer  /></button>
                    <button className="px-6 py-2 border border-gray-500 transition-all  text-gray-500 rounded-2xl hover:bg-orange-500 hover:border-orange-500 hover:text-white">Delete</button>
                </div>
            </div>


            <section className="w-full rounded-2xl flex  space-x-4 ">
                <div className="w-2/3  p-5 border  border-gray-100 rounded-2xl">
                    <div className="flex justify-between items-center"><h1 className="text-lg font-semibold">Details</h1><i><button className="hover:bg-gray-200 p-2 rounded-full"><Edit2 fill="gray" strokeOpacity={0} /></button></i></div>
                </div>
                    <div className="w-1/3  p-5 border  border-gray-100 rounded-2xl">
                    <div className="flex justify-between items-center"><h1 className="text-lg font-semibold">Cutomer</h1><i><button className="hover:bg-gray-200 p-2 rounded-full"><Edit2 fill="gray" strokeOpacity={0} /></button></i></div>
                </div>
            </section>
        </section>
        </>
    )
    
}
