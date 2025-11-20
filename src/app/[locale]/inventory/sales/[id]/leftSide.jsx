import React from 'react';
import Image from 'next/image'; 
import { Edit, Download } from "@mui/icons-material"
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';     // next-intl
import { useLocale } from 'next-intl';

const LeftSide = ({saleOverView}) => {
    const navigate = useRouter()
    const locale = useLocale()
    
    // This matches your exact JSON namespace "reciept"
    const t = useTranslations('reciept');

    const moreDetails = [
        { label: t('quantitySold'), value: saleOverView.quantity },                               
        { label: t('soldPrice'), value: saleOverView.price },
        { label: t('discount'), value: `${saleOverView.discount}%` },
        { label: t('soldDate'), value: saleOverView.soldDate },
        { label: t('isReturned'), value: saleOverView.returned === "false" ? <span className='text-green-500'>false</span> : <span className='text-red-500'>true</span> },
        { label: t('warranty'), value: saleOverView.warranty }
    ]

    const buyerInfo = [
        { label: t('buyer'), value: saleOverView.buyer },
        { label: t('buyerPhoneNumber'), value: saleOverView.buyerPhone }   // matches your key
    ]

    return (
     <div className="w-full space-y-5">
           <div className='flex justify-between  py-4 '>
            <div className='flex items-end space-x-5'>
                <Image src={saleOverView.productimage} alt="Urban Explorer Sneakers" width={100}
                height={100} objectFit="cover" className="rounded-md ring ring-gray-200"
                />
                <div>
                    <h1 className='text-2xl font-bold text-orange-400'>{saleOverView.name}</h1>
                    <p className='text-gray-500' >{saleOverView.description}</p>
                </div>
            </div>
             <div className='space-x-3'>
                    <button
                    className='px-4 cursor-pointer py-2 ring ring-gray-200 rounded-xl hover:bg-orange-400 hover:text-white transition-all'>
                    <Download /> {t('print')}</button>
                    <button 
                    onClick={()=>{navigate.push(`/${locale}/inventory/sales/${saleOverView.id}/${saleOverView.id}`)}}
                    className='px-4 cursor-pointer py-2 ring ring-gray-200 rounded-xl hover:bg-orange-400 hover:text-white transition-all '>
                    <Edit /> {t('edit')} </button>
                </div>
           </div>

           <div>
                <h1 className='text-md text-black font-bold py-4'>Product Details</h1>
                <div className='border-t border-gray-300 w-full'>
                    {
                        moreDetails.map((detail, index) => (
                            <div key={index} className='py-4 border-b border-gray-300 w-full' >
                            <div  className='flex w-1/3 justify-between'>
                                <p className='text-md text-gray-600 font-semibold '>{detail.label}</p>
                                <p className='text-md text-black font-semibold'>{detail.value}</p>
                            </div>
                            </div>
                        ))
                    }
                </div>
           </div>

           <div>
            <h1 className='text-md text-black font-bold py-4'>{t('buyerDetails')}</h1>
            {buyerInfo.map((details,index)=>(
                <div key={index} className='py-4 border-b border-gray-300 w-full' >
                            <div  className='flex w-1/3 justify-between'>
                                <p className='text-md text-gray-600 font-semibold '>{details.label}</p>
                                <p className='text-md text-black font-semibold'>{details.value}</p>
                            </div>
                            </div>
            ))}
           </div>
           
           <div>
           </div>

     </div>
      );
};

export default LeftSide;