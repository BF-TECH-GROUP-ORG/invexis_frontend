import UpdateInputs from "./inputs"
const UpdateSale = ({productinfo}) =>{
    return(
        <>
        <section className="space-y-10" >
           <div>
             <h1 className=" text-center text-2xl font-bold" >Edit Sale <span className="text-orange-500">myproduct</span> {productinfo}</h1>
            <p className="text-center text-gray-500">Update this sale’s information including product details, payment, and customer data.</p>
           </div>
            <div className="flex items-center justify-center">
                    <UpdateInputs />
                
            </div>
        </section>
        </>

    )
}

export default UpdateSale