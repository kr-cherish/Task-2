import { useState, useRef,useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { FiMenu } from "react-icons/fi";
export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event : MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="px-4 py-2 bg-black-200k font-bold text-[30px] hover:cursor-pointer hover:text-black hover:bg-white hover:rounded-[10px]">
      <FiMenu  />
      </button>

      {open && (
        <div ref={dropdownRef} className="absolute right-0 mt-5 w-40 bg-black border-[3px] text-white text-[18px] font-bold px-2 py-2 rounded-[10px] shadow-lg ">
          <ul>
            <li>
              <button 
                onClick={(e) => {
                  
                  router.push("/profile"); 
                  setOpen(false); 
                }} 
                className="block w-full text-left px-4 py-2 hover:bg-black-100 hover:cursor-pointer hover:bg-white hover:text-black"
              >
                Profile
              </button>
            </li>
            <li>
              <button 
                onClick={(e) => {
                  router.push("/setting")
                  setOpen(false);
                }} 
                className="block w-full text-left hover:bgblack100 hover:cursor-pointer hover:bg-white hover:text-black
                xt-left px-4 py-2 hover:bgblack"
              >
                Settings
              </button>
            </li>
            <li>
              <button 
                onClick={(e)=>{
                    router.push('/dashboard')
                    setOpen(false)
                }}
                className="block w-full text-left px-4 py-2 hover:bg-white hover:text-black hover:cursor-pointer"
              >
                Dashboard
              </button>
            </li>
            <li>
              <button 
                onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
                className="block w-full text-left px-4 py-2 hover:bg-white hover:text-black  hover:cursor-pointer"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}


