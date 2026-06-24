"use client";

import React from "react";
import About from "@/components/sections/About/About";

export default function AboutPage() {
  return (
    <main className="relative pt-[100px] min-h-screen bg-white">
      {/* Decorative Jali Pattern on background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='38' fill='none' stroke='%23000000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
      
      <About />
    </main>
  );
}
