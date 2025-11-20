"use client"
import UpdateInputs from "./inputs"
import { useTranslations } from 'next-intl';    


const UpdateSale = ({productinfo}) =>{
    const t = useTranslations("updateProduct")
   
    return(
        <>
        <section className="space-y-10" >
           <div>
             <h1 className=" text-center text-2xl font-bold"> {t('pageTitle')}<span className="text-orange-500">{productinfo}</span> 
             </h1>
            <p className="text-center text-gray-500">{t('pageSubtitle')}</p>
           </div>
            <div className="">
                    <UpdateInputs />
                
            </div>
        </section>
        </>

    )
}

export default UpdateSale