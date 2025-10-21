import AnalyticsCards from "@/components/visuals/analyticsCards"

const AnalyticsPage = () =>{
    return(
        <>
        <section className="space-y-5">
            <h1 className="text-2xl font-medium ">Welcome to your inventory analytics</h1>
        <div>
            <AnalyticsCards />
        </div>
        </section>
        </>
    )
}

export default AnalyticsPage