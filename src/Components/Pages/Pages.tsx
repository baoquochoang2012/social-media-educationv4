import React from "react";
import Home from "./Home";
import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Regsiter";
import Reset from "./Reset";
import Profile from "./Profile";
import Group from "./group/Group";

import FriendProfile from "./FriendProfile";
import SocialMessage from "../Main/SocialMessage";
import DetailClassRoom from "./detail_classroom/DetailClassRoom";
import DashBoard from "../Authenticate/dashbroad";
import NotificationBell from "../Main/NotificationBell";
import DetailExercise from "./detail_classroom/DetailExercise";

const Pages: React.FC = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home></Home>}></Route>
        <Route path="/login" element={<Login></Login>}></Route>
        <Route path="/group" element={<Group></Group>}></Route>
        <Route
          path="/detail/:id"
          element={<DetailClassRoom></DetailClassRoom>}
        ></Route>
        <Route
          path="/detail/:id/detail"
          element={<DetailExercise></DetailExercise>}
        ></Route>
        <Route path="auth/dashbroad" element={<DashBoard></DashBoard>}></Route>
        <Route path="/register" element={<Register></Register>}></Route>
        <Route path="reset" element={<Reset></Reset>}></Route>
        <Route path="/profile/auth/:id" element={<Profile></Profile>}></Route>
        <Route
          path="/notifications"
          element={<NotificationBell></NotificationBell>}
        ></Route>
        <Route
          path="/message"
          element={<SocialMessage></SocialMessage>}
        ></Route>
        <Route
          path="/profile/:id"
          element={<FriendProfile></FriendProfile>}
        ></Route>
      </Routes>
    </div>
  );
};

export default Pages;
