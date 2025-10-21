import CurrentInventory from "./stockProducts"
const SaleProduct = () =>{
    return(
        <>
        <div className="">
            <h1 className="text-2xl font-medium">Stock Out Product</h1>
            <p>Record details for products leaving the store or warehouse</p>
        </div>
        <section>
            <CurrentInventory />
        </section>
        </>
    )
}

export default SaleProduct