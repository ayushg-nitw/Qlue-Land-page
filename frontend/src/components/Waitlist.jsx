import React, { useEffect, useState, useRef } from "react";
import img1 from "../assets/Images/page1-1.jpeg";
import EnterEmailButton from "./EnterEmailButton";
import GoogleSignInButton from "./GoogleSignInButton";
import { ChevronDown } from "lucide-react";

const Waitlist = ({infoRef}) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const scrollToInfo = () => {
    if (infoRef && infoRef.current) {
      infoRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="relative flex min-h-screen w-full text-white shadow-md  overflow-x-hidden"
    >
      <div className="w-screen h-screen relative">
        <img
          className="w-full h-full object-cover object-[90%_10%] opacity-30  "
          src={img1}
          alt="Background"
        />
      </div>

      <div className="absolute top-8 left-8 font-glorita  text-[40px] sm:text-[55px] ">
        <span className=" bg-glorita-gradient">Qlue</span>
      </div>

      <div className="w-[250px] md:w-[400px] absolute text-center text-[25px] md:text-[35px] lg:text-[40px] top-[17%] md:top-[25%] left-[50%] translate-x-[-50%] lg:top-[30%] lg:left-[15%] xl:top-[40%] lg:translate-x-0 leading-[25px] md:leading-[40px] lg:leading-[45px]">
        <p className="font-gilroyRegular">
          LOST IN STYLE <br /> FOUND IN FASHION
        </p>
      </div>

      <div className="w-full flex justify-center md:pt-[10%] lg:justify-start lg:pl-[55%] lg:p-10 absolute top-[30%] lg:top-[20%]  ">
        <div className="mt-2 p-6 md:p-7 lg:p-9 bg-black rounded-[60px] md:rounded-[50px]  w-[310px] h-[280px] md:w-[400px] lg:w-[400px] md:h-[300px] lg:h-[325px] text-center border border-white border-opacity-30">
          <p className="font-gilroy lg:text-[20px] md:text-[18px] text-[16px] text-white mb-2">
            join the waitlist
          </p>
          <EnterEmailButton />
          <p className="font-gilroy text-white lg:text-[20px] md:text-[18px] text-[16px] my-2">
            or
          </p>
          <GoogleSignInButton />
          <p className="font-gilroy lg:text-[20px] md:text-[18px] text-[16px] text-white mt-3">
            join the Qlue club
          </p>
        </div>
      </div>
   
       <div
        className="absolute bottom-[7vh] md:bottom-[1vh] left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer"
        onClick={scrollToInfo}
      >
        <span className=" text-white text-lg font-gilroy mb-1">
          Qlue's Below
        </span>
        <ChevronDown size={30} className="text-white animate-bounce" />
      </div>

    </div>
  );
};

export default Waitlist;
