import { useState } from 'react'

const useClickBord = () => {
    const[copy, setCopy] = useState(false);
    const copyToClickBoard = async(text : string)=>{
        try{
            await navigator.clipboard.writeText(text);
            setCopy(true);
            setTimeout(()=>{
                setCopy(false); 
            },2000)
        }catch(error){
            console.log("Faile to copy text");
            setCopy(false);
        }
    }
  return ({copyToClickBoard, copy});
}

export default useClickBord;