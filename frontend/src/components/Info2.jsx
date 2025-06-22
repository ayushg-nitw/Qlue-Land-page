import React from "react";
import { useRef, useEffect } from "react";

const ImageLayout = ({ videosrc, image2, title, subtitle }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    // Try to play the video after component mounts
    if (videoRef.current) {
      const playPromise = videoRef.current.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Autoplay was prevented:", error);
          // You could add a play button here if needed
        });
      }
    }
  }, []);

  return (
    <div className="w-full h-screen flex flex-col bg-white  overflow-x-hidden">
      {/* Image Container */}
      <div className="w-full h-[70vh] flex flex-col md:flex-row relative">
        {/* Left Image (Moves Right on Small & Medium Screens) */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-end md:justify-center pr-6 md:pr-0">
          <img
            src={image2}
            alt="Left"
            className={`w-[80%] h-full object-cover object-[30%_70%] md:w-full`}
          />
        </div>

        {/* Right Image (Moves Down with Right Margin on Small & Medium Screens) */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex items-start md:items-center justify-start md:justify-center -mt-10 md:mt-0 ml-6 md:ml-0">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-[80%] h-full object-cover object-[40%_50%] md:w-full"
          >
            <source src={videosrc} type="video/mp4" />
          </video>
        </div>
      </div>

      {/* Text Container */}
      <div className="w-full h-[30vh] flex flex-col text-center items-center justify-center bg-white p-4 mt-[-10%] md:mt-0">
        <div className=" w-[300px] md:w-[400px] ">
          <h2 className="text-[26px] md:text-[28px] lg:text-[30px] font-gilroyRegular">
            {title}
          </h2>
        </div>
        <p className="text-[20px] md:text-[22px] lg:text-[26px] text-black  md:mt-2 font-gilroyLight">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default ImageLayout;
