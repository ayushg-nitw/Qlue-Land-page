import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import send from "../assets/svg/send.svg";

const EnterEmailButton = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);


  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Email verification function (same as before)
   let apiUrl;
  if(import.meta.env.VITE_NODE_ENV !== 'production') apiUrl = 'http://localhost:5000';
  else apiUrl = import.meta.env.VITE_API_URL;
  
  const verifyEmail = async (email) => {
    try {
      const response = await fetch(`${apiUrl}/api/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const result = await response.json();
      return result.is_valid;
    } catch (error) {
      console.error('Email verification failed:', error);
      return false;
    }
  };


  const joinWaitlist = async (email) => {
    try {
      const response = await fetch(`${apiUrl}/api/join-waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to join waitlist:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const handleClick = async () => {

      setIsFocused(true);

    if (!email || !isValidEmail(email)) {
      toast.error("Please enter a valid email!", {
        position: "top-center",
        autoClose: 3000,
        style: { background: "#ffffff", color: "#000000" },
      });
      setIsSubmitting(false);
      setEmail("");
      setIsFocused(false);
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Verify email
      const isEmailValid = await verifyEmail(email);
      
      if (!isEmailValid) {
        toast.error("Email does not exist!", {
          position: "top-center",
          autoClose: 3000,
          style: { background: "#ffffff", color: "#000000" },
        });
        setIsSubmitting(false);
        setEmail("");
        setIsFocused(false);
        return;
      }

      // Step 2: Save to MongoDB
      const result = await joinWaitlist(email);
      
      if (result.success) {
        if (result.exists) {
          toast.info("You're already on the waitlist!", {
            position: "top-center",
            autoClose: 3000,
            style: { background: "#ffffff", color: "#000000" },
          });
        } else {
          toast.success("Joined! Welcome to the Qlue Club.", {
            position: "top-center",
            autoClose: 3000,
            style: { background: "#ffffff", color: "#000000" },
          });
        }
      } else {
        toast.error("Failed to join waitlist. Please try again.", {
          position: "top-center",
          autoClose: 3000,
          style: { background: "#ffffff", color: "#000000" },
        });
      }

    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        style: { background: "#ffffff", color: "#000000" },
      });
    } finally {
      setIsSubmitting(false);
      setEmail("");
      setIsFocused(false);
    }
  };

  return (
    <div className="relative flex items-center w-full max-w-md overflow-hidden shadow-lg">
      <div className="relative flex w-full border border-white h-auto rounded-full">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(email.length > 0)}
          className="w-full h-[50px] bg-transparent text-white pl-6 pr-1 text-[18px] outline-none font-gilroy transition-shadow duration-300 focus:shadow-lg tracking-[2px]"
          disabled={isSubmitting}
        />
        <label
          className={`absolute top-3 text-white lg:text-[20px] md:text-[18px] text-[16px] ml-[22%] lg:ml-[24%] transition-opacity duration-300 ${
            isFocused ? "opacity-0" : "opacity-100"
          } pointer-events-none`}
        >
          enter your email
        </label>

        <button
          onClick={handleClick}
          disabled={isSubmitting}
          className="rounded-full bg-white w-15 flex items-center justify-center transition-transform hover:scale-105"
        >
          {isSubmitting ? (
            <div className="bg-white rounded-full shadow-lg flex flex-col items-center">
              <div className="animate-spin h-6 w-6 border-t-4 border-black mt-1 border-solid rounded-full"></div>
            </div>
          ) : (
            <img src={send} className="h-10 w-10" alt="Submit" />
          )}
        </button>
      </div>
    </div>
  );
};

export default EnterEmailButton;
