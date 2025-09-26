import Image from "next/image"
const ProductDes = ({productDescription}) =>{
    return(
        <>
        <section>
           <div className="py-20 flex space-x-32">
                <div className="relative w-72 h-72 rounded-2xl">
                <Image
                    src={productDescription?.productimage || "/images/placeholder.png"}
                    alt="Sold product Image"
                    fill
                    className="object-cover border-2 rounded-2xl border-gray-600"
                />
                </div>

                <div className="grid grid-cols-2 font-bold ">
                    <p>Name</p><p className="text-gray-600">{productDescription.name}</p>
                    <p>Category</p><p className="text-gray-600">{productDescription.category}</p>
                    <p>Price</p><p className="text-gray-600">{productDescription.price}</p>
                    <p>Buyer</p><p className="text-gray-600">{productDescription.buyer}</p>
                    <p>description</p><p className="text-gray-600">{productDescription.description}</p>
                </div>
            </div>
        </section>
        </>
    )
}


export default ProductDes