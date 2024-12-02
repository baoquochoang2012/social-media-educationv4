import React, {
  useState,
  useRef,
  useContext,
  useReducer,
  useEffect,
  FormEvent,
  ChangeEvent,
} from "react";
import { Avatar, Button, Alert, Textarea, MenuList, MenuItem } from "@material-tailwind/react";
import avatar from "../../assets/images/avatar.jpg";
import live from "../../assets/images/live.png";
import smile from "../../assets/images/smile.png";
import images from "../../assets/images/image.png";
import cource from "../../assets/images/cource.png";
import friend from "../../assets/images/friend.png";
import addImage from "../../assets/images/add-image.png";
import { AuthContext } from "../AppContext/AppContext";
import {
  doc,
  setDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  where,
  DocumentData,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
  PostsReducer,
  postActions,
  postsStates,
} from "../AppContext/PostReducer";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import PostCard from "./PostCard";
import formatVietnameseDate from "../../FormatTime";
import Modal from "../Modal";
import { Input } from "@material-tailwind/react";
import Select, { OptionsOrGroups } from 'react-select';
import { ClickAwayListener, Grow, Paper, Popper } from "@mui/material";
import { Tooltip } from "@material-tailwind/react";
import Swal from "sweetalert2";
import {emojis} from "../../utils/emojis";
interface Post {
  id: string;
  content: string;
  // other properties as needed
}

interface CourseOption {
  value: string;
  label: string;
}

interface SetPostProps {
  dataPosts: DocumentData[];
  From: string;
}

const Main: React.FC<SetPostProps> = ({ dataPosts, From }) => {
  // const { user, userData } = useContext(AuthContext);
  const authContext = useContext(AuthContext);
  if (!authContext) {
    return null; // or some loading/error state
  }
  const { user, userData } = authContext;
  // console.log(user, userData);
  const text = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const collectionRef = collection(db, "posts");
  const postRef = doc(collection(db, "posts"));
  // const postRef = doc(db, "posts", "specificDocumentId");
  // if (dataPosts != undefined) postRef = dataPosts;
  // const documentIds = dataPosts.map((doc) => doc.id);
  const document = postRef.id;
  const [state, dispatch] = useReducer(PostsReducer, postsStates);
  const { SUBMIT_POST, HANDLE_ERROR } = postActions;
  const [progressBar, setProgressBar] = useState<number>(0);
  const [openModal, setOpenModal] = useState(false);
  const popup = () => {
    setOpenModal(true);
    setIsDropdownOpen(false);
    setIsOpen(false);
  };
  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const storage = getStorage();

  const metadata = {
    contentType: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/svg+xml",
    ],
  };

  const submitImage = async () => {
    const fileType = metadata.contentType.includes(file?.type || "");
    if (!file) return;
    if (fileType) {
      try {
        const storageRef = ref(storage, `images/${file.name}`);
        const uploadTask = uploadBytesResumable(
          storageRef,
          file,
          { contentType: file.type }
        );
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setProgressBar(progress);
          },
          (error) => {
            alert(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setImage(downloadURL);
          }
        );
      } catch (err: any) {
        dispatch({ type: HANDLE_ERROR });
        alert(err.message);
        console.log(err.message);
      }
    }
  };


  useEffect(() => {
    if (!userData || !userData.uid) return;
    // const userAndFriendsIds = [userData.uid, ...(userData.friends || []).map((friend: any) => friend.id)];
    const userAndFriendsIds = [
      userData.uid,
      ...(userData.friends || [])
        .filter((friend: any) => friend.access === 1) // Lọc bạn bè có access = 1
        .map((friend: any) => friend.id) // Lấy danh sách ID từ bạn bè đã lọc
    ];
    console.log('userAndFriendsIds',userAndFriendsIds);
    const fetchPosts = async () => {
      if (!userData || !userData.uid) return;
      userAndFriendsIds.map((value) => { if (Object(value)) return value.id; });
      console.log('userAndFriendsIds 1',userAndFriendsIds);
      // Combine the user's UID with the list of friend UIDs
      let whereRaw;
      if (From === 'profile') {
        whereRaw = where("uid", "==", dataPosts[0].id);
      } else {
        whereRaw = where("uid", "in", userAndFriendsIds);
      }
      const q = query(
        collection(db, "posts"),
        whereRaw, // Filter posts by user's UID and friends' UIDs
        orderBy("timestamp", "desc")
        // orderBy("timestamp", "asc")
      );


      onSnapshot(q, (snapshot) => {
        const fetchedPosts = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            documentId: doc.id,
            uid: data.uid,
            logo: data.logo,
            name: data.name,
            email: data.email,
            image: data.image,
            text: data.text,
            ads: data.ads,
            timestamp: data.timestamp,
          };
        });
        dispatch({
          type: SUBMIT_POST,
          posts: fetchedPosts,
        });
        // scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        window.scrollTo({ top: 550, behavior: "smooth" });
        setImage(null);
        setUpImage(null);
        setFile(null);
        setProgressBar(0);
      });
    };

    fetchPosts();

    return () => {
      // Cleanup function if needed
    };
  }, [userData, SUBMIT_POST]);
  console.log('fetchedPosts', state?.posts);

  const [classRoom, setClassRoom] = useState([]);
  useEffect(() => {
    const fetchClassRoom = async () => {
      // if (user?.uid) {
      const q = query(
        collection(db, 'classRoom'),
        where('uid', '==', userData?.uid),
        // orderBy("timestamp", "desc")
      );
      onSnapshot(q, (snapshot) => {
        const fetchedPosts = snapshot.docs.map((doc) => doc.data());
        console.log('post', fetchedPosts);
        setClassRoom(fetchedPosts); // Update with an array of documents
      });
      // }
    };
    fetchClassRoom(); // Call the function here
  }, [user?.uid, db]); // Specify dependencies

  console.log('classRoom', classRoom);


  const options: CourseOption[] = [];
  useEffect(() => {
    userData?.list_course?.forEach((course: any) => {
      options.push({ value: course, label: course });
    });
  }
    , [userData?.list_course]);
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const textRef = useRef(null);

  const handleEmojiClick = (emoji: any) => {
    if (textRef.current) {
      textRef.current.value += emoji;
    }
  };
  const [isVisible, setIsVisible] = useState(true);
  const [isVisibleCourse, setIsVisibleCourse] = useState(false);

  const openAction = (action = '') => {
    if (action == 'image') {
      setIsVisible(!isVisible);
      setIsVisibleCourse(false);
    } else {
      setIsVisible(false);
      setIsVisibleCourse(!isVisibleCourse);
    }
    setProgressBar(0);
  }
  // const [setIsVisibleCourse, setIsVisibleCourse] = useState(true);
  // const [setIsVisibleFriend, setIsVisibleFriend] = useState(true);
  const [upimage, setUpImage] = useState<string | null>(null);

  const handleRemoveClick = () => {
    setUpImage(null);
    setImage(null);
    setFile(null);
    setIsVisible(false); // Hides the section
    setProgressBar(0); // Hides the section
  };

  const fileInputRef = useRef(null);

  const handleClick = () => {
    // Trigger the hidden file input when div is clicked
    fileInputRef.current.click();
  };

  const [loading, setLoading] = useState(false);
  const handleFileChange = (event: { target: { files: any[]; }; }) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile); // Store the file for later upload
      setUpImage(URL.createObjectURL(selectedFile)); // Preview the image
    } else {
      alert("File type not supported. Please upload a JPEG, PNG, or GIF image.");
    }
  };

  const handleSubmitPost = async (e: { preventDefault: () => void; }) => {
    try {
      setLoading(true);
      e.preventDefault();
      if (textRef.current?.value || upimage || selectedCourses.length > 0) {
        try {
          let downloadURL = "";

          // Upload image to Firebase Storage if a file is selected
          if (file) {
            const storageRef = ref(storage, `images/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file, { contentType: file.type });

            await new Promise<void>((resolve, reject) => {
              uploadTask.on(
                "state_changed",
                (snapshot) => {
                  const progress = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                  );
                  setProgressBar(progress);
                },
                (error) => {
                  alert(error.message);
                  reject(error);
                },
                async () => {
                  downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                  setImage(downloadURL);
                  setUpImage(downloadURL);
                  resolve();
                }
              );
            });
          }

          // Prepare data for the post
          const data = {
            documentId: document,
            uid: user?.uid || userData?.uid,
            logo: userData?.image || user?.photoURL || avatar,
            name: userData?.name || user?.displayName,
            email: user?.email || userData?.email,
            text: textRef.current?.value,
            image: downloadURL,
            ads: selectedCourses,
            timestamp: serverTimestamp(),
          };
          console.log('data',data);
          console.log('postRef',postRef);
          // await addDoc(collectionRef,data);
          await setDoc(postRef, data);
          if (textRef.current) textRef.current.value = "";
          setOpenModal(false);
          setSelectedCourses([]);
        } catch (err) {
          dispatch({ type: HANDLE_ERROR });
          alert(err.message);
          console.log(err.message);
        }
      } else {
        Swal.fire({
          title: 'Vui lòng nhập nội dung!',
          timer: 2000,
          toast: true,
          position: 'bottom-start',
          icon: "info",
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.log('err', err);
    } finally {
      setLoading(false);
    }
  };

  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  // Function to toggle selection
  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses((prevSelectedCourses) => {
      if (prevSelectedCourses.includes(courseId)) {
        // Remove if already selected
        return prevSelectedCourses.filter(id => id !== courseId);
      } else {
        // Add if not selected
        return [...prevSelectedCourses, courseId];
      }
    });
  };
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col py-4 w-full bg-white rounded-3xl shadow-lg">
        <div className="flex items-center border-b-2 border-gray-300 pb-4 pl-4 w-full">
          <Avatar
            size="sm"
            variant="circular"
            src={userData?.image || user?.photoURL || avatar}
            alt="avatar"></Avatar>
          {/* <form className="w-full" onSubmit={handleSubmitPost}> */}
          <div className="flex justify-between items-center">
            <div className="w-full ml-4">
              <input
                type="text"
                name="text"
                placeholder={`Whats on your mind ${user?.displayName?.split(" ")[0] ||
                  userData?.name?.charAt(0).toUpperCase() +
                  userData?.name?.slice(1)
                  }`}
                className="outline-none w-full bg-white rounded-md"
                ref={text}
                onClick={popup}
              ></input>
            </div>
            {/* <div className="mx-4">
              {image && (
                <img
                  className="h-24 rounded-xl"
                  src={image}
                  alt="previewImage"
                ></img>
              )}
            </div> */}
            {/* <div className="mr-4">
                <Button variant="text" type="submit">
                  Share
                </Button>
              </div> */}
          </div>
          {/* </form> */}
        </div>
        {/* <span
          style={{ width: `${progressBar}%` }}
          className="bg-blue-700 py-1 rounded-md"
        ></span> */}
        <div className="flex justify-around items-center pt-4">
          <div className="flex items-center">
            <label
              htmlFor="addImage"
              className="cursor-pointer flex items-center"
            >
              <img className="h-10 mr-4" src={addImage} alt="addImage" onClick={popup}></img>
              {/* <input
                id="addImage"
                type="file"
                style={{ display: "none" }}
                onChange={handleUpload}
              ></input> */}
            </label>
            {/* {file && (
              <Button variant="text" onClick={submitImage}>
                Tải hình ảnh
              </Button>
            )} */}
          </div>
          {userData?.is_teacher && (
            <>
              <div className="flex items-center cursor-pointer" onClick={popup}>
                {/* <img className="h-10 mr-4" src={live} alt="live"></img> */}
                <svg class="h-8 w-8 text-slate-500" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <rect x="4" y="5" width="16" height="16" rx="2" />  <line x1="16" y1="3" x2="16" y2="7" />  <line x1="8" y1="3" x2="8" y2="7" />  <line x1="4" y1="11" x2="20" y2="11" />  <line x1="10" y1="16" x2="14" y2="16" />  <line x1="12" y1="14" x2="12" y2="18" /></svg>
                <p className="font-roboto font-medium text-md text-gray-700 no-underline tracking-normal leading-none ml-2">
                  Lên lịch học
                </p>
              </div>
              <Modal
                openModal={openModal}
                setOpenModal={setOpenModal}
                title="Lên lịch học"
                position="center"
                showFooter={true}

              >
                <div className="flex font-sans">
                  <div className="flex flex-wrap w-full">
                    <div className="w-full">
                      <label class="block text-gray-700 text-sm font-bold mb-2" for="name_course">
                        Tên khóa học
                        <span class="text-red-500 ml-2">*</span>
                      </label>
                      {/* <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name_course" type="text" placeholder="Tên khóa học" required /> */}
                      <Input
                        id="name_course"
                        type="text"
                        label="Tên khóa học"
                        required
                      />
                    </div>
                    <div className="w-full">
                      <label class="block text-gray-700 text-sm font-bold mb-2" for="teacher">
                        Môn học
                        <span class="text-red-500 ml-2">*</span>
                      </label>
                      {/* <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="teacher" type="text" placeholder="Môn học" required /> */}
                      <Select
                        id="teacher"
                        label="Môn học"
                        required
                        isClearable
                        options={userData?.list_course?.map((course: any) => ({ value: course, label: course }))}
                      />

                    </div>
                    <div className="w-full">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="mb-4">
                          <label class="block text-gray-700 text-sm font-bold mb-2" for="teacher">
                            Khoảng thời gian (tuần)
                            <span class="text-red-500 ml-2">*</span>
                          </label>
                          {/* <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="teacher" type="text" placeholder="Môn học" required /> */}
                          <Input
                            id="teacher"
                            type="number"
                            label="Khoảng thời gian"
                            required
                            min={1}
                          />
                        </div>
                        <div className="mb-4">
                          <label class="block text-gray-700 text-sm font-bold mb-2" for="teacher">
                            Số lượng học viên
                            <span class="text-red-500 ml-2">*</span>
                          </label>
                          {/* <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="teacher" type="text" placeholder="Môn học" required /> */}
                          <Input
                            id="teacher"
                            type="number"
                            label="Số lượng học viên"
                            required
                            min={1}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="w-full">
                      <label class="block text-gray-700 text-sm font-bold mb-2" for="teacher">
                        Mô tả khoá học
                        <span class="text-red-500 ml-2">*</span>
                      </label>
                      {/* <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="teacher" type="text" placeholder="Môn học" required /> */}
                      <Textarea
                        id="teacher"
                        label="Mô tả khoá học"
                        required
                      />
                    </div>
                    <div className="w-full">
                      <label class="block text-gray-700 text-sm font-bold mb-2" for="teacher">
                        Tài liệu
                        {/* <span class="text-red-500 ml-2">*</span> */}
                      </label>
                      {/* <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="teacher" type="text" placeholder="Môn học" required /> */}
                      <Input
                        id="teacher"
                        type="file"
                        label="Tài liệu"
                        multiple
                      />
                    </div>
                  </div>
                </div>
              </Modal>
            </>
          )}
          <Modal
            openModal={openModal}
            setOpenModal={setOpenModal}
            title="Tạo bài viết"
            position="center"
            showFooter={false}>
            <form className="w-full" onSubmit={handleSubmitPost}>
              <div className="flex items-center">
                <img class="w-10 h-10 rounded-full" src={userData?.image || user?.photoURL || avatar} alt="Rounded avatar"></img>
                <div className="ml-2 inline-grid">
                  <label>{userData?.name}</label>
                  <div class="relative inline-block text-left">
                    <div className="relative inline-block text-left">
                      <a
                        onClick={toggleDropdown}
                        className="flex bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:text-blue-30 cursor-pointer"
                      >
                        <svg
                          className="h-4 w-4 text-zinc-500 mr-2"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" />
                          <circle cx="12" cy="12" r="9" />
                          <line x1="3.6" y1="9" x2="20.4" y2="9" />
                          <line x1="3.6" y1="15" x2="20.4" y2="15" />
                          <path d="M11.5 3a17 17 0 0 0 0 18" />
                          <path d="M12.5 3a17 17 0 0 1 0 18" />
                        </svg>
                        Công khai
                        <svg class="h-4 w-4 text-gray-500 ml-1" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M18 15l-6-6l-6 6h12" transform="rotate(180 12 12)" /></svg>
                      </a>

                      {isOpen && (
                        <div
                          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                        >
                          <div className="py-1">
                            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                              <svg
                                className="h-4 w-4 text-zinc-500 mr-2"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path stroke="none" d="M0 0h24v24H0z" />
                                <circle cx="12" cy="12" r="9" />
                                <line x1="3.6" y1="9" x2="20.4" y2="9" />
                                <line x1="3.6" y1="15" x2="20.4" y2="15" />
                                <path d="M11.5 3a17 17 0 0 0 0 18" />
                                <path d="M12.5 3a17 17 0 0 1 0 18" />
                              </svg>
                              Công khai
                            </a>
                            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                              <svg class="h-4 w-4 text-gray-500 mr-2" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <circle cx="9" cy="7" r="4" />  <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />  <path d="M16 3.13a4 4 0 0 1 0 7.75" />  <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" /></svg>
                              Bạn bè
                            </a>
                            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                              <svg class="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              Chỉ mình tôi
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    name="text"
                    placeholder={`Whats on your mind ${user?.displayName?.split(" ")[0] ||
                      userData?.name?.charAt(0).toUpperCase() +
                      userData?.name?.slice(1)
                      }`}
                    className="outline-none w-full bg-white rounded-md"
                    ref={textRef}
                  ></input>
                  {/* <textarea
                    name="text"
                    placeholder={`What's on your mind ${user?.displayName?.split(" ")[0] ||
                      userData?.name?.charAt(0).toUpperCase() +
                      userData?.name?.slice(1)
                      }`}
                    className="outline-none w-full bg-white rounded-md resize-none"
                    ref={textRef}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.shiftKey) {
                        e.preventDefault(); // Prevent form submission on Enter
                        const cursorPosition = textRef.current.selectionStart;
                        const text = textRef.current.value;

                        // Insert newline at the current cursor position
                        textRef.current.value =
                          text.slice(0, cursorPosition) + "\n" + text.slice(cursorPosition);

                        // Move the cursor to the next line
                        textRef.current.selectionStart = textRef.current.selectionEnd = cursorPosition + 1;
                      }
                    }}
                  ></textarea> */}

                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="cursor-pointer inline-flex items-center"
                  >
                    <Tooltip content="Emoji" placement="top">
                      <svg
                        className="h-10 w-10 text-gray-500 cursor-pointer"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </Tooltip>
                  </div>

                  {isDropdownOpen && (
                    <div
                      className="origin-top-right absolute right-0 top-[190px] mt-2 w-64 max-h-64 overflow-y-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                    >
                      <div className="p-2 grid grid-cols-6 gap-2">
                        {emojis.map((emoji) => (
                          <a
                            key={emoji.id}
                            onClick={() => handleEmojiClick(emoji.symbol)}
                            className="text-lg cursor-pointer"
                          >
                            {emoji.symbol}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {(isVisible && !isVisibleCourse) && (
                <div
                  className="flex items-center justify-center h-48 mb-4 rounded bg-gray-50 relative cursor-pointer"
                  onClick={handleClick}
                >
                  {upimage ? (
                    <div className="relative w-full h-full ml-[25%]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveClick();
                        }}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                      >
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                      <div className="w-72 h-48 overflow-hidden rounded float-center">
                        <img
                          src={upimage}
                          alt="Uploaded preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-2xl text-gray-400 dark:text-gray-500 ml-5">
                        <svg
                          className="h-8 w-8 text-stone-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </p>
                      <span>Thêm ảnh</span>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

              )}

              {(isVisibleCourse && !isVisible) && (
                <div
                  className="flex items-center justify-center h-48 mb-4 rounded relative cursor-pointer border-solid border-2 border-sky-500 w-auto h-auto"
                // onClick={handleClick}
                >
                  <div className="flow-root w-[100%] max-h-64 overflow-y-auto"> {/* Added max-height and overflow-y */}
                    <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                      {classRoom?.length > 0 &&
                        classRoom.map((val: any, index) => {
                          const isSelected = selectedCourses.includes(val.code); // Check if the course is selected
                          return (
                            <li
                              key={index}
                              onClick={() => toggleCourseSelection(val.code)} // Toggle selection on click
                              className={`py-3 sm:py-4 transition-transform transform hover:-translate-y-1 hover:shadow-lg 
                ${isSelected ? "bg-blue-200 border-blue-500" : ""}`} // Apply styles for selected items
                            >
                              <div className="flex items-center mr-5 ml-5">
                                <div className="flex-shrink-0">
                                  <img
                                    className="w-8 h-8 rounded-full"
                                    src={val.thumbnail || "/default-thumbnail.jpg"}
                                    alt={val.nameRoom || "Classroom Image"}
                                  />
                                </div>
                                <div className="flex-1 min-w-0 ms-4">
                                  <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                                    {val.nameRoom || "Classroom Name"}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                                    Phần {val.part || "Not updated"}
                                  </p>
                                </div>
                                <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                  {val.feeAmount ? `$${val.feeAmount}` : "Free"}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                </div>
              )}
              <div className="mb-2">
                {/* <span
                // style={{ width: `${progressBar}%`, zIndex: 100 }}
                style={{ width: `55%`, zIndex: 100 }}
                className="bg-blue-700 py-1 rounded-md mt-5"
              >abc</span> */}
                {progressBar > 0 && (
                  <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div class="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressBar}%` }}></div>
                  </div>
                )}
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-between border-solid border-2 p-2 border-sky-500 rounded-md ">
                  <div className="flex">Thêm vào bài viết của bạn</div>
                  <div className="flex justify-between">
                    <Tooltip content="Ảnh/Video" placement="top">
                      <img class="h-8 w-8 width-[24px] height-[24px] mr-1 cursor-pointer" alt="" src={images} onClick={() => openAction('image')}></img>
                    </Tooltip>
                    {userData?.role == 'teacher' && (
                      <Tooltip content="Quảng cáo khóa học" placement="top">
                        <img class="h-8 w-8 width-[24px] height-[24px] mr-1 cursor-pointer" alt="" src={cource} onClick={() => openAction('course')}></img>

                      </Tooltip>
                    )}
                    {/* <Tooltip content="Gắn thẻ người khác" placement="top">
                      <img class="h-8 w-8 width-[24px] height-[24px] mr-1 cursor-pointer" alt="" src={friend} onClick={() => setIsVisibleFriend(!isVisible)}></img>
                    </Tooltip> */}
                  </div>
                </div>
              </div>
              <div className="mb-2">
                <button type="submit" class="text-white w-[100%] bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" disabled={loading}>
                  Đăng
                  {loading && (
                    <div role="status" class="inline-flex items-center ml-2">
                      <svg aria-hidden="true" class="inline w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                      </svg>
                      <span class="sr-only">Loading...</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </Modal>
          <div className="flex items-center">
            <img className="h-10 mr-4" src={smile} alt="feeling"></img>
            <p className="font-roboto font-medium text-md text-gray-700 no-underline tracking-normal leading-none">
              Feeling
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col py-4 w-full">
        {state?.error ? (
          <div className="flex justify-center items-center">
            <Alert color="red">
              Something went wrong refresh and try again...
            </Alert>
          </div>
        ) : (
          <div>
            {state?.posts?.length > 0 &&
              state?.posts?.map((post: any, index) => {
                return (
                  <PostCard
                    key={index}
                    logo={post?.logo}
                    id={post?.documentId}
                    uid={post?.uid}
                    name={post?.name}
                    email={post?.email}
                    image={post?.image}
                    text={post?.text}
                    timestamp={formatVietnameseDate(new Date(
                      post?.timestamp?.seconds * 1000)
                    )}
                    ads={post?.ads}
                  ></PostCard>
                );
              })}
          </div>
        )}
      </div>
      <div ref={scrollRef}>{/* refference for later */}</div>
    </div>
  );
};

export default Main;


