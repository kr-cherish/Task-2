
import { useEffect,useState } from 'react'

const test = () => {
    useEffect(()=>{
        console.log("Hello");    
    },[])
    useEffect(()=>{
        console.log("Good Morning");
        
    })
    const [count, setCoutn] = useState(0);
  return (
    <div>   
        <button onClick={() => setCoutn(count+1)}>Incremnt</button>
    </div>
  )
}

export default test