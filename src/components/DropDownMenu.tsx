import { useState, useRef,useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
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
      <button onClick={() => setOpen(!open)} className="p-2 bg-black-200 rounded">
        👤Profile
      </button>

      {open && (
        <div ref={dropdownRef} className="absolute right-0 mt-5 w-40 bg-black border rounded shadow-lg">
          <ul>
            <li>
              <button 
                onClick={(e) => {
                  
                  router.push("/profile"); 
                  setOpen(false); 
                }} 
                className="block w-full text-left px-4 py-2 hover:bg-black-100 hover:cursor-pointer"
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
                className="block w-full text-left px-4 py-2 hover:bg-black-100 hover:cursor-pointer"
              >
                Settings
              </button>
            </li>
            <li>
              <button 
                onClick={(e)=>{
                    router.push('/dashboard')
                }}
                className="block w-full text-left px-4 py-2 hover:bg-black-100 hover:cursor-pointer"
              >
                Dashboard
              </button>
            </li>
            <li>
              <button 
                onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
                className="block w-full text-left px-4 py-2 hover:bg-black-100 hover:cursor-pointer"
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


