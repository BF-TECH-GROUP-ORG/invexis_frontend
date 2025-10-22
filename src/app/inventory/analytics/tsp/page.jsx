import Image from "next/image"

const TopSellingProducts = () =>{
    const topSoldProducts = [
        {name:"Sumsung Phone",image:"",leftinStock:"2",stockinDate:"12/12/2025",stockedin:"10",stockedOut:"8"},
        {name:"Sumsung Phone",image:"",leftinStock:"2",stockinDate:"12/12/2025",stockedin:"10",stockedOut:"8"},
        {name:"Sumsung Phone",image:"",leftinStock:"2",stockinDate:"12/12/2025",stockedin:"10",stockedOut:"8"},
        {name:"Sumsung Phone",image:"",leftinStock:"2",stockinDate:"12/12/2025",stockedin:"10",stockedOut:"8"}
    ]
    return(
        <>
        <h1 className="text-xl">Top selling products List</h1>
        <section>
            {topSoldProducts.map((item , index)=>(
                <div key={index} className="py-5 border-b flex justify-between  border-gray-500">
                    <Image src={item.image} height={50} width={50} className="ring ring-gray-400" alt="product image" />
                    <div>
                        <h2 className="text-gray-500">Product name</h2>
                        <h3 className="text-lg font-bold">{item.name}</h3>
                    </div>
                    <div>
                        <h2 className="text-gray-500">Stocked in was</h2>
                        <h3 className="text-lg font-bold">{item.stockedin}</h3>
                    </div>
                    <div>
                        <h2 className="text-gray-500">currently sold</h2>
                        <h3 className="text-lg font-bold">{item.stockedOut}</h3>
                    </div>
                    <div>
                        <h2 className="text-gray-500">currently Stock</h2>
                        <h3 className="text-lg font-bold">{item.leftinStock}</h3>
                    </div>
                    <div>
                        <h2 className="text-gray-500">stocked in date</h2>
                        <h3 className="text-lg font-bold">{item.stockinDate}</h3>
                    </div>
                </div>
            ))}

        </section>
        </>
    )
}

export default TopSellingProducts