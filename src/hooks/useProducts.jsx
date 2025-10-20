// fetch/create/update/delete products.

import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, addProduct} from "@/features/products/productSlice";
import { useEffect } from "react";

export default function useProducts() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return {
    products: items,
    loading,
    error,
    addProduct: (product) => dispatch(addProduct(product)),
    removeProduct: (id) => dispatch(removeProduct(id)),
  };
}
