"use client";
import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
useEffect(() => {
    const storedName = localStorage.getItem("loggedInUser");
    if (storedName) setUsername(storedName);
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Hardcoded credentials for testing
    if (username === "admin" && password === "admin123") {
      // ✅ Save username so it can be shown on /main
      localStorage.setItem("loggedInUser", username);

      // ✅ Navigate to /main after login
      window.location.href = "/main";
    } else {
      alert("Invalid credentials.\nTry admin/admin123 for development.");
    }
  };


  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-900">
      {/* Logo in top right */}
      <div className="absolute top-4 right-4">
        <Image
          src="/logo.png"
          alt="logo"
          width={120}
          height={120}
          unoptimized
        />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-orange-500 mb-6 text-center">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-gray-300 mb-1 font-medium"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-gray-300 mb-1 font-medium"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 px-4 mt-4 bg-orange-500 text-gray-900 font-semibold rounded-lg hover:bg-orange-600 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
