
const EachCompanyData = async({params}) =>{
    const  {id} = await params;
    return(
        <>

        <h1>Hello we are page with {id} ID</h1>
        
        </>
    )
}

export default EachCompanyData