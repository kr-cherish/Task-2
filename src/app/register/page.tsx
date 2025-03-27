"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const RegisterPage = () => {
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      router.replace("/dashboard");
    }
  }, [sessionStatus, router]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const formData = {
      fname: e.target.fname.value.trim(),
      lname: e.target.lname.value.trim(),
      mobileNumber: e.target.mobileNumber.value.trim(),
      email: e.target.email.value.trim(),
      password: e.target.password.value.trim(),
      confirmPassword: e.target.confirmpassword.value.trim(),
    };
    console.log(formData);
    
    if (!formData.fname || !formData.lname) {
      setError("First name and Last name are required.");
      return;
    }

    if (!/^\d{10}$/.test(formData.mobileNumber)) {
      setError("Mobile number must be 10 digits.");
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError("Email is invalid.");
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (formData.confirmPassword !== formData.password) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      // console.log(res);
      
      if (res.status === 400) {
        setError("The email is already in use.");
      } else if (res.status === 200) {
        setError("");
        router.push("/login");
      } else {
        setError("Registration failed, try again.");
      }
    } catch (error) {
      setError("Error, try again.");
      console.log(error);
    }
  };

  if (sessionStatus === "loading") {
    return <h1>Loading...</h1>;
  }

  return (
    sessionStatus !== "authenticated" && (
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="flex justify-center flex-col items-center">
          <h2 className="text-center text-2xl leading-9 tracking-tight text-gray-900">
            Sign up on our website
          </h2>
        </div>

        <div className="mt-4 sm:mx-auto sm:w-full  sm:max-w-[480px]">
          <div className="bg-[#FFFAFO] px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 border-[#e5e5e5]">
                <div>
                  <label className="block text-sm font-medium text-gray-900">First Name</label>
                  <input id="fname" name="fname" type="text" required className="input-field border-[2px] border-black p-1 rounded-[5px] mt-[4px]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Last Name</label>
                  <input id="lname" name="lname" type="text" required className="input-field border-[2px] border-black p-1 rounded-[5px] mt-[4px]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">Mobile Number</label>
                <input id="mobileNumber" name="mobileNumber" type="text" required className="input-field border-[2px] border-black p-1 rounded-[5px] mt-[4px]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">Email address</label>
                <input id="email" name="email" type="email" required className="input-field  border-[2px] border-black p-1 rounded-[5px] mt-[4px]"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">Password</label>
                <input id="password" name="password" type="password" required className="input-field border-[2px] border-black p-1 rounded-[5px] mt-[4px]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">Confirm Password</label>
                <input id="confirmpassword" name="confirmpassword" type="password" required className="input-field border-[2px] border-black p-1 rounded-[5px] mt-[4px]" />
              </div>

              <div className="flex items-center">
                <input id="terms" name="terms" type="checkbox" required className="mr-2 border-[2px] border-black p-1 rounded-[10px] mt-[4px]" />
                <label htmlFor="terms" className="text-sm text-gray-900">
                  Accept our terms and privacy policy
                </label>
              </div>

              <div>
                <button type="submit" className="btn-primary hover:bg-black hover:text-white hover:rounded-[10px] px-4 py-2">Sign up</button>
                {error && <p className="text-red-600 text-center mt-4">{error}</p>}
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  );
};

export default RegisterPage;
