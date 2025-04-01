"use client";
import React, { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import type { Session } from "next-auth";
import Image from "next/image";
import DropDownMenu from './DropDownMenu'
const Navbar = () => {
  const { data: session }: { data: Session | null } = useSession();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  return (
    <header className="text-2xl max-w-[1440px] mx-auto">
      <nav
        className=""
        aria-label="Global"
      >

        <div className="flex items-center p-4 bg-black text-white w-full ">
          <div className="px-4">
            <Image
              src="/demo.jpeg"
              alt="Demo"
              width={70}
              height={70}
              className="rounded-[10px] left-0"
            />
          </div>
          <div className="flex flex-1 items-center justify-end gap-x-6">
            {!session ? (
              <>
                <Link
                  href="/"
                  className="hidden lg:block lg:text-sm lg:font-semibold  rounded-md px-5 py-2 hover:bg-white hover:text-black focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Home
                </Link>
                <Link
                  href="/login"
                  className="hidden lg:block lg:text-sm lg:font-semibold rounded-md px-5 py-2 hover:bg-white hover:text-black focus-visible:outline-offset-2 focus-visible:outline-indigo-600"

                >
                  DashBoard
                </Link>
                <Link
                  href="/login"
                  className="hidden lg:block lg:text-sm lg:font-semibold  text-white rounded-md px-5 py-2 hover:bg-white hover:text-black focus-visible:outline-offset-2 focus-visible:outline-indigo-600"

                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-md  px-3 py-2 border-gray-500 text-sm font-semibold text-white shadow-sm hover:bg-white hover:text-black focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <>
                {session.user?.email && <span className="ml-10 text-sm">
                  <DropDownMenu />
                </span>}
                {/* <button
                  onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
                  className="hidden lg:block lg:text-sm lg:font-semibold  hover:bg-black hover:text-white px-[4px] py-[2px] rounded-[5px]"
                >
                  Log out
                </button> */}
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
