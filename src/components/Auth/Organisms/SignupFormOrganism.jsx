"use client";
import React, { useState } from "react";
import InputGroupMolecule from "../moleules/InputGroupMolecule";
import GoogleSignupButton from "@/components/authButtons/GoogleSignup";

const SignupFormOrganism = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Attempting signup with:", {
      firstName,
      lastName,
      email,
      password,
    });
  };

  const handleGoogleSuccess = (data) => {
    console.log("Google signup success:", data);
  };

  const handleGoogleError = (error) => {
    console.error("Google signup error:", error);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-8 bg-gradient-to-br from-white to-[#FAF0E6] shadow-2xl rounded-lg space-y-6 border border-[#DEB887]"
    >
      <h2 className="text-2xl font-bold text-center text-[#654321]">
        Sign Up for Store
      </h2>
      <InputGroupMolecule
        label="First Name"
        id="firstName-input"
        type="text"
        placeholder="John"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
      />
      <InputGroupMolecule
        label="Last Name"
        id="lastName-input"
        type="text"
        placeholder="Doe"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
      />
      <InputGroupMolecule
        label="Email Address"
        id="email-input"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="username"
        required
      />
      <InputGroupMolecule
        label="Password"
        id="password-input"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        required
      />
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-[#DEB887] to-[#D2B48C] hover:from-[#D2B48C] hover:to-[#654321] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-500 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95"
      >
        Sign Up
      </button>
      <div className="flex items-center my-4">
        <hr className="flex-1 border-[#DEB887]" />
        <span className="px-3 text-[#654321] text-sm">or</span>
        <hr className="flex-1 border-[#DEB887]" />
      </div>
      <GoogleSignupButton
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
      />
      <p className="text-center text-sm text-[#654321]">
        Already have an account?{" "}
        <a
          href="#"
          className="text-[#DEB887] hover:text-[#654321] font-medium transition-colors duration-300"
        >
          Log In
        </a>
      </p>
    </form>
  );
};

export default SignupFormOrganism;
