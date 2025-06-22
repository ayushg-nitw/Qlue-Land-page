import { Routes, Route } from "react-router-dom";
import PrivacyPolicy from "./components/PrivacyPolicy.jsx";
import Home from "./components/Home.jsx"; 
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
    </>
  );
}

export default App;
