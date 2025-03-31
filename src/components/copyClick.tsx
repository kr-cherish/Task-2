import React from 'react'
import useClipboard from "@/components/copyHook"
const copyClick = () => {   
    const { copyToClickBoard, copy } = useClipboard();
   return(
   <div className="p-4">
    <button
      onClick={() => copyToClickBoard("Hello, Clipboard!")}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      {copy ? "Copied!" : "Copy Text"}
      console.log(copy);
      
    </button>
  </div>
  )
}
export default copyClick