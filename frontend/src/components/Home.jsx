import { useEffect, useRef } from "react";
import "./../index.css"; // Adjust path if needed
import AnimationScreen from "../components/AnimationScreen.jsx";
import Waitlist from "../components/Waitlist.jsx";
import Footer from "../components/Footer.jsx";
import Info1 from "../components/Info1.jsx";
import Info2 from "../components/Info2.jsx";
import Info3 from "../components/Info3.jsx";
import { ToastContainer } from "react-toastify";

// Assets
import video1 from "../assets/video/video1.mp4";
import video2 from "../assets/video/video2.mp4";
import video3 from "../assets/video/video3.mp4";
import image2 from "../assets/Images/page2-2.jpg";
import image4 from "../assets/Images/page3-2.jpeg";
import image6 from "../assets/Images/page4-2.jpeg";

const Home = () => {
  const infoRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      document.body.classList.add("start-transition");
    }, 700);

    setTimeout(() => {
      document.body.style.overflow = "auto";
    }, 1400);
  }, []);

  return (
    <div className="w-full h-screen overflow-y-scroll scroll-smooth">
      <section className="h-screen w-full">
        <Waitlist infoRef={infoRef} />
      </section>

      <div className="absolute inset-0 white-screen"></div>
      <AnimationScreen />

      <section ref={infoRef} className="h-screen w-full">
        <Info1
          videosrc={video1}
          image2={image2}
          title="DISCOVER NEW TRENDY BRANDS"
          subtitle="no more endless quest - just the next big thing right at your fingertips"
        />
      </section>

      <section className="h-screen w-full">
        <Info2
          videosrc={video2}
          image2={image4}
          title="SCROLL, GET INSPIRED SHOP INSTANTLY"
          subtitle="no more redirects - just one tap and it’s yours"
        />
      </section>

      <section className="h-screen w-full">
        <Info3
          videosrc={video3}
          image2={image6}
          title="A COMMUNITY THAT SHOPS SHARES AND INSPIRES"
          subtitle="no more lonely checkouts - join people who love fashion as much as you do."
        />
      </section>

      <section className="h-screen w-full">
        <Footer />
      </section>

      <ToastContainer />
    </div>
  );
};

export default Home;
