import { Store , Users ,Boxes ,CircleX} from 'lucide-react';
import SalesPerformance from '@/components/visuals/sales/salesPerformance';


const AnalyticsPage = () =>{
    const headerCards = [
           {
                    title: "Total Daily Sales",
                    value: 200,
                    icon: <Store size={45} className="text-purple-500 bg-purple-50 p-2 rounded-xl" />
                },
                {
                    title: "Total Daily Profit",
                    value: 200,
                    icon: <Users size={45} className="text-green-500 bg-green-50 p-2 rounded-xl" />
                },
                {
                    title: "Total Returned Products",
                    value: 200,
                    icon: <Boxes size={45} className="text-blue-500 bg-blue-50 p-2 rounded-xl" />
                },
                {
                    title: "Total Number of Discounts",
                    value: 200,
                    icon: <CircleX size={45} className="text-red-500 bg-red-50 p-2 rounded-xl" />
                },
    ]
    return(
        <>
        <section className="">
            <div className="flex justify-between">
            <h1 className="text-xl font-bold">Analytics</h1>
            <h1 className="text-sm text-gray-500">Quick Overview of the company stock</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {headerCards.map((card,index)=>(
                    <div key={index} className="bg-white rounded-lg border border-gray-200   p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">{card.title}</h2>
                                    <p className="text-sm text-gray-500">{card.discription}</p>
                            </div>
                            <div>
                               <span className=""> {card.icon}</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold">{card.value}</h3>
                    </div>
                ))}
            </div>   
            <section>
                <SalesPerformance/> 
            </section>         
        </section>
        </>
    )
}

export default AnalyticsPage

