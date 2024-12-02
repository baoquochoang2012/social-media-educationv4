import React, { useContext, useEffect, useRef, useState } from "react";
import NavLinks from "./NavLinks";
import UserLinks from "./UserLinks";
import { Link } from "react-router-dom";
import { Avatar, Tooltip } from "@material-tailwind/react";
import education from "../../assets/images/education.png";
import {
  doc,
  setDoc,
  collection,
  query,
  onSnapshot,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  deleteDoc,
  orderBy, limit, startAfter
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import avatar from "../../assets/images/avatar.jpg";
import PayPalModal from "../Paypal/ButtonPayPal";
import { round } from "lodash";
import Swal from "sweetalert2";
import { AuthContext } from "../AppContext/AppContext";
const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  if (!authContext) {
    return null; // or some loading/error state
  }
  const { user, userData } = authContext;
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [users, setUsers] = React.useState([]);
  const [classRooms, setClassRooms] = React.useState([]);
  const [openModal, setOpenModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setIsOpen(true);
  };

  const fetchSearch = async () => {
    try {
      // Clear the users state before fetching new data
      setUsers([]);
      setClassRooms([]);

      const searchLower = search.toLowerCase();
      const classRoomRaw = query(
        collection(db, "classRoom"),
        where("nameRoom", ">=", search),
        where("nameRoom", "<=", search + "\uf8ff")
      );
      const querySnapshotClassRoom = await getDocs(classRoomRaw);
      const classRoomArray: DocumentData[] = [];
      querySnapshotClassRoom.forEach((doc) => {
        classRoomArray.push(doc.data());
      });

      const uniqueClassRoom = Array.from(
        new Set(classRoomArray.map((a) => a.id))
      ).map((id) => {
        return classRoomArray.find((a) => a.id === id);
      });
      console.log('classRoomArray', classRoomArray);

      // User query
      const q = query(
        collection(db, "users"),
        where("name", ">=", search),
        where("name", "<=", search + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);
      const usersArray: DocumentData[] = [];
      querySnapshot.forEach((doc) => {
        usersArray.push(doc.data());
      });

      const uniqueUsers = Array.from(
        new Set(usersArray.map((a) => a.uid))
      ).map((uid) => {
        return usersArray.find((a) => a.uid === uid);
      });


      // Logging the results for debugging
      console.log('Search Input:', searchLower);
      console.log('Class Room Data:', classRoomArray);
      console.log('User Data:', usersArray);


      setUsers(uniqueUsers);
      setClassRooms(uniqueClassRoom);

    } catch (error) {
      console.log(error);
    }
  };
  const sendMail = async (to: string, subject: string, text: string) => {
    try {
      const response = await fetch("http://localhost:3000/sendMail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to, subject, text }),
      });

      if (!response.ok) {
        throw new Error("Error sending email: " + response.statusText);
      }

      const result = await response.json();
      console.log('result', result);
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };
  const convertCurrencyStringToNumber = (currencyString: string) => {
    // Loại bỏ các ký tự đặc biệt và khoảng trắng
    const numericString = currencyString.replace(/[^\d]/g, '');
    return Number(numericString);
  };
  const [totalAmount, settotalAmount] = useState<any>();
  const [loading, setLoading] = useState(false);
  const total = totalAmount / 25420;
  const gettotal = round(total, 2);
  const [infClassRoom, setInfClassRoom] = useState({});
  const openClassRoom = (data: React.SetStateAction<{}>) => {
    setInfClassRoom(data);
    const numericFee = convertCurrencyStringToNumber(data.feeAmount);
    settotalAmount(numericFee); // Lưu lại giá trị đã chuyển đổi
    setOpenModal(true);
  }
  const amount = 56;
  const handleJoin = async () => {
    try {
      setLoading(true);
      const infoUserQuery = query(
        collection(db, "users"),
        where("uid", "==", infClassRoom.uid)
      );

      const infoUserSnapshot = await getDocs(infoUserQuery);
      const infoUser = infoUserSnapshot.docs.map(doc => doc.data())[0];
      // if (infClassRoom?.isFeeRequired) {

      // } else {
      const userAlreadyInGroup = infClassRoom?.groups?.some(
        (group: { uid: string | null }) => group.uid === userData.uid
      );
      if (userAlreadyInGroup) {
        Swal.fire({
          title: "Bạn đã tham gia lớp này trước đó!",
          icon: "info",
          showConfirmButton: false,
          timer: 1500,
          toast: true,
          position: "top-right",
        });
        setLoading(false);
        return;
      }
      const classRoomRef = doc(db, "classRoom", infClassRoom.id);
      await updateDoc(classRoomRef, {
        groups: arrayUnion({
          uid: userData.uid, // Your user ID
          email: userData.email, // Your email
        }),
      });
      Swal.fire({
        title: "Thành công",
        text: "Tham gia lớp học thành công",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        position: "top-right",
      });
      setOpenModal(false);
      sendMail(
        user?.email,
        "[Social Media] - Xác nhận tham gia lớp học",
        "Chào <b>" + userData.name + "</B>,<br>"
        + "Cảm ơn bạn vì đã quan tâm khóa học <b>" + infClassRoom.nameRoom + "</B> của giáo viên <b>" + infoUser.name
        + "</b><br>"
        + "Sau đây là thông tin chung của giáo viên: <br>"
        + "<div>Tên: <b>" + infoUser.name + "</b><div>"
        + "<div>Email: <b>" + infoUser.email + "</b><div>"
        + "<div>Số điện thoại: <b>" + infoUser.phone + "</b><div>"
        // + "Sau đây là mã code tham gia khóa học: <h4 style='color: red;'>"
        // + infClassRoom.code 
      );
      // }
    } catch (error) {
      Swal.fire({
        title: "Đã xảy ra lỗi",
        icon: "error",
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (search === "") {
      setUsers([]);
      setClassRooms([]);
      setIsOpen(false);
    } else {
      fetchSearch();
    }
  }, [search]);

  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
  //       setIsOpen(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  const handleRedirect = (e: any, uid: string) => {
    e.preventDefault();
    console.log(e.target.innerText);
    navigate(`/profile/${uid}`);
  };

console.log('gettotal',gettotal);
  return (
    <>
      <div className="flex justify-between items-center border-b border-gray-100 w-full px-44 py-2">
        <div className="flex text-3xl font-extrabold text-gray-900 dark:text-white font-roboto relative">
          <Link to="/">
            <span className="text-transparent bg-clip-text bg-gradient-to-r to-red-600 from-blue-400">
              <Avatar
                size="sm"
                variant="circular"
                src={education}
                alt="avatar"
              ></Avatar>
            </span>
          </Link>{" "}
          {/* Search */}
          {/* <span className="text-transparent bg-clip-text bg-gradient-to-r to-red-600 from-blue-400">
            Social Education
          </span> */}
          {/* input Search */}
          <span className="text-transparent bg-clip-text bg-gradient-to-r to-red-600 from-blue-400">
            <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 sm:max-w-md">
              <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                <svg
                  className="h-6 w-6 text-slate-500"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  {" "}
                  <path stroke="none" d="M0 0h24v24H0z" />{" "}
                  <circle cx="10" cy="10" r="7" />{" "}
                  <line x1="21" y1="21" x2="15" y2="15" />
                </svg>
              </span>
              <input
                type="text"
                name="username"
                id="username"
                className="block flex-1 border-0 bg-transparent py-1.5 pl-1 placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:ring-0 focus:border-0 focus:outline-none"
                placeholder="Tìm kiếm khóa học, giáo viên..."
                onChange={handleSearch}
                ref={inputRef}
              />
              {/* dropdown when search */}
              {isOpen && (
                <div
                  className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg top-45 left-0"
                  style={{ top: "45px", left: "0px" }}
                  x-show="isOpen"
                >
                  <ul className="py-1">
                    {/* list search */}
                    {(users.length == 0 && classRooms.length == 0) && (
                      <li className="relative px-3 py-2 hover:bg-gray-100 cursor-pointer">
                        <a href="#" className="block flex items-center">
                          <span className="block truncate">
                            <span className="text-sm font-medium text-gray-900 lg:col-span-1">
                              Không tìm thấy kết quả
                            </span>
                          </span>
                        </a>
                      </li>
                    )}

                    {users.map((user) => (
                      <li className="relative px-3 py-2 hover:bg-gray-100 cursor-pointer">
                        <a
                          className="block flex items-center"
                          onClick={(e) => handleRedirect(e, user.uid)}
                        >
                          <span className="block truncate">
                            <span className="text-sm font-medium text-gray-900 lg:col-span-1">
                              <Avatar
                                size="sm"
                                variant="circular"
                                src={user.image || avatar}
                                alt="avatar"
                              ></Avatar>
                            </span>
                            <span className="text-sm font-medium text-gray-900 lg:col-span-1 inline-flex">
                              {/* Name */}
                              <span className="ml-2 text-sm font-medium text-gray-900 whitespace-nowrap flex items-center">
                                {user.name}
                                {user.role == "teacher" && (
                                  <svg class="h-3 w-3 text-sky-500 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                  </svg>
                                )}
                              </span>
                              {/* Position */}
                              {/* <div className="text-sm font-medium text-gray-900 whitespace-nowrap text-gray-400 font-normal text-sm">
                                {user.role == "teacher"
                                  ? "Giáo viên"
                                  : "Học sinh"}
                              </div> */}
                            </span>
                          </span>
                        </a>
                      </li>
                    ))}
                    {classRooms.length > 0 && (
                      classRooms.map((classRoom) => (
                        <li className="relative px-3 py-2 hover:bg-gray-100 cursor-pointer">
                          <a
                            className="block flex items-center"
                            onClick={() => openClassRoom(classRoom)}
                          >
                            <span className="block truncate">
                              <span className="text-sm font-medium text-gray-900 lg:col-span-1">
                                <Avatar
                                  size="sm"
                                  variant="circular"
                                  src={classRoom.thumbnail || avatar}
                                  alt="avatar"
                                ></Avatar>
                              </span>
                              <span className="text-sm font-medium text-gray-900 lg:col-span-1 inline-flex">
                                {/* Name */}
                                <span className="ml-2 text-sm font-medium text-gray-900 whitespace-nowrap flex items-center">
                                  {classRoom.nameRoom}
                                  <svg class="h-4 w-4 text-sky-500 ml-1" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />  <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />  <line x1="3" y1="6" x2="3" y2="19" />  <line x1="12" y1="6" x2="12" y2="19" />  <line x1="21" y1="6" x2="21" y2="19" /></svg>
                                </span>
                                {/* Position */}
                                {/* <div className="text-sm font-medium text-gray-900 whitespace-nowrap text-gray-400 font-normal text-sm">
                                {user.role == "teacher"
                                  ? "Giáo viên"
                                  : "Học sinh"}
                              </div> */}
                              </span>
                            </span>
                          </a>
                        </li>
                      ))
                    )}
                    {openModal && (
                      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" key="paypalModal">
                        <div className="relative max-h-screen w-full max-w-sm overflow-y-auto p-4 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                          <button
                            className="absolute top-2 right-2 text-white text-2xl bg-black/50 rounded-full w-10 h-10 flex items-center justify-center"
                            onClick={() => setOpenModal(!openModal)}
                          >
                            &times;
                          </button>
                          <div class="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
                            <h5 class="mb-4 text-xl font-medium text-gray-500 dark:text-gray-400">{infClassRoom.nameRoom}</h5>
                            <div class="flex items-baseline text-gray-900 dark:text-white">
                              {/* <span class="text-3xl font-semibold">$</span> */}
                              <span class="text-5xl font-extrabold tracking-tight">{infClassRoom.feeAmount || 'Free'}</span>
                              {/* <span class="ms-1 text-xl font-normal text-gray-500 dark:text-gray-400">/month</span> */}
                            </div>
                            <div class="space-y-5 my-7">
                              {infClassRoom.description || 'Chưa cập nhật'}
                            </div>
                            {!infClassRoom.feeAmount ? (
                              <button type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-200 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-900 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex justify-center w-full text-center" onClick={handleJoin} disabled={loading}>Tham gia {loading && ('...')}</button>
                            ) : (
                              // <PayPalScriptProvider
                              //   options={{
                              //     "client-id":
                              //       "test",
                              //     components:
                              //       "buttons",
                              //     currency: "USD",
                              //   }}
                              //   deferLoading
                              // >
                              //   <ButtonWrapper
                              //     currency={
                              //       currency
                              //     }
                              //     showSpinner={
                              //       false
                              //     }
                              //   />
                              // </PayPalScriptProvider>
                              <PayPalModal amount={gettotal} currency="USD" handleJoin={handleJoin} infClassRoom={infClassRoom} loading={loading} openModal={openModal} setOpenModal={setOpenModal} />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </span>
        </div>
        <div className="flex justify-center item-center mx-auto">
          <NavLinks></NavLinks>
        </div>
        <div>
          <UserLinks></UserLinks>
        </div>
      </div>
    </>
  );
};

export default Navbar;
