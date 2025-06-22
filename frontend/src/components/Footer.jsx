import React from "react";
import { Link } from "react-router-dom";
import insta from "../assets/svg/insta.svg";
import linkedin from "../assets/svg/linkedin.svg";
import twitter from "../assets/svg/twitter.svg";
import bulbImage from "../assets/Images/bulb.jpg";
import { FaExternalLinkAlt } from "react-icons/fa";


const Footer = () => {
  return (
    <footer className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center py-10 overflow-hidden">
      {/* 🔹 Background Bulb Image */}
      <div className="absolute inset-0">
        <img
          src={bulbImage}
          alt="Bulb Background"
          className="w-full h-full object-cover opacity-20"
        />
      </div>

      {/* 🔹 Qlue Logo */}
      <div className="absolute top-8 left-8 font-glorita text-[40px] sm:text-[55px]">
        <span className="bg-glorita-gradient">Qlue</span>
      </div>

      {/* 🔹 Center Content */}
      <div className="text-center -mt-[10%] flex flex-col justify-center items-center relative z-10 px-4 sm:px-8">
        <div className="flex flex-col md:text-[30px] text-[28px] font-gilroy">
          <span> EVERY NEW TREND </span>
          <span> STARTS WITH </span>
          <span>
            A{" "}
            <span className="bg-glorita-gradient font-gilroyRegular">
              QLUE
            </span>
          </span>
        </div>

        <div className="text-center w-full max-w-[295px] mt-1">
          <p className="text-white-300 font-gilroyRegular text-sm sm:text-base md:text-xl">
            discover, engage, and purchase all in one seamless <br />
            experience.
          </p>
        </div>

        {/* 🔹 Coming Soon Button */}
        <button className="mt-4 sm:mt-3 bg-white w-[130px] sm:w-[150px] h-[40px] sm:h-[45px] text-black text-sm sm:text-lg px-4 py-2 rounded-full font-gilroy transition-all duration-200 hover:scale-105">
          coming soon
        </button>

        {/* 🔹 Social Media Icons */}
        <div className="flex gap-3 mt-4 text-xl">
          <a
            href="https://www.instagram.com/qlue.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#DFA30A] transition-all duration-300 hover:scale-110"
          >
            <img src={insta} className="h-8 sm:h-10 w-8 sm:w-10" alt="Instagram" />
          </a>
          <a
            href="https://www.linkedin.com/company/letsqluein/about"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#DFA30A] transition-all duration-300 hover:scale-110"
          >
            <img src={linkedin} className="h-9 sm:h-11 w-9 sm:w-11 mt-[-2px]" alt="LinkedIn" />
          </a>
        </div>

        {/* 🔹 Privacy Policy Link */}
          <div className=" mt-6 text-sm font-gilroyRegular text-white-300">
            <Link
              to="/privacy-policy"
              className="underline flex items-center gap-1 hover:text-white transition duration-200"
            >
              Privacy Policy <FaExternalLinkAlt className="text-xs mt-[1px]" />
            </Link>
         </div>

      </div>

      {/* 🔹 Qlue Large Text */}
      <div className="absolute inset-x-0 bottom-5 xl:bottom-[-6%] lg:bottom-[2%] md:bottom-[1%] flex justify-center opacity-15">
        <div className="font-glorita">
          <span className="bg-glorita-gradient text-[100px] md:text-[200px] lg:text-[250px]">
            Qlue
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
