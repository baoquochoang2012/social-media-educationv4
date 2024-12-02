
import React from "react";
import LeftSide from "../LeftSidebar/LeftSide";
import CardSection from "../Main/CardSection";
import Navbar from "../Navbar/Navbar";
import RightSide from "../RightSidebar/RightSide";
import Main from "../Main/Main";
import TabLeft from "./TabLeft";
import AccessTeacher from "./AccessTeacher";

const Dashbroad: React.FC = () => {
  return (
    <div className="w-full">
      <div className="fixed top-0 z-10 w-full bg-white">
        <Navbar></Navbar>
      </div>
      <div className="flex bg-gray-100">
        <div className="flex-auto w-[20%] fixed top-12">
          <TabLeft></TabLeft>
        </div>
        <div className="flex-auto w-[77%] absolute left-[20%] top-20 bg-gray-100 rounded-xl">
            <AccessTeacher></AccessTeacher>
        </div>
      </div>
    </div>
  );
}

export default Dashbroad;

