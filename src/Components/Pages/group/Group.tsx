import { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "../../Navbar/Navbar";

import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDocs,
  query,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { getAuth } from "firebase/auth";
import Swal from "sweetalert2";
import { useAppContext } from "../../../AppContext";
import LeftSidebar from "./LeftSideBarGroup";
import ModalCreateRoom from "./modalCreateRoom";
import ModalJoinRoom from "./modalJoinRoom";
import { useNavigate } from "react-router-dom";
import useOutsideClick from "../../../utils/function_close";

const Group = () => {
  const navigate = useNavigate();
  const {
    shouldRefresh,

    setShouldRefresh,
    setShouldRefreshTabDetail,
    setNameRoom,
    setIdRoom,
  } = useAppContext();
  const auth = getAuth(); // Initialize Firebase auth
  const currentUser = auth.currentUser; // Get the currently logged-in user
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<number | null>(null);

  const [isModalOpenJoinRoom, setIsModalOpenJoinRoom] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userInfo, setUserInfo] = useState<{
    uid: string | null;
    email: string | null;
  }>({
    uid: null,
    email: null,
  });
  const [dataUser, setUsers] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true); // New state for loading
  const [formDataClassRoom, setDataClassRoom] = useState<DocumentData[]>([]);

  useEffect(() => {
    // lấy thông tin user
    // Get the current user's UID from Firebase Auth

    if (currentUser) {
      setUserInfo({
        uid: currentUser.uid,
        email: currentUser.email,
      });
    } else {
      // Redirect to login or handle unauthenticated state
      console.log("User is not logged in");
    }
  }, [auth, currentUser]);

  const fetchDataClassRoom = useCallback(async () => {
    console.log("refresh data fetch group------------------------");

    try {
      // Query Firestore where email matches current user's email
      setLoading(true);
      if (currentUser) {
        const q = query(collection(db, "classRoom"));
        const querySnapshot = await getDocs(q);
        const dataClassRoom = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            // Check if there is a group where uid matches current user's uid
            const isMember = data.groups?.some(
              (group: { uid: string }) => group.uid === currentUser.uid
            );
            return isMember ? { ...data, id: doc.id } : null; // Include document id
          })
          .filter(Boolean); // Remove null values
        console.log("dataClassRoom", dataClassRoom);
        setDataClassRoom(dataClassRoom.filter(Boolean) as DocumentData[]); // Set form data in state
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);

      console.error("Error fetching form data: ", error);
    }
  }, [currentUser]);

  useEffect(() => {
    if (shouldRefresh) {
      fetchDataClassRoom();
      setShouldRefresh(false); // Reset after fetching data
    } else {
      fetchDataClassRoom();
    }
  }, [shouldRefresh, fetchDataClassRoom, setShouldRefresh]);
  const handleItemClickJoinRoom = () => {
    setIsModalOpenJoinRoom(true); // Open modal when button is clicked
  };
  const handleDropdownItemClick = () => {
    setIsModalOpen(true); // Open modal when button is clicked
  };

  const handleClickMenu = (index: number) => {
    setOpenMenus((prev) => (prev === index ? null : index));
  };
  const closeModal = () => {
    setIsModalOpen(false); // Function to close modal
    setIsModalOpenJoinRoom(false);
  };

  useOutsideClick(dropdownRef, () => setOpenMenus(() => null));

  // Handle form submission

  useEffect(() => {
    // lay thong tin user
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = querySnapshot.docs.map((doc) => doc.data());
        if (currentUser) {
          const loggedInUser = usersList.find(
            (user) =>
              user.email === currentUser.email && user.role === "teacher"
          );

          setUsers(loggedInUser ? [loggedInUser] : []);
        }
        // Debug: In dữ liệu ra console
        console.log("Fetched users Group:", usersList);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchUsers();
  }, [currentUser]);
  /// xoa lop hoc
  const handleDeleteClassRoom = async (id: string) => {
    const classRoomRef = doc(db, "classRoom", id);

    try {
      await deleteDoc(classRoomRef);
      Swal.fire({
        icon: "success",
        title: "Xoá lớp học thành công!",
        showConfirmButton: false,
        timer: 1500,
      });
      fetchDataClassRoom();
      setOpenMenus(() => null);
    } catch (error) {
      console.error("Error deleting document: ", error);
      Swal.fire({
        icon: "error",
        title: "Xoá không thành công!",
        text: "Đã xảy ra lỗi khi xóa lớp học.",
      });
    }
  };
  /// Redirect to Detail page
  const handleRedirect = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: string,
    nameRoom: string
  ) => {
    e.preventDefault();

    console.log("id handleRedirect", id);
    setShouldRefreshTabDetail(true);
    setNameRoom(nameRoom);
    setIdRoom(id);
    const customPath: string = `/detail/${id}`;
    navigate(customPath, {
      state: {
        formDataClassRoom: formDataClassRoom,
        dataUser: dataUser,
        id: id,
      },
    });
  };
  return (
    <div className="flex">
      <div className="flex-none">
        <LeftSidebar dataClassRoom={formDataClassRoom} dataUser={dataUser} />
      </div>
      <div className="fixed top-0 z-10 w-full bg-white">
        <Navbar />
      </div>

      {/* Conditionally render content based on whether formDataClassRoom is empty */}
      {loading ? (
        <div className="flex justify-center items-center w-screen h-screen">
          <div className="text-center">
            <div role="status">
              <svg
                aria-hidden="true"
                className="inline w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </div>
      ) : formDataClassRoom.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-screen h-screen">
          <img
            src="https://www.gstatic.com/classroom/empty_states_home.svg"
            alt="No classrooms available"
            className="w-96 h-96"
          />
          <div className="flex flex-row space-x-4 mt-4">
            <button
              onClick={handleItemClickJoinRoom}
              className="mt-4 px-4 py-2 text-sm font-medium text-black  rounded-lg hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-blue-300"
            >
              Tham gia lớp học
            </button>
            {dataUser.map((user) =>
              user.role === "teacher" ? (
                <button
                  className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
                  onClick={handleDropdownItemClick}
                >
                  Tạo lớp học
                </button>
              ) : (
                <div></div>
              )
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4  pl-8">
          {formDataClassRoom.map((data, index) => (
            <div className="mt-20" key={data.id}>
              <div className="relative max-w-sm mt-2 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                {dataUser.length != 0 && (
                  <div className="absolute top-2 right-2 ">
                    <button
                      onClick={() => handleClickMenu(index)}
                      className="inline-flex items-center p-1 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                      type="button"
                    >
                      <svg
                        className="w-5 h-5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 4 15"
                      >
                        <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                      </svg>
                    </button>

                    {openMenus === index && (
                      <div
                        ref={dropdownRef}
                        className="z-10  absolute bg-white divide-y divide-gray-100 rounded-lg shadow w-44   dark:divide-gray-600"
                      >
                        <ul className="py-2 text-sm text-black">
                          <li>
                            <a
                              href="#"
                              className="block px-4 py-2 hover:bg-gray-100 hover:text-black"
                              onClick={() => handleDeleteClassRoom(data.id)}
                            >
                              Xoá
                            </a>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <a href="#">
                  <img
                    className="rounded-t-lg w-full h-48 object-cover"
                    src={data.thumbnail}
                    alt=""
                  />
                </a>
                {data?.rating?.start != null ? (
                  <div className="flex space-x-3 mt-2">
                    {Array.from({ length: data.rating.start }).map(
                      (_, value) => (
                        <svg
                          key={value}
                          className={`w-8 h-8 cursor-pointer ${"text-yellow-500"}`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )
                    )}
                  </div>
                ) : (
                  <div className="flex space-x-3 mt-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <svg
                        key={value}
                        className={"w-8 h-8 cursor-pointer text-gray-500"}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                )}
                <div className="p-3">
                  <a
                    onClick={(e) => handleRedirect(e, data.id, data.nameRoom)}
                    href="#"
                  >
                    <h5 className="mb-2 text-xl font-normal tracking-tight text-gray-900 dark:text-white truncate">
                      {data.nameRoom}
                    </h5>
                  </a>
                  <p className="mb-2 text-sm text-gray-700 dark:text-white">
                    {data.part}
                  </p>
                  <a
                    onClick={(e) => handleRedirect(e, data.id, data.nameRoom)}
                    href="#"
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Read more
                    <svg
                      className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 10"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M1 5h12m0 0L9 1m4 4L9 9"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* join room */}

      <ModalJoinRoom
        isOpen={isModalOpenJoinRoom}
        closeModal={closeModal}
        userInfo={userInfo}
      />
      {/* create room */}
      <ModalCreateRoom
        isOpen={isModalOpen}
        closeModal={closeModal}
        userInfo={userInfo}
      />
    </div>
  );
};

export default Group;
