import { useRouter } from "next/navigation"
const BackPge = () =>{
    const navigation = useRouter()
    return(
        <>
        <button onClick={()=>{navigation.back()}}>← Back</button>
        </>
    )
}
export default BackPge