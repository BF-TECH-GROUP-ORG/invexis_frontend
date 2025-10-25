import AnalyticsCards from "@/components/visuals/analyticsCards"
import GraphSection from "@/components/visuals/graphsPage"
import TopSellingProducts from "./tsp/page"


const AnalyticsPage = () =>{
    return(
        <>
        <section className="space-y-5">
            <h1 className="text-2xl font-medium ">Welcome to your inventory analytics</h1>
        <div>
            <AnalyticsCards />
        </div>
        <div>
            <GraphSection />
        </div>
        <div>
            <TopSellingProducts />
        </div>

        </section>
        </>
    )
}

export default AnalyticsPage