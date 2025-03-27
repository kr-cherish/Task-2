"use client";
import React, { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import type { Session } from "next-auth";

const Navbar = () => {
  const { data: session }: { data: Session | null } = useSession();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  return (
    <header className="text-2xl">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between gap-x-6 p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
        </div>
        <div className="flex flex-1 items-center justify-end gap-x-6 ">
          {!session ? (
            <>
            <Link
                href="/"
                className="hidden lg:block lg:text-sm lg:font-semibold text-black rounded-md px-5 py-2"
              >
                Home
              </Link>
              <Link
                href="/login"
                className="hidden lg:block lg:text-sm lg:font-semibold text-black rounded-md px-5 py-2"

              >
                DashBoard
              </Link>
              <Link
                href="/login"
                className="hidden lg:block lg:text-sm lg:font-semibold bg-black text-white rounded-md px-5 py-2"

              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-black px-3 py-2 border-gray-500 text-sm font-semibold text-white shadow-sm hover:bg-white hover:text-black focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              {session.user?.email && <span className="ml-10 text-sm">{session.user.email}</span>}
              <button
                onClick={() => signOut({redirect:true , callbackUrl:"/"})}
                className="hidden lg:block lg:text-sm lg:font-semibold  lg:text-gray-900 hover:bg-black hover:text-white px-[4px] py-[2px] rounded-[5px]"
              >
                Log out
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
