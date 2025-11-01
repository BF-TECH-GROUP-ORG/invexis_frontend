"use client";
import useProducts from "@/hooks/useProducts";

export default function ProductsPage() {
  const { products, loading, addProduct, removeProduct } = useProducts();

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Products</h1>
      <button onClick={() => addProduct({ name: "New Item", stock: 100 })}>
        Add Product
      </button>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.name} - Stock: {p.stock}
            <button onClick={() => removeProduct(p.id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
