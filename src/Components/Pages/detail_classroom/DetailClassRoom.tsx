import LeftSidebar from "../group/LeftSideBarGroup";
import Navbar from "../../Navbar/Navbar";
import { useLocation } from "react-router-dom";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import React, { useEffect, useRef, useState } from "react";
import TabStory from "./Tab_story";
import TabMembers from "./Tab_member";
import { DocumentData } from "firebase/firestore";
import TabExercise from "./Tab_exercise";

interface DetailClassRoomProps {}
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
const DetailClassRoom: React.FC<DetailClassRoomProps> = () => {
  const location = useLocation();
  const [value, setValue] = useState(0);
  const [idCollection, setIDClassRoom] = useState("");
  const idCollectionRef = useRef("");
  const formDataClassRoom = useRef<DocumentData[]>([]);

  useEffect(() => {
    console.log("idCollection detail:--- ", location.state.id);
    idCollectionRef.current = location.state.id;
    formDataClassRoom.current = location.state.formDataClassRoom;
    setIDClassRoom(location.state.id);
  }, [location.state.formDataClassRoom, location.state.id]);
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    console.log("Change tab-------------------- ");
    // setShouldRefreshTabDetail(true);
    setValue(newValue);
  };

  function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
      </div>
    );
  }
  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  return (
    <div className="flex">
      <div className="fixed top-0 left-0   w-80 bg-white z-10 shadow-lg">
        <LeftSidebar
          dataClassRoom={location.state.formDataClassRoom}
          dataUser={location.state.dataUser}
        />
      </div>

      <div className="fixed  z-10 w-full bg-white">
        <Navbar />
      </div>
      <div className="ml-80 mt-16 w-[calc(100%-20rem)]  ">
        <Box
          sx={{ borderBottom: 1, borderColor: "divider" }}
          className="fixed w-full top-14 bg-white z-10"
        >
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="Bảng tin" {...a11yProps(0)} />
            <Tab label="Bài tập" {...a11yProps(1)} />
            <Tab label="Thành viên" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <TabStory
            dataClassRoom={formDataClassRoom.current}
            idCollection={idCollection}
          ></TabStory>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <TabExercise
            idCollection={idCollection}
            formDataClassRoom={formDataClassRoom.current}
          ></TabExercise>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <TabMembers idCollection={idCollection}></TabMembers>
        </CustomTabPanel>
      </div>
    </div>
  );
};
export default DetailClassRoom;
