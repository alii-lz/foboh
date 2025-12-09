"use client";

import { signIn } from "next-auth/react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <h1 className="mb-6 text-3xl font-bold text-[#009689]">
        Welcome to Foboh Pricing
      </h1>

      <button
        onClick={() => signIn("google", { callbackUrl: "/Dashboard" })}
        className="cursor-pointer rounded-full bg-[#009689] px-6 py-3 font-semibold text-white shadow-md hover:bg-[#00796B]"
      >
        Navigate to Login
      </button>
    </div>
  );
}
