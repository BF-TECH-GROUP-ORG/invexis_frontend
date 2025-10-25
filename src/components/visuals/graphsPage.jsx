import LeftBarChart from "./analyticsbarcharts/left"
import RightBarChart from "./analyticsbarcharts/right"

const GraphSection = () =>{
    return(
        <>
        <section className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 sm:grid-cols-1 gap-x-3 ">
            <LeftBarChart />
            <RightBarChart />
        </section>
        </>
    )
}

export default GraphSection