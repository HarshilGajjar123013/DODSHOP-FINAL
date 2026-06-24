import React from "react";
import Link from "next/link";
import { AlertCircle, WifiOff } from "lucide-react";

export default function OfflineFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-zinc-900 font-body px-6 text-center">
      <div className="mb-8 text-orange-600 opacity-80">
        <WifiOff size={64} strokeWidth={1} />
      </div>
      <h1 className="text-4xl md:text-5xl font-light tracking-widest uppercase mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
        No Connection
      </h1>
      <div className="w-16 h-[1px] bg-orange-500 opacity-40 mb-6"></div>
      <p className="text-zinc-500 mb-10 max-w-md text-sm tracking-wide leading-relaxed">
        It seems you have lost your connection to the internet. Please check your network and try again to continue exploring our heritage collections.
      </p>
      <Link
        href="/"
        className="px-8 py-3 bg-zinc-900 text-white tracking-widest text-xs uppercase hover:bg-orange-600 transition-colors duration-300"
      >
        Try Again
      </Link>
    </div>
  );
}
