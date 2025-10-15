import React from 'react';
import Image from 'next/image'; 
import { Edit , Download } from "@mui/icons-material"
import { useRouter } from 'next/navigation';

const LeftSide = ({saleOverView}) => {
    const navigate = useRouter()

    const moreDetails = [
        { label: "Quantity Sold", value: saleOverView.quantity },
        { label: "Sold Price (RwF)", value: saleOverView.price },
        { label: "Discount", value: `${saleOverView.discount}%` },
        { label: "Sold Date", value: saleOverView.soldDate },
        { label: "is returned", value: saleOverView.returned === "false" ? <span className='text-green-500'>false</span> : <span className='text-red-500'>true</span> },
        {label:"warranty",value:saleOverView.warranty}
    ]
    const buyerInfo = [
        {label:"Buyer",value:saleOverView.buyer},
        {label:"Buyer Phone number",value:saleOverView.buyerPhone}
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
                <Download /> Print</button>
                <button 
                onClick={()=>{navigate.push(`/inventory/sales/${saleOverView.id}/${saleOverView.id}`)}}
                className='px-4 cursor-pointer py-2 ring ring-gray-200 rounded-xl hover:bg-orange-400 hover:text-white transition-all '><Edit />Edit </button>
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
        <h1 className='text-md text-black font-bold py-4'>Buyer Details</h1>
        {buyerInfo.map((details,index)=>(
            <div className='py-4 border-b border-gray-300 w-full' >
                        <div key={index} className='flex w-1/3 justify-between'>
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




// <div className='flex w-1/3 justify-between'>
//                      <h1 className='text-md text-gray-600 font-semibold ' >Quantity Sold</h1>
//                     <p className='text-md text-black font-semibold'>{saleOverView.quantity} Pieces </p>
//                    </div>



//         <div className="flex justify-between">
//           <div><span>Quantity sold</span></div>
//           <div><span className="font-semibold text-gray-800">1</span></div>
//         </div>

//         <div className="flex justify-between">
//           <span>Total sale price</span>
//           <span className="text-orange-500 font-medium">$10</span>
//         </div>
//         <div className="flex justify-between">
//           <span>Discount</span>
//           <span className="text-orange-500 font-medium">10%</span>
//         </div>
//         <div className="flex justify-between pt-4 border-t border-gray-200">
//           <span className="text-lg font-semibold text-gray-800">Income</span>
//           <span className="text-lg font-bold text-gray-900">$73.74</span>
//         </div>








// <div className="flex pb-4 border-b border-gray-100">
//         <div><h2 className="text-xl md:text-2xl font-bold text-gray-800">Sale Overview</h2></div>
//          <div><button className="text-gray-500 hover:text-gray-700 p-1 transition duration-150">
//          <Edit className="w-5 h-5 md:w-6 md:h-6" /> 
//         </button></div>

//       </div>

//       <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 pb-6 border-b border-gray-200">
//         <div className="w-16 h-16 mr-4 mb-3 sm:mb-0 relative flex-shrink-0">
//           <Image
//             src="https://i.pinimg.com/1200x/bb/bd/2c/bbbd2c432e7bc715297c5badfb16da1e.jpg"
//             alt="Urban Explorer Sneakers"
//             layout="fill"
//             objectFit="cover"
//             className="rounded-md"
//           />
//         </div>

//         <div className="flex-grow w-full sm:w-auto">
//           <p className="font-medium text-gray-800 truncate">{saleOverView.name}</p>
//           <p className="text-sm text-gray-500">{saleOverView.category}</p>
//         </div>
//       </div>

//      
//       <div>
//        <div className='flex justify-between px-10 py-4 ring ring-gray-300'>
//          <p>Quantity sold</p>
//          <p>{saleOverView.quantity}</p>
//        </div>

//        <div className='flex justify-between px-10 py-4 ring ring-gray-300'>
//          <p>Sold Price {`(RwF)`} </p>
//          <p>{saleOverView.price}</p>
//        </div>
//      
//       </div>