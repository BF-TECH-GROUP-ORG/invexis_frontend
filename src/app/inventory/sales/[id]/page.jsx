"use client";
import { useState, useEffect } from "react";
import ProductDes from "./productdes";
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'


const OrderDetails = () => {
  const productInfo = {
    id: "P-001",
    discount:0,
    name: "Iphone 15 Pro max",
    soldDate: "Sep 20, 2025 11:11pm ",
    returned:"false",
    quantity:2,
    category: "Electronic devices",
    price: 1000000,
    buyer: "John Doe",
    buyerPhone:"078 000 000",
    warranty:"6 months",
    description:
      "Appel mobile phone version 15 pro max",
    productimage:
      "https://i.pinimg.com/1200x/81/d0/62/81d0626ebf5f866987d4f613e09fe780.jpg", 
  };

  const navigate = useRouter()

  return (
    <>
    <section className="space-y-10">
     <div className="">
      <button className="flex cursor-pointer items-center text-xl space-x-3" onClick={()=>{navigate.back()}}><ArrowBackIcon /><span>Sales</span></button>
     </div>

     <div className="flex">
      <ProductDes productDescription={productInfo} />
      </div>
    </section>
    
    </>
  );
};

export default OrderDetails;




