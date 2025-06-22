import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
const AnimationScreen = () => {
  const [isWhiteScreen, setIsWhiteScreen] = useState(false);
  const [slideUp, setSlideUp] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsWhiteScreen(true);
    }, 700);

    setTimeout(() => {
      setSlideUp(true);
    }, 1100);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center z-50"
      style={{ backgroundColor: isWhiteScreen ? "#FFFFFF" : "#000000" }}
      animate={slideUp ? { y: "-100%" } : {}}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      <div className="font-glorita ">
        <span className="bg-glorita-gradient text-[70px] sm:text-[110px] ">
          {isWhiteScreen ? "Qlue in" : "Lost?"}
        </span>
      </div>
    </motion.div>
  );
};

export default AnimationScreen;
