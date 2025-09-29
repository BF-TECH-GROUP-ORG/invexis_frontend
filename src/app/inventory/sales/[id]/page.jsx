"use client";
import { useState, useEffect } from "react";
import TopNavBar from "@/components/layouts/NavBar";
import SideBar from "@/components/layouts/SideBar";
import Image from "next/image";
import ProductDes from "./productdes";

const OrderDetails = () => {
  // Mock data arrays (you can replace later with API calls)
  const productInfo = {
    id: "P-001",
    name: "Iphone 15 Pro max",
    soldDate: "Sep 20, 2025",
    category: "Electronic devices",
    price: "$12.50",
    buyer: "John Doe",
    description:
      "Appel mobile phone version 15 pro max",
    productimage:
      "https://i.pinimg.com/1200x/81/d0/62/81d0626ebf5f866987d4f613e09fe780.jpg", // Example from Pinterest
  };

  const salesHistory = [
    { id: "#S001", date: "Sep 20, 2025", customer: "Alice M.", qty: 10, amount: "$125" },
    { id: "#S002", date: "Sep 18, 2025", customer: "David K.", qty: 5, amount: "$62.50" },
    { id: "#S003", date: "Sep 16, 2025", customer: "Jane P.", qty: 12, amount: "$150" },
  ];

  const reviews = [
    { user: "John D.", rating: 5, comment: "Excellent paper quality!" },
    { user: "Martha L.", rating: 4, comment: "Good value, but packaging could improve." },
    { user: "Kevin O.", rating: 5, comment: "Perfect for my office printing needs." },
  ];

  let  ctaButtons = [
    {name:"Print",icon:"print"},
    {name:"Share",icon:"print"},
    {name:"Reciept",icon:"print"}
  ]

  return (
    <>
    <section className="">

      <div className="flex justify-between">
          <div>
            <h1 className="text-2xl font-bold text-orange-600">{productInfo.name}</h1>
            <p className="text-gray-800 font-semibold">Sold On <span className="text-gray-600">{productInfo.soldDate}</span></p>
          </div>
          <div className="space-x-3">
            {
              ctaButtons.map((content , index)=>(
                <button key={index}  className="border px-4 py-2 text-black rounded hover:bg-orange-200 hover:cursor-pointer  hover:text-orange-600" >{content.name}</button>
              ))
            }
        </div>    
     </div>

      {/* End of navigation bar */}


     <ProductDes productDescription={productInfo} />
    </section>
    
    </>
  );
};

export default OrderDetails;
