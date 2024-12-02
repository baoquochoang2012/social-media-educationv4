import React from "react";
import LeftSide from "../LeftSidebar/LeftSide";
import CardSection from "../Main/CardSection";
import Navbar from "../Navbar/Navbar";
import RightSide from "../RightSidebar/RightSide";
import Main from "../Main/Main";
const Home: React.FC = () => {
  return (
    <div className="w-full">
      <div className="fixed top-0 z-10 w-full bg-white">
        <Navbar />
      </div>
      <div className="flex bg-gray-100">
        <div className="flex-auto w-[20%] fixed top-12">
          <LeftSide />
        </div>
        <div className="flex-auto w-[60%] absolute left-[20%] top-14 bg-gray-100 rounded-xl h-[max-content]">
          <div className="w-[80%] mx-auto">
            <CardSection />
            <Main From="Home" dataPosts={[]} />
          </div>
        </div>
        <div className="flex-auto w-[20%] fixed right-0 top-12">
          {/* Pass listFriend as a prop to RightSide */}
          <RightSide />
        </div>
      </div>
    </div>
  );
};

export default Home;
