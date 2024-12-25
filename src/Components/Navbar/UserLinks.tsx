/* eslint-disable react-hooks/rules-of-hooks */
import { useContext, useState, useEffect, useRef } from "react";
import { Tooltip } from "@material-tailwind/react";
import { Avatar } from "@material-tailwind/react";
import avatar from "../../assets/images/avatar.jpg";
import { AuthContext } from "../AppContext/AppContext";
import { useNavigate } from "react-router-dom";
import { arrayUnion, collection, doc, getDocs, limit, orderBy, query, setDoc, startAfter, updateDoc, where } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { getAuth } from "firebase/auth";

import ModalCreateRoom from "../Pages/group/modalCreateRoom";
import ModalJoinRoom from "../Pages/group/modalJoinRoom";
import { onSnapshot } from "firebase/firestore";
import formatVietnameseDate from "../../FormatTime";

const UserLinks = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext); // Call this outside of any conditional
  const [dropdownOpenLogout, setDropdownOpenLogout] = useState(false);
  const [dropdownOpenCreateRoom, setDropdownOpenCreateRoom] = useState(false);
  const [dropdownOpenJoinRoom, setDropdownOpenJoinRoom] = useState(false);

  const [showButtonCreateRoom, setShowButton] = useState(false);
  // Assuming users state is also needed
  const [formOpen, setFormOpen] = useState(false);
  const auth = getAuth(); // Initialize Firebase auth

  const currentUser = auth.currentUser;
  const [userInfo, setUserInfo] = useState<{
    uid: string | null;
    email: string | null;
  }>({
    uid: null,
    email: null,
  });
  if (!authContext) {
    return null; // or some loading/error state
  }

  const { user, userData, signOutUser } = authContext;
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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
  // toggle dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpenCreateRoom(false); // Close dropdown if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside); // Add event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Cleanup event listener
    };
  }, [dropdownRef]);

  //////

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = querySnapshot.docs.map((doc) => doc.data());

        // Debug: In dữ liệu ra console
        console.log("Fetched users:", usersList);

        if (currentUser) {
          const loggedInUser = usersList.find(
            (user) =>
              user.email === currentUser.email && user.role === "teacher"
          );

          if (loggedInUser) {
            console.log("Logged-in teacher:", loggedInUser);
            setShowButton(true); // Show button if the logged-in user is a teacher
          } else {
            setShowButton(false); // Ẩn nút nếu không phải giáo viên
          }
        }
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchUsers();
  }, [currentUser]);

  const toggleDropdown = () => {
    setDropdownOpenLogout((prev) => !prev); // Toggle dropdown visibility
  };

  const toggleDropdownCreateRoom = () => {
    setDropdownOpenCreateRoom((prev) => !prev); // Toggle dropdown visibility
  };
  const handleDropdownItemClick = () => {
    setDropdownOpenCreateRoom(false); // Close dropdown
    setFormOpen(true); // Open the form
  };

  const handleDropdownItemClickJoinRoom = () => {
    setDropdownOpenCreateRoom(false); // Close dropdown
    setDropdownOpenJoinRoom(true); // Open the form
  };
  // Close the modal
  const closeModal = () => {
    setFormOpen(false);
    setDropdownOpenJoinRoom(false);
  };

  // Handle form input changes
  const [openNotify, setOpenNotify] = useState(false);


  const handleClickOutside = (event: { target: Node | null; }) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setOpenNotify(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch initial notifications when the component loads
    const fetchNotifications = async () => {
      try {
        const notificationsRef = collection(db, "notifi");
        const q = query(
          notificationsRef,
          where("uid", "==", userData.uid),
          orderBy("timestamp", "desc"),
          limit(10)
        );

        const querySnapshot = await getDocs(q);
        const notificationsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setNotifications(notificationsData);
        setUnreadCount(notificationsData.filter((noti) => !noti.read).length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [userData]);
  // useEffect(() => {
  //   // Thiết lập listener cho thông báo theo thời gian thực
  //   const fetchNotifications = () => {
  //     try {
  //       const notificationsRef = collection(db, "notifi");
  //       const q = query(
  //         notificationsRef,
  //         where("uid", "==", userData.uid),
  //         orderBy("timestamp", "desc"),
  //         limit(10)
  //       );
  
  //       // Lắng nghe thay đổi trong thời gian thực
  //       const unsubscribe = onSnapshot(q, (querySnapshot) => {
  //         const notificationsData = querySnapshot.docs.map((doc) => ({
  //           id: doc.id,
  //           ...doc.data(),
  //         }));
  
  //         setNotifications(notificationsData);
  //         setUnreadCount(notificationsData.filter((noti) => !noti.read).length);
  //       });
  
  //       // Dọn dẹp listener khi component bị unmount
  //       return unsubscribe();
  //     } catch (error) {
  //       console.error("Error fetching notifications:", error);
  //     }
  //   };
  
  //   const unsubscribe = fetchNotifications();
  //   return () => unsubscribe; // Cleanup listener khi component unmount
  // }, [userData]);
  console.log('notifications', notifications)
  const handleToggleNotifications = () => {
    setOpenNotify(!openNotify);
  };
  const handleRedirect = (e: any, uid: string) => {
    e.preventDefault();
    navigate(`/profile/${uid}`);
  };

  const approveUser = async (profile: { uid: string | undefined; image: any; name: any; }, notificationId: string | undefined) => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", user?.uid));
      const docSnap = await getDocs(q);
      const data = docSnap.docs[0].ref;
      await updateDoc(data, {
        friends: arrayUnion({
          id: profile?.uid,
          image: profile?.image,
          name: profile?.name,
          access: 1
        }),
      });
      const onApprove = query(collection(db, "users"), where("uid", "==", profile?.uid));
      const docSnapApprove = await getDocs(onApprove);

      if (docSnapApprove.empty) {
        console.log("User who sent the request not found.");
        return;
      }

      const approveUserDocRef = docSnapApprove.docs[0].ref;
      const approveUserData = docSnapApprove.docs[0].data();

      const updatedFriends = approveUserData.friends.map((friend: { id: string | undefined; }) => {
        if (friend.id === user?.uid) {
          return { ...friend, access: 1 };  // Update the access field for the current user
        }
        return friend; // Keep other friends unchanged
      });

      await updateDoc(approveUserDocRef, {
        friends: updatedFriends,
      });
      notify('Đã chấp nhận lời mời kết bạn', 'friend_approve', profile?.uid);
      await updateNotify(notificationId, "friend_approved", true);
    } catch (err: any) {
      alert(err.message);
      console.log(err.message);
    }
  };
  const notify = async (content = '', type = '', uid = '') => {
    try {
      // Directly reference a new document in the top-level "notifi" collection
      const notificationRef = doc(collection(db, "notifi"));

      await setDoc(notificationRef, {
        uid: uid, // User ID of the person receiving the notification
        message: `${userData?.name || "Someone"} ${content}`,
        timestamp: new Date(),
        senderId: userData?.uid,
        senderName: userData?.name,
        senderAvt: userData?.image || user?.photoURL,
        type: type, // Type of notification, e.g., 'friend_request', 'friend_removal'
        read: false, // Notification is unread initially
      });

      console.log("Notification added successfully to the notifi collection!");
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  };
  const updateNotify = async (notificationId: string, newType: any, newReadStatus: any) => {
    try {
      // Reference the notification document using the notificationId
      const notificationRef = doc(db, "notifi", notificationId);
  
      // Update the 'type' and 'read' fields of the notification
      await updateDoc(notificationRef, {
        type: newType, // E.g., 'friend_approved' after approval
        read: newReadStatus, // Set to true if the notification has been read
      });
  
      console.log("Notification updated successfully!");
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };
  
  return (
    <div className="flex justify-center items-center cursor-pointer">
      {/* <div className="hover:translate-y-1 duration-500 ease-in-out hover:text-blue-500 mx-4">
        <Tooltip content="Profile" placement="bottom">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
            onClick={() => navigate("/profile/auth/" + user?.uid)}
          >
            {" "}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>{" "}
        </Tooltip>{" "}
      </div> */}
      {location.pathname === "/group" && (
        <div className="relative" ref={dropdownRef}>
          {" "}
          {/* Wrap in a relative div for dropdown positioning */}
          <div
            onClick={toggleDropdownCreateRoom} // Toggle dropdown on icon click
            className="hover:translate-y-1 duration-500 ease-in-out hover:text-blue-500 mx-4"
          >
            <Tooltip content="Tạo hoặc tham gia lớp" placement="bottom">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </Tooltip>
          </div>
          {/* Dropdown content */}
          {dropdownOpenCreateRoom && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50">
              <ul className="py-1 text-sm text-gray-700">
                {showButtonCreateRoom && (
                  <li>
                    <a
                      id="113"
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={handleDropdownItemClick} // Replace with your logic
                    >
                      Tạo lớp học
                    </a>
                  </li>
                )}
                <li>
                  <a
                    href="#"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={handleDropdownItemClickJoinRoom} // Replace with your logic
                  >
                    Tham gia lớp học
                  </a>
                </li>
              </ul>
            </div>
          )}
          {/* Conditionally render the form */}
          {/* Modal */}
          <ModalCreateRoom
            isOpen={formOpen}
            closeModal={closeModal}
            userInfo={userInfo}
          />
          <ModalJoinRoom
            isOpen={dropdownOpenJoinRoom}
            closeModal={closeModal}
            userInfo={userInfo}
          />
        </div>
      )}

      <div className="relative inline-block ease-in-out mx-4" onClick={handleToggleNotifications}>
        <Tooltip content="Thông báo" placement="bottom">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
            {unreadCount > 0 && (
              <div className="absolute inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-1 -right-1">
                {unreadCount}
              </div>
            )}
          </div>
        </Tooltip>

        {openNotify && (
          <div
            ref={dropdownRef}
            className="origin-top-right absolute right-0 mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 w-[380px]"
          >
            <div className="flow-root w-full max-h-64 overflow-y-auto">
              <ul role="list" className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <li key={notification.id} className="py-3 sm:py-4 transition-transform transform cursor-pointer">
                    <div className="flex items-center mr-5 ml-5"
                      onClick={(e) => handleRedirect(e, notification.senderId)}
                    >
                      <div className="flex-shrink-0">
                        <img
                          className="w-8 h-8 rounded-full"
                          src={notification.senderAvt || "default-avatar-url"}
                          alt="avatar"
                        />
                      </div>
                      <div className="flex-1 min-w-0 ms-4">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.senderName || "Unknown"}
                            {/* Thời gian thông báo */}
  <div className="text-xs text-gray-500 whitespace-nowrap">
    {formatVietnameseDate(new Date(notification?.timestamp?.seconds * 1000))}
  </div>

                        </p>
                        <span>{notification.message}</span>
                      </div>
                      {notification.type === "friend_request" && (
                        <div className="inline-flex items-center text-base font-semibold text-gray-900">
                          <button className="px-3 bg-blue-400 hover:bg-blue-700 text-white rounded focus:outline-none" onClick={() => approveUser({
                              uid: notification.senderId,
                              image: notification.senderAvt,
                              name: notification.senderName
                            }, notification.id)}>
                            Xác nhận
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="mx-4 flex items-center ">
        <Avatar
          onClick={() => navigate("/profile/auth/" + user?.uid)}
          src={userData?.image || user?.photoURL || avatar}
          size="sm"
          alt="avatar"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        ></Avatar>

        <p className="ml-4 font-roboto text-sm text-black font-medium no-underline">
          {userData?.name !== undefined
            ? userData?.name?.charAt(0)?.toUpperCase() +
            userData?.name?.slice(1)
            : user?.displayName?.split(" ")[0]}
        </p>

        <div
          className="ml-0 duration-500 ease-in-out hover:text-blue-500"
          onClick={toggleDropdown}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>

        {dropdownOpenLogout && (
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50">
            <ul className="py-1 text-sm text-gray-700">
              <li>
                <a
                  href="#"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={signOutUser} // Call signOutUser function on click
                >
                  Sign Out
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserLinks;
