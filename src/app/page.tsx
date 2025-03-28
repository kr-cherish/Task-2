"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
export default function Home() {

  return (
    <div className="flex ">
      <div className="w-[50%] px-4 py-20">
        <p className="text-black  text-4xl font-bold">Design Confidently.</p>
        <p className="py-10 text-black ">Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint deleniti optio temporibus aspernatur cupiditate quos Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt neque ullam minima eos cupiditate cum molestias sit eaque sapiente nemo.
        </p>
        <button className="bg-blue-400 hover:bg-blue-500 rounded-[10px] p-3 ">Get Started!!</button>
      </div>
      <div className=" flex justify-center py-15 w-[50%]">
        <Image
          src="/left.jpeg"
          alt="Illustrate"
          width={600}
          height={600}
          className=""
        />
      </div>
    </div>
  );
}
