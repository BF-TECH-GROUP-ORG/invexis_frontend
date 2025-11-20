"use client";
import React from "react";
import SellProductsInputs from "@/components/forms/sellProductsInputs";

const SellProduct = ({ params }) => {
  const p = React.use(params);  // unwrap the promise
  const id = p.id;

  console.log("Product name:", id.ProductName);

  return (
    <div className="flex items-center justify-center">
      <SellProductsInputs id={id} />
    </div>
  );
};

export default SellProduct;
