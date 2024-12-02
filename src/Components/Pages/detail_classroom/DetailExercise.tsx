/* eslint-disable react-hooks/rules-of-hooks */

import React, { useContext, useEffect, useRef, useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../../AppContext/AppContext";
import LeftSidebar from "../group/LeftSideBarGroup";
import Navbar from "../../Navbar/Navbar";

import ContentExercise from "./component_detailExcercise/content_exercise";
import FormOnSubmit from "./component_detailExcercise/form_onSubmit";
enum UserRole {
  Teacher = "teacher",
  Student = "student",
}
interface NewComment {
  createdAt: string;
  file: string;
  id: string;
  comment: string;
  partName: string;
  link: string;
}
interface Members {
  newComment: NewComment;
  email: string;
  name: string;
  uid: string;
  craeteAt: string;
  role: UserRole;
  submitted: boolean;
}
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
const DetailExercise: React.FC = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    return null; // or some loading/error state
  }
  const { userData } = authContext;
  const location = useLocation();
  const idCollectionRef = useRef("");

  const [value, setValue] = useState(0);
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    console.log("Change tab-------------------- ");
    // setShouldRefreshTabDetail(true);
    setValue(newValue);
  };

  const [, setIDClassRoom] = useState("");
  useEffect(() => {
    console.log("userData:--- ", location.state.exercise);
    idCollectionRef.current = location.state.idCollection;

    setIDClassRoom(location.state.idCollection);
  }, [
    location.state.exercise,
    location.state.formDataClassRoom,
    location.state.idCollection,
    userData,
  ]);
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
          dataUser={userData}
        />
      </div>
      <div className="fixed  z-10 w-full bg-white">
        <Navbar />
      </div>
      {userData.role == UserRole.Teacher ? (
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
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <div className="mt-8">
              <ContentExercise exercise={location.state.exercise} />
            </div>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <div className="flex  ">
              <div className="mt-10  flex-1 text-center">
                Tất cả học viên
                <div className="col  mt-4 mx-4">
                  {location.state.exercise.members &&
                    location.state.exercise.members.length > 0 &&
                    location.state.exercise.members.map((member: Members) => (
                      <div key={member.uid} className="flex items-center mb-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {member.name.charAt(0)}
                        </div>
                        <div className="ml-2 text-gray-800 font-semibold">
                          {member.name}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="w-px bg-gray-300 mx-4 h-screen"></div>
              <div className="mt-10 flex-1  col ">
                {location.state.exercise.content.title}
                <div className="mt-6">
                  <h3 className="  text-gray-800">Đề bài</h3>
                  <p className="text-gray-600">
                    {location.state.exercise.content.description}
                  </p>
                </div>
                <div className="mt-4 flex">
                  <div>
                    <p className="text-xl font-semibold">
                      {
                        location.state.exercise.members.filter(
                          (member: Members) => member.submitted
                        ).length
                      }
                    </p>
                    <p className="text-sm">Đã nộp</p>
                  </div>
                  <div className="ml-8">
                    <p className="text-xl  font-semibold">
                      {location.state.exercise.members.length}
                    </p>
                    <p className="text-sm">Đã giao</p>
                  </div>
                </div>

                {location.state.exercise.members &&
                  location.state.exercise.members.length > 0 &&
                  location.state.exercise.members.map((member: Members) =>
                    member.newComment && member.submitted ? (
                      <div
                        key={member.uid}
                        className="max-w-xs mt-4 p-2 bg-gray-100 rounded-lg  border-t border-gray-300 shadow"
                      >
                        <div className="flex items-center mb-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {member.name.charAt(0)}
                          </div>
                          <div className="ml-2 text-gray-800 font-semibold">
                            {member.name}
                          </div>
                        </div>

                        {member.newComment.file &&
                          (member.newComment.partName.endsWith(".pdf") ||
                          member.newComment.partName.endsWith(".docx") ||
                          member.newComment.partName.endsWith(".xlsx") ? (
                            <a
                              href={member.newComment.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 underline"
                            >
                              {member.newComment.partName}
                            </a>
                          ) : (
                            <img
                              src={member.newComment.file}
                              alt="Content"
                              className="h-40 w-40 border border-gray-300 rounded-md"
                            />
                          ))}

                        {member.newComment.link && (
                          <iframe
                            src={member.newComment.link}
                            rel="noopener noreferrer"
                            title="Link Preview"
                            width="100%"
                            height="60px"
                            style={{
                              border: "1px solid #ddd",
                              borderRadius: "8px",
                              marginTop: "8px",
                            }}
                          />
                        )}
                        {member.newComment.link && (
                          <a
                            href={member.newComment.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-800 font-medium cursor-pointer"
                          >
                            <div className="mt-3">
                              <div className="text-gray-800 font-medium">
                                {member.newComment.link}
                              </div>
                              <div className="text-green-600">Đã nộp</div>
                            </div>
                          </a>
                        )}
                        {member.newComment.partName && (
                          <a
                            href={member.newComment.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-800 font-medium cursor-pointer"
                          >
                            <div className="mt-3">
                              <div className="text-gray-800 font-medium">
                                {member.newComment.partName}
                              </div>
                              <div className="text-green-600">Đã nộp</div>
                            </div>
                          </a>
                        )}
                      </div>
                    ) : null
                  )}
              </div>
            </div>
          </CustomTabPanel>
        </div>
      ) : (
        <div className="ml-80 mt-16 flex w-[calc(100%-20rem)] px-8 p-4  space-x-4 mt-20">
          <ContentExercise exercise={location.state.exercise} />
          <FormOnSubmit
            idCollection={location.state.idCollection}
            dueDate={location.state.exercise.content.dueDate}
          ></FormOnSubmit>
        </div>
      )}
    </div>
  );
};
export default DetailExercise;
