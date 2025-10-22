import FirstCard from "./allcards/first"
import SecondCard from "./allcards/second"
import ThirdCard from "./allcards/third"
import FourthCard from "./allcards/fourth"

const AnalyticsCards = () =>{
    return(
        <>
        <div className="grid grid-cols-4 lg:grid-cols-4 md:grid-cols-4 w-full gap-3">
            <FirstCard />
            <SecondCard />
            <ThirdCard />
            <FourthCard />
        </div>
        </>
    )
}   
export default AnalyticsCards