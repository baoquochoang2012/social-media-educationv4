import React, { useState, useContext, useEffect, useReducer, MouseEvent } from "react";
import ReactDOM from 'react-dom';
import { Avatar, Tooltip } from "@material-tailwind/react";
import avatar from "../../assets/images/avatar.jpg";
import like from "../../assets/images/like.png";
import comment from "../../assets/images/comment.png";
import remove from "../../assets/images/delete.png";
import addFriend from "../../assets/images/add-friend.png";
import { AuthContext } from "../AppContext/AppContext";
import {
  PostsReducer,
  postActions,
  postsStates,
} from "../AppContext/PostReducer";
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
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import CommentSection from "./CommentSection";
import CustomDialog from "../Dialog";
import Modal from "../Modal";
import Swal from "sweetalert2";
import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { round } from "lodash";
import PayPalModal from "../Paypal/ButtonPayPal";

interface PostCardProps {
  uid: string;
  id: string;
  logo: string;
  name: string;
  email: string;
  text: string;
  image?: string;
  timestamp: string;
  is_teacher?: boolean;
  ads?: [];
}

const PostCard: React.FC<PostCardProps> = ({ uid, id, logo, name, email, text, image, timestamp, is_teacher, ads }) => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    return null; // or some loading/error state
  }
  const { user, userData } = authContext;
  const [profile, setProfile] = useState<any>({
    logo: userData.image || user?.photoURL || avatar,
    name: userData.name,
  });
  const [totalAmount, settotalAmount] = useState<any>();
  // nếu có trong list friends thì không hiện nút add friend
  const [isFriend, setIsFriend] = useState([]);
  const [state, dispatch] = useReducer(PostsReducer, postsStates);
  const likesRef = doc(collection(db, "posts", id, "likes"));
  const likesCollection = collection(db, "posts", id, "likes");
  const singlePostDocument = doc(db, "posts", id);
  const { ADD_LIKE, HANDLE_ERROR } = postActions;
  const [open, setOpen] = useState(false);

  const handleOpen = (e: MouseEvent<HTMLDivElement>) => {
    // e.preventDefault();
    setOpen(true);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, "users"), where("uid", "==", uid));
        const docSnap = await getDocs(q);
  
        if (!docSnap.empty) {
          const userData = docSnap.docs[0].data(); // Fetch the data of the first matching document
          setProfile({
            logo: userData.image || avatar, // Default to `avatar` if no image is provided
            name: userData.name,
          });
        } else {
          console.error("No user found with the specified UID");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
  
    fetchUsers();
  }, [uid]); // Dependency array ensures `fetchUsers` runs only when `uid` changes


  const addUser = async () => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", user?.uid));
      const docSnap = await getDocs(q);
      const data = docSnap.docs[0].ref;
      console.log(data);
      await updateDoc(data, {
        friends: arrayUnion({
          id: uid,
          image: logo,
          name: name,
          access: 0
        }),
      });

      // const notificationRef = doc(collection(db, "notifi", uid)); // Reference to the notifications collection of the user being added
      // await setDoc(notificationRef, {
      //   message: `${user?.displayName || "Someone"} đã gửi lời mời kết bạn`,
      //   timestamp: new Date(),
      //   senderId: user?.uid,
      //   senderName: user?.displayName,
      //   senderAvt: userData?.image || user?.photoURL,
      //   type: "friend_request", // This can be used to categorize the notification
      //   read: false, // Initially the notification is unread
      // });
      notify('Đã gửi lời mời kết bạn', 'friend_request');
    } catch (err: any) {
      alert(err.message);
      console.log(err.message);
    }
  };

  const notify = (content = '', type = '') => {
    const notificationRef = doc(collection(db, "notifi", uid)); // Reference to the notifications collection of the user being added
    setDoc(notificationRef, {
      message: `${user?.displayName || "Someone"} ${content}`,
      timestamp: new Date(),
      senderId: user?.uid,
      senderName: user?.displayName,
      senderAvt: userData?.image || user?.photoURL,
      type: type, // This can be used to categorize the notification
      read: false, // Initially the notification is unread
    });
  }

  const handleLike = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const q = query(likesCollection, where("id", "==", user?.uid));
    const querySnapshot = await getDocs(q);
    const likesDocId = querySnapshot.docs[0]?.id;
    console.log('likesCollection', likesCollection);
    console.log('===', likesDocId);
    try {
      if (likesDocId !== undefined) {
        const deleteId = doc(db, "posts", id, "likes", likesDocId);
        await deleteDoc(deleteId);
      } else {
        await setDoc(likesRef, {
          id: user?.uid,
        });
        // notify('Đã thích bài viết của bạn', 'friend_request');
      }
    } catch (err: any) {
      alert(err.message);
      console.log(err.message);
    }
  }
  const deletePost = async (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      if (user?.uid === uid) {
        await deleteDoc(singlePostDocument);
      } else {
        alert("You can't delete other users' posts!");
      }
    } catch (err: any) {
      alert(err.message);
      console.log(err.message);
    }
  };

  useEffect(() => {
    const getLikes = async () => {
      try {
        const q = collection(db, "posts", id, "likes");
        const unsubscribe = onSnapshot(q, (doc) => {
          dispatch({
            type: ADD_LIKE,
            likes: doc.docs.map((item) => item.data()),
          });
        });
        return unsubscribe;
      } catch (err: any) {
        dispatch({ type: HANDLE_ERROR });
        alert(err.message);
        console.log(err.message);
      }
    };

    const unsubscribe = getLikes();

    return () => {
      if (unsubscribe) {
        unsubscribe;
      }
    };
  }, [id, ADD_LIKE, HANDLE_ERROR]);
  const [classRoom, setClassRoom] = useState([]);
  useEffect(() => {
    const fetchAds = async () => {
      if (ads?.length) {
        try {
          const q = query(collection(db, "classRoom"), where("code", "in", ads));
          const unsubscribe = onSnapshot(q, (snapshot) => {
            const adData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setClassRoom(adData);
            // Update your state here with adData if you have one, e.g., setAds(adData)
          });

          return () => unsubscribe(); // Clean up the listener on unmount
        } catch (err) {
          dispatch({ type: HANDLE_ERROR });
          console.log(err.message);
        }
      }
    };

    fetchAds();
  }, [ads, dispatch]); // Add dependencies

  useEffect(() => {
    const getComments = async () => {
      try {
        const q = query(collection(db, "posts", id, "comments"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          dispatch({
            type: "ADD_COMMENT",
            comments: snapshot.docs.map((doc) => doc.data()),
          });
        });
        return unsubscribe;
      } catch (err: any) {
        dispatch({ type: HANDLE_ERROR });
        alert(err.message);
        console.log(err.message);
      }
    };
    const unsubscribe = getComments();
    return () => {
      if (unsubscribe) {
        unsubscribe;
      }
    };
  }, [id, HANDLE_ERROR]);

  // console.log(state.likes);

  // useEffect(() => {
  //   const getProfile = async () => {
  //     try {
  //       const q = query(collection(db, "users"), where("uid", "==", uid));
  //       const docSnap = await getDocs(q);
  //       setProfile(docSnap.docs[0].data());
  //     } catch (err: any) {
  //       alert(err.message);
  //       console.log(err.message);
  //     }
  //   };
  //   return getProfile();
  // }, [uid]);

  // useEffect(() => {
  //   const checkFriend = async () => {
  //     try {
  //       const q = query(collection(db, "users"), where("uid", "==", user?.uid));
  //       const docSnap = await getDocs(q);
  //       const data = docSnap.docs[0].data();
  //       setIsFriend(data.friends);
  //     } catch (err: any) {
  //       // alert(err.message);
  //       console.log(err.message);
  //     }
  //   };
  //   checkFriend();
  // }, [user?.uid]);

  // console.log('isFriend', isFriend);
  const [isZoomed, setIsZoomed] = useState(false);

  // Close modal on "Esc" key press
  useEffect(() => {
    const handleKeyDown = (event: { key: string; }) => {
      if (event.key === "Escape") {
        setIsZoomed(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Toggle zoom
  const handleImageClick = () => {
    setIsZoomed(true);
  };

  // Close zoomed image
  const closeZoom = () => {
    setIsZoomed(false);
  };
  const convertCurrencyStringToNumber = (currencyString: string) => {
    // Loại bỏ các ký tự đặc biệt và khoảng trắng
    const numericString = currencyString.replace(/[^\d]/g, '');
    return Number(numericString);
  };
  const [loading, setLoading] = useState(false);
  const total = totalAmount / 25420;
  const gettotal = round(total, 2);
  const amount = 56;
  const [openModal, setOpenModal] = useState(false);
  const [infClassRoom, setInfClassRoom] = useState({});
  const openClassRoom = (data: React.SetStateAction<{}>) => {
    setInfClassRoom(data);
    setOpenModal(true);
    const numericFee = convertCurrencyStringToNumber(data.feeAmount);
    settotalAmount(numericFee); // Lưu lại giá trị đã chuyển đổi
    setKeyValue((prevKey) => prevKey + 1);
  }

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
  // const currency = _lang == "en" ? "USD" : "VND";
  const currency = "USD";
  const style = { layout: "vertical" };
  // Custom component to wrap the PayPalButtons and handle currency changes
  const ButtonWrapper = ({ currency, showSpinner }) => {
    const [{ options, isPending }, dispatch] = usePayPalScriptReducer();

    useEffect(() => {
      dispatch({
        type: "resetOptions",
        value: {
          ...options,
          currency: currency,
        },
      });
    }, [currency, showSpinner]);

    return (
      <>
        {showSpinner && isPending && <div className="spinner" />}
        <PayPalButtons
          style={style}
          disabled={false}
          forceReRender={[amount, currency, style]}
          fundingSource={undefined}
          createOrder={(datas, actions) => {
            return actions.order
              .create({
                purchase_units: [
                  {
                    amount: {
                      currency_code: currency,
                      value: amount,
                    },
                  },
                ],
                intent: "CAPTURE"
              })
              .then((orderId) => {
                return orderId;
              });
          }}
          onApprove={(data, actions) => {
            return actions.order.capture().then(() => {
              // Your code here after capture
              setTimeout(() => {
                handleJoin();
              }, 500);
            });
          }}
        />
      </>
    );
  };

  const [isScriptFailed, setIsScriptFailed] = useState(false);

  const handleScriptError = () => {
    console.error("Failed to load the PayPal SDK script.");
    setIsScriptFailed(true);
  };
  const [delayedRender, setDelayedRender] = useState(false);
  useEffect(() => {
    if (infClassRoom.feeAmount) {
      const timer = setTimeout(() => setDelayedRender(true), 200);
      return () => clearTimeout(timer); // Clean up the timer on component unmount
    }
  }, [infClassRoom.feeAmount]);

  const [keyValue, setKeyValue] = useState(0);
  const [isPayPalRendered, setIsPayPalRendered] = useState(false);
  // useEffect(() => {
  //   return () => {
  //     // Optional cleanup for PayPal components
  //     window.paypal && window.paypal.Buttons.driver('react', { React, ReactDOM }).destroy();
  //   };
  // }, []);
  return (
    <div className="mb-4">
      <div className="flex flex-col py-4 bg-white rounded-t-3xl">
        <div className="flex justify-start items-center pb-4 pl-4">
          <Avatar
            size="sm"
            variant="circular"
            src={profile.logo || avatar}
            alt="avatar"
          />
          <div className="flex flex-col ml-4">
            <p className="py-2 font-roboto font-medium text-sm text-gray-700 no-underline tracking-normal leading-none flex items-center">
              {profile.name}
              {is_teacher && (
                <span className="text-slate-500 ml-2">
                  <Tooltip color="light" content="Giáo viên" placement="top" animation="shift-down" >
                    <svg class="h-6 w-6 text-sky-500" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M7 12l5 5l10 -10" />  <path d="M2 12l5 5m5 -5l5 -5" /></svg>
                  </Tooltip>
                </span>
              )}
            </p>
            <p className="font-roboto font-medium text-sm text-gray-700 no-underline tracking-normal leading-none">
              {timestamp}
            </p>
          </div>
          {/* {user?.uid !== uid && Array.isArray(isFriend) && isFriend.every((item) => item?.id !== uid) && (
            <div
              onClick={addUser}
              className="w-full flex justify-end cursor-pointer mr-10"
            >
              <img
                className="hover:bg-blue-100 rounded-xl p-2"
                src={addFriend}
                alt="addFriend"
              />
            </div>
          )} */}

        </div>
        <div>
          <p className="ml-4 pb-4 font-roboto font-medium text-sm text-gray-700 no-underline tracking-normal leading-none">
            {text}
          </p>
          {image && (
            // <img className="h-[500px] w-full object-cover" src={image} alt="postImage" />
            <div className="flex flex-col w-full leading-[1.5] p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
              <div className="group relative my-2.5">
                <div className="absolute w-full h-full bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                  <Tooltip color="light" content="Xem chi tiết" placement="top" animation="shift-down" >
                    <button
                      data-tooltip-target="download-image"
                      className="inline-flex items-center justify-center rounded-full h-10 w-10 bg-white/30 hover:bg-white/50 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50"
                      onClick={handleImageClick}
                    >
                      {/* <svg
                      className="w-5 h-5 text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 16 18"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"
                      />
                    </svg> */}
                      <svg class="h-8 w-8 text-neutral-500" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M10 12h-7l3 -3m0 6l-3 -3" />  <path d="M14 12h7l-3 -3m0 6l3 -3" />  <path d="M3 6v-3h18v3" />  <path d="M3 18v3h18v-3" /></svg>
                    </button>
                  </Tooltip>
                </div>
                <div className="flex items-center justify-center bg-black w-full h-[400px] rounded-lg">
                  {/* Center the image with black background on sides */}
                  <img
                    src={image}
                    className="rounded-lg max-h-[400px] object-contain"
                    srcSet="medium-res-image.jpg 2x, high-res-image.jpg 3x"
                    style={{
                      imageRendering: "-webkit-optimize-contrast",
                      maxWidth: "100%",
                      width: "auto",
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          {ads?.length > 0 && (
            ads.length === 1 ? (
              <div className="flex flex-col w-full leading-[1.5] p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                {classRoom.map((ad, index) => (
                  <div className="group relative my-2.5" key={ad.id}> {/* Use a unique key */}
                    <div className="absolute w-full h-full bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                      <Tooltip color="light" content="Xem chi tiết" placement="top" animation="shift-down">
                        <button
                          className="inline-flex items-center justify-center rounded-full h-10 w-10 bg-white/30 hover:bg-white/50 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50"
                        >
                          <svg
                            className="w-5 h-5 text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 16 18"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"
                            />
                          </svg>
                        </button>
                      </Tooltip>
                    </div>
                    <div className="flex items-center justify-center bg-black w-full h-[400px] rounded-lg relative">
                      <img
                        src={ad.thumbnail}
                        className="rounded-lg max-h-[400px] object-contain"
                        style={{
                          imageRendering: "-webkit-optimize-contrast",
                          maxWidth: "100%",
                          width: "100%",
                          height: "238px"
                        }}
                      />
                      {/* Overlay for the text content */}
                      <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-60 p-4 rounded-b-lg">
                        <h4 className="text-white text-lg font-semibold">{ad.nameRoom}</h4>
                        <span className="text-white text-sm">Phần {ad.part}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-2 my-2.5 cursor-pointer">
                {classRoom.map((ad, index) => (
                  <div className="group relative" key={ad.id} onClick={() => openClassRoom(ad)}>
                    <div className="absolute w-full h-full bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                      <button
                        data-tooltip-target={`download-image-${index}`}
                        className="inline-flex items-center justify-center rounded-full h-8 w-8 bg-white/30 hover:bg-white/50 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50"
                      >
                        <svg
                          className="w-4 h-4 text-white"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 16 18"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"
                          />
                        </svg>
                      </button>
                      <div
                        id={`download-image-${index}`}
                        role="tooltip"
                        className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
                      >
                        Download image
                        <div className="tooltip-arrow" data-popper-arrow></div>
                      </div>
                    </div>
                    <div className="relative">
                      <img
                        src={ad.thumbnail}
                        className="rounded-lg w-[100%] h-[238px]"
                      />
                      {/* Overlay for the text content */}
                      <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-60 p-4 rounded-b-lg">
                        <div className="flex justify-between">
                          <h4 className="text-white text-lg font-semibold">{ad.nameRoom}</h4>
                          <h4 className="text-white text-lg font-semibold">{ad.feeAmount || 'Free'}</h4>
                        </div>
                        <span className="text-white text-sm">Phần {ad.part}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
          {/* Zoomed Image Modal */}
          {isZoomed && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="relative">
                <button
                  className="absolute top-2 right-2 text-white text-2xl bg-black/50 rounded-full w-10 h-10 flex items-center justify-center"
                  onClick={closeZoom}
                >
                  &times;
                </button>

                <img
                  src={image}
                  className="max-w-full max-h-screen object-contain"
                  alt="Zoomed view"
                />
              </div>
            </div>
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
        </div>
        <div className="flex justify-around items-center pt-4">
          <div className="flex items-center cursor-pointer rounded-lg p-2 hover:bg-gray-100">
            {state.likes?.length} lượt thích
          </div>
          <div
            className="flex items-center cursor-pointer rounded-lg p-2 hover:bg-gray-100"
          >
            {state.comments?.length} bình luận
          </div>
        </div>
        <div className="flex justify-around items-center pt-4">
          {state.likes?.some((item) => item.id === user?.uid) ? (
            <button
              className="flex items-center cursor-pointer rounded-lg p-2 hover:bg-gray-100 bg-blue-100"
              onClick={handleLike}
            >
              {/* <img className="h-8 mr-4" src={like} alt="like" /> */}
              <svg class="h-8 w-8 text-slate-700 mr-4" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M7 11v 8a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-7a1 1 0 0 1 1 -1h3a4 4 0 0 0 4 -4v-1a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1 -2 2h-7a3 3 0 0 1 -3 -3" /></svg>
              <p className="font-roboto font-medium text-md text-gray-700 no-underline tracking-normal leading-none">
                {state.likes?.some((item) => item.id === user?.uid) ? "Bỏ thích" : "Thích"}
              </p>
            </button>
          ) : (
            <button
              className="flex items-center cursor-pointer rounded-lg p-2 hover:bg-gray-100"
              onClick={handleLike}
            >
              {/* <img className="h-8 mr-4" src={like} alt="like" /> */}
              <svg class="h-8 w-8 text-slate-700 mr-4" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M7 11v 8a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-7a1 1 0 0 1 1 -1h3a4 4 0 0 0 4 -4v-1a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1 -2 2h-7a3 3 0 0 1 -3 -3" /></svg>
              <p className="font-roboto font-medium text-md text-gray-700 no-underline tracking-normal leading-none">
                {state.likes?.some((item) => item.id === user?.uid) ? "Bỏ thích" : "Thích"}
              </p>
            </button>
          )}
          <div
            className="flex items-center cursor-pointer rounded-lg p-2 hover:bg-gray-100"
            onClick={handleOpen}
          >
            <div className="flex items-center cursor-pointer">
              {/* <img className="h-8 mr-4" src={comment} alt="comment" /> */}
              <svg class="h-8 w-8 mr-4 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
              <p className="font-roboto font-medium text-md text-gray-700 no-underline tracking-normal leading-none">
                Bình luận
              </p>

            </div>
          </div>
          <div
            className="flex items-center cursor-pointer rounded-lg p-2 hover:bg-gray-100"
            onClick={deletePost}
          >
            {/* <img className="h-8 mr-4" src={remove} alt="delete" /> */}
            <svg class="h-8 w-8 mr-4 text-slate-700" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <line x1="4" y1="7" x2="20" y2="7" />  <line x1="10" y1="11" x2="10" y2="17" />  <line x1="14" y1="11" x2="14" y2="17" />  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
            <p className="font-roboto font-medium text-md text-gray-700 no-underline tracking-normal leading-none">
              Delete
            </p>
          </div>
        </div>
      </div>
      {open && <CommentSection postId={id} />}

      {/* <Modal
        openModal={openModal}
        setOpenModal={setOpenModal}
        title={titleClassRoom}
        position="center"
        showFooter={false}>
        <div class="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
          <h5 class="mb-4 text-xl font-medium text-gray-500 dark:text-gray-400">Standard plan</h5>
          <div class="flex items-baseline text-gray-900 dark:text-white">
            <span class="text-3xl font-semibold">$</span>
            <span class="text-5xl font-extrabold tracking-tight">49</span>
            <span class="ms-1 text-xl font-normal text-gray-500 dark:text-gray-400">/month</span>
          </div>
          <ul role="list" class="space-y-5 my-7">
            <li class="flex items-center">
              <svg class="flex-shrink-0 w-4 h-4 text-blue-700 dark:text-blue-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
              <span class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">2 team members</span>
            </li>
            <li class="flex">
              <svg class="flex-shrink-0 w-4 h-4 text-blue-700 dark:text-blue-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
              <span class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">20GB Cloud storage</span>
            </li>
            <li class="flex">
              <svg class="flex-shrink-0 w-4 h-4 text-blue-700 dark:text-blue-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
              <span class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">Integration help</span>
            </li>
            <li class="flex line-through decoration-gray-500">
              <svg class="flex-shrink-0 w-4 h-4 text-gray-400 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
              <span class="text-base font-normal leading-tight text-gray-500 ms-3">Sketch Files</span>
            </li>
            <li class="flex line-through decoration-gray-500">
              <svg class="flex-shrink-0 w-4 h-4 text-gray-400 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
              <span class="text-base font-normal leading-tight text-gray-500 ms-3">API Access</span>
            </li>
            <li class="flex line-through decoration-gray-500">
              <svg class="flex-shrink-0 w-4 h-4 text-gray-400 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
              <span class="text-base font-normal leading-tight text-gray-500 ms-3">Complete documentation</span>
            </li>
            <li class="flex line-through decoration-gray-500">
              <svg class="flex-shrink-0 w-4 h-4 text-gray-400 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
              <span class="text-base font-normal leading-tight text-gray-500 ms-3">24×7 phone & email support</span>
            </li>
          </ul>
          <button type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-200 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-900 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex justify-center w-full text-center">Choose plan</button>
        </div>

      </Modal> */}
    </div>
  );
};

export default PostCard;
