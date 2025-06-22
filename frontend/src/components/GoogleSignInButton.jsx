import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebaseConfig";
import googleImage from "../assets/svg/google.svg";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GoogleSignInButton = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

   let apiUrl;
  if(import.meta.env.VITE_NODE_ENV !== 'production') apiUrl = 'http://localhost:5000';
  else apiUrl = import.meta.env.VITE_API_URL;

  const handleClick = async () => {
    setIsSubmitting(true);
    try {
      // Sign in with Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      console.log("User signed in:", user.email);

      // Save email to waitlist with better error handling
      const response = await fetch(`${apiUrl}/api/save-google-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response has content before parsing JSON
      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from server');
      }

      const data = JSON.parse(text);

      if (data.success) {
        if (data.exists) {
          toast.info("You're already on the waitlist. Stay tuned!", {
            position: "top-center",
            autoClose: 3000,
            style: { background: "#ffffff", color: "#000000" },
          });
        } else {
          toast.success("Welcome to Qlue! You've successfully joined the waitlist.", {
            position: "top-center",
            autoClose: 3000,
            style: { background: "#ffffff", color: "#000000" },
          });
        }
      } else {
        throw new Error(data.error || "Failed to join waitlist");
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error.message);

      if (error.code === "auth/popup-closed-by-user") {
        toast.warning("Sign-in was canceled. Try again!", {
          position: "top-center",
          autoClose: 3000,
          style: { background: "#ffffff", color: "#000000" },
        });
        setIsSubmitting(false);
        return;
      }

      // More specific error messages
      if (error.message.includes('404')) {
        toast.error("Server endpoint not found. Please contact support.", {
          position: "top-center",
          autoClose: 3000,
          style: { background: "#ffffff", color: "#000000" },
        });
      } else if (error.message.includes('Unexpected end of JSON input')) {
        toast.error("Server response error. Please try again.", {
          position: "top-center",
          autoClose: 3000,
          style: { background: "#ffffff", color: "#000000" },
        });
      } else {
        toast.error("Something went wrong. Please try again.", {
          position: "top-center",
          autoClose: 3000,
          style: { background: "#ffffff", color: "#000000" },
        });
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="relative">
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-transparent p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="animate-spin h-10 w-10 border-t-4 border-white-500 border-solid rounded-full"></div>
          </div>
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={isSubmitting}
        className="relative w-full h-[50px] rounded-full overflow-hidden bg-white border border-black shadow-md flex items-center justify-center gap-2 transition-opacity duration-200"
      >
        <img src={googleImage} alt="Google" className="w-6 h-6" />
        <span className="text-black lg:text-[20px] md:text-[18px] text-[16px] font-gilroy">
          {isSubmitting ? "Signing in..." : "continue with google"}
        </span>
      </button>
    </div>
  );
};

export default GoogleSignInButton;
