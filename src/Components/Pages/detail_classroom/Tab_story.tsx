/* eslint-disable react-hooks/rules-of-hooks */
import {
  arrayUnion,
  doc,
  DocumentData,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAppContext } from "../../../AppContext";
import { db } from "../../firebase/firebase";
import { v4 as uuidv4 } from "uuid";
import { getAuth } from "firebase/auth";
import { AuthContext } from "../../AppContext/AppContext";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import Swal from "sweetalert2";
import moment from "moment-timezone";
interface PostContent {
  file: string;
  text: string;
  partName: string;
}
interface PostComment {
  comment: string;
  avatar: string;
  createdAt: string;
  id: string;
  name: string;
  uid: string;
}

interface Post {
  id: string;

  avatar: string;
  uid: string;
  createdAt: string; // hoặc Date nếu bạn muốn xử lý ngày tháng
  content: PostContent;
  comments: PostComment[];
  name: string;

  email: string;
}
interface DetailClassRoomProps {
  dataClassRoom: DocumentData[];
  idCollection: string;
}

const TabStory: React.FC<DetailClassRoomProps> = ({
  dataClassRoom,
  idCollection,
}) => {
  const authContext = useContext(AuthContext);
  const auth = getAuth(); // Initialize Firebase auth
  const currentUser = auth.currentUser; // Get the currently logged-in user
  if (!authContext) {
    return null; // or some loading/error state
  }
  const { user, userData } = authContext;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingPage, setLoadingPage] = useState(false);
  const [idShowAllComment, setShowAllComment] = useState(false);
  const [idShowRating, setShowRating] = useState(false);
  const [idLoadingSubmitRating, setLoadingSubmitRating] = useState(false);

  const [isLoadingComment, setLoadingComment] = useState(false);

  const [userInfo, setUserInfo] = useState<{
    uid: string | null;
    email: string | null;
    urlAvatar: string | null;
  }>({
    uid: null,
    email: null,
    urlAvatar: null,
  });
  const [formDataDetailClassRoom, setDataDetailClassRoom] =
    useState<DocumentData>([]);

  const [dataContentClassRoom, setDataContentClassRoom] =
    useState<DocumentData>([]);
  const { shouldRefreshTabDetail, setShouldRefreshTabDetail } = useAppContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [formDataTextArea, setFormData] = useState({ text: "", comment: "" });
  const [formFormDataRating, setFormDataRating] = useState({
    ratingNote: "Lớp học tuyệt vời",
  });

  const [rating, setRating] = useState(0);
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormDataRating((prevData) => ({ ...prevData, [name]: value }));
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };
  const handleInputCommentChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };
  const toggleComment = () => {
    setShowAllComment((prev) => !prev); // Toggle dropdown visibility
  };

  const handleRating = (value: number) => {
    setRating(value);
  };
  const clickBtnRating = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const classRoomRef = doc(db, "classRoom", idCollection);
    const vietnamTime = moment().tz("Asia/Ho_Chi_Minh").format();
    setLoadingSubmitRating(true);

    try {
      const docSnapshot = await getDoc(classRoomRef);
      const classRoomData = docSnapshot.data();

      // Check if the user is already in the group
      const groupIndex = classRoomData?.groups?.findIndex(
        (group: { uid: string }) => group.uid === userInfo.uid
      );
      if (groupIndex !== -1 && currentUser != null) {
        // Update the specific group's rating
        // eslint-disable-next-line no-unsafe-optional-chaining
        const updatedGroups = [...classRoomData?.groups];
        updatedGroups[groupIndex] = {
          ...updatedGroups[groupIndex],
          rating: {
            id: uuidv4(),
            text: formFormDataRating.ratingNote,
            start: rating,
            createdAt: vietnamTime,
            nameUser: user?.displayName || userData.name,
            uid: userInfo.uid,
          },
        };

        await updateDoc(classRoomRef, {
          groups: updatedGroups,
        });

        setShowRating(false);
        Swal.fire({
          icon: "success",
          title: "Bạn đã gửi đánh giá",
          toast: true,
          position: "top-right",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Bạn không có quyền đánh giá",
          toast: true,
          position: "top-right",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      setLoadingSubmitRating(false);
    } finally {
      setLoadingSubmitRating(false);
    }
  };
  useEffect(() => {
    console.log("Rating", rating);
  });

  useEffect(() => {
    // lấy thông tin user
    // Get the current user's UID from Firebase Auth
    console.log("User is  logged in", currentUser);
    if (currentUser) {
      setUserInfo({
        uid: currentUser.uid,
        email: currentUser.email,
        urlAvatar: currentUser.photoURL,
      });
    } else {
      // Redirect to login or handle unauthenticated state
      console.log("User is not logged in", user);
    }
  }, [auth, currentUser, user]);

  const handleButtonClick = () => {
    // Trigger the file input click when the button is clicked
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File changed", file);
      const fileType = file.type;
      if (fileType.startsWith("image/")) {
        // If it's an image, show the preview
        const fileURL = URL.createObjectURL(file);
        setPreviewImage(fileURL);
        setUploadedFile(file);
      } else {
        setPreviewImage(null); // Clear the image preview
        setUploadedFile(file);
      }

      setUploadedFileName(file.name);
    }
  };
  const handleDropdownItemClick = () => {
    setIsModalOpen((prev) => !prev);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (idCollection) {
          setLoadingPage(true);
          const docRef = doc(db, "classRoom", idCollection);
          const docSnapshot = await getDoc(docRef); // Lấy dữ liệu tài liệu

          if (docSnapshot.exists()) {
            console.log("Fetched classroom detail:", docSnapshot.data());
            const dataDetail = docSnapshot.data();
            setDataDetailClassRoom(dataDetail);
          } else {
            console.log("No such document!");
          }
          setLoadingPage(false);
        }
      } catch (error) {
        setLoadingPage(false);
        console.error("Error fetching classroom data: ", error);
      }
    };
    fetchData();
    if (shouldRefreshTabDetail) {
      // Gọi hàm khi shouldRefreshTabDetail là true
      setShouldRefreshTabDetail(false); // Reset lại trạng thái sau khi fetch xong
    }
  }, [
    dataClassRoom,
    idCollection,
    shouldRefreshTabDetail,
    setShouldRefreshTabDetail,
  ]);
  // Hàm fetchData sẽ lấy dữ liệu mới nhất từ Firestore
  const fetchDataContent = useCallback(async () => {
    try {
      if (idCollection) {
        const docRef = doc(db, "classRoom", idCollection);
        const docSnapshot = await getDoc(docRef); // Lấy dữ liệu tài liệu

        if (docSnapshot.exists()) {
          console.log("Fetched data post", docSnapshot.data());
          const dataDetail = docSnapshot.data();
          const sortedPosts = dataDetail.posts?.sort((a: Post, b: Post) => {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });

          /*   sortedPosts?.forEach((post) => {
            console.log("Post ID:", post.id);
          }); */
          setDataContentClassRoom({ ...dataDetail, posts: sortedPosts });
        } else {
          console.log("No such document!");
        }
      }
    } catch (error) {
      console.error("Error fetching classroom data: ", error);
    }
  }, [idCollection]);

  const handleDeleteClick = () => {
    // Remove the preview image by resetting the state
    setPreviewImage(null);
    setUploadedFileName(null); // Clear the file name when deleting
    setUploadedFile(null);
  };

  const sendPost = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const textInput = formDataTextArea.text.trim(); // Get the code from input
    if (!textInput) {
      alert("Vui lòng nhập mã lớp."); // Alert if code is empty
      return;
    }

    try {
      if (idCollection) {
        const classRoomRef = doc(db, "classRoom", idCollection);
        let fileUrl = "";
        if (uploadedFile) {
          // Initialize Firebase Storage and upload the file
          const storage = getStorage();
          const storageRef = ref(
            storage,
            `posts/classroom/${idCollection}/${uploadedFile.name}`
          );
          const snapshot = await uploadBytes(storageRef, uploadedFile);
          fileUrl = await getDownloadURL(snapshot.ref); // Get the download URL after the upload
        }
        const defaultAvatarUrl =
          "https://cdn3.iconfinder.com/data/icons/business-avatar-1/512/3_avatar-512.png";

        const vietnamTime = moment().tz("Asia/Ho_Chi_Minh").format();
        if (currentUser != null) {
          await updateDoc(classRoomRef, {
            id: uuidv4(),
            posts: arrayUnion({
              id: uuidv4(),
              content: {
                text: textInput,
                file: fileUrl || "",
                partName: uploadedFileName,
              },
              name: user?.displayName || userData.name,
              createdAt: vietnamTime,
              avatar: userInfo?.urlAvatar || defaultAvatarUrl,

              uid: userInfo?.uid, // Your user ID
              email: userInfo?.email, // Your email
              comments: [],
            }),
          });
        }
        await fetchDataContent();
        Swal.fire({
          icon: "success",
          title: "Đăng bài thành công",
          showConfirmButton: false,
          timer: 1500,
        });
        formDataTextArea.text = "";

        setPreviewImage(null);
        setUploadedFileName(null); // Clear the file name when deleting
        setUploadedFile(null);
      }
    } catch (error) {
      console.error("Error fetching form data: ", error);
    }
  };

  const clickAddComment = async (
    e: React.MouseEvent<SVGSVGElement>,
    postId: string
  ) => {
    e.preventDefault();
    const classRoomRef = doc(db, "classRoom", idCollection);
    const vietnamTime = moment().tz("Asia/Ho_Chi_Minh").format();
    const defaultAvatarUrl =
      "https://cdn3.iconfinder.com/data/icons/business-avatar-1/512/3_avatar-512.png";

    try {
      // Lấy dữ liệu hiện tại của lớp học
      const classRoomSnap = await getDoc(classRoomRef);
      const classRoomData = classRoomSnap.data();

      if (idCollection) {
        setLoadingComment(true);
        const updatedPosts = classRoomData?.posts.map((post: Post) => {
          if (post.id === postId) {
            // Tạo mảng bình luận mới bao gồm bình luận cũ và bình luận mới
            const newComment = {
              id: uuidv4(),
              name: user?.displayName || userData.name,
              createdAt: vietnamTime,
              avatar: userInfo?.urlAvatar || defaultAvatarUrl,
              uid: userInfo?.uid,
              comment: formDataTextArea.comment,
            };

            // Tạo mảng bình luận mới
            const updatedComments = [...post.comments, newComment];

            // Trả về bài đăng đã cập nhật
            return {
              ...post,
              comments: updatedComments,
            };
          }
          return post;
        });

        // Cập nhật lại posts trong Firestore
        await updateDoc(classRoomRef, {
          posts: updatedPosts,
        });
        formDataTextArea.comment = "";
        await fetchDataContent();
        setLoadingComment(false);
      }
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  useEffect(() => {
    fetchDataContent();
  }, [fetchDataContent]);

  useEffect(() => {}, [shouldRefreshTabDetail, setShouldRefreshTabDetail]);

  return (
    <div>
      {isLoadingPage ? (
        <div className="flex justify-center  h-screen items-center ">
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
      ) : (
        <div className="container mx-auto">
          <div className="relative bg-[#243642] text-white p-16   top-14 rounded-lg shadow-sm opacity-1  ">
            {/* <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://link-to-your-background-image')`,
                  }}
                >
                  <div className="absolute inset-0  opacity-30"></div>
                </div> */}
            <div className="relative   flex justify-between items-center">
              {/* Class Info */}
              <div>
                <h1 className="text-3xl font-semibold">
                  {formDataDetailClassRoom.nameRoom}
                </h1>
                <p className="text-xl">{formDataDetailClassRoom.part}</p>
              </div>
              {/* Edit Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowRating(true);
                }}
                className="bg-white text-gray-700 px-4 py-2 rounded shadow"
              >
                Đánh giá
              </button>
              {idShowRating && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                  <form onSubmit={clickBtnRating}>
                    <div className="  bg-gray-300 py-6 flex flex-col justify-center sm:py-12">
                      <div className="px-12   py-5">
                        <h2 className="text-gray-800 text-3xl font-semibold">
                          Your opinion matters to us!
                        </h2>
                      </div>
                      <div className="bg-gray-200 w-full flex flex-col items-center">
                        <div className="flex flex-col items-center py-6 space-y-3">
                          <span className="text-lg text-gray-800">
                            How was quality of the call?
                          </span>
                          <div className="flex space-x-3">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <svg
                                key={value}
                                onClick={() => handleRating(value)}
                                className={`w-12 h-12 cursor-pointer ${
                                  value <= rating
                                    ? "text-yellow-500"
                                    : "text-gray-500"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <div className="w-3/4 flex flex-col">
                          <textarea
                            value={formFormDataRating.ratingNote}
                            name="ratingNote"
                            onChange={handleInputChange}
                            className="p-4 text-gray-500 rounded-xl resize-none"
                          ></textarea>
                          <button
                            disabled={idLoadingSubmitRating}
                            type="submit"
                            className="py-3 my-8 text-lg bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl text-white"
                          >
                            {idLoadingSubmitRating ? (
                              <span>Loading...</span>
                            ) : (
                              "Đánh giá"
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="h-20 flex items-center justify-center">
                        <a
                          onClick={(e) => {
                            e.preventDefault();
                            setShowRating(false);
                          }}
                          className="text-gray-600 cursor-pointer"
                        >
                          Lần sau
                        </a>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-4 mt-20">
            <div className="bg-white   shadow-md rounded p-2 w-1/6 h-16  ring-1  ring-gray-300 dark:ring-gray-300">
              <p className="text-gray-600">Mã lớp</p>
              <p className="text-blue-600 text-xl font-semibold">
                {" "}
                {formDataDetailClassRoom.code}
              </p>
            </div>
            <div className="w-5/6">
              {isModalOpen ? (
                <div className="  bg-white p-6 rounded-lg shadow-lg">
                  <div className="mb-4 flex justify-between items-center">
                    <div className="text-gray-700">
                      <a className="text-blue-500">Tất cả học viên</a>
                    </div>
                  </div>

                  <div className="mb-4">
                    <textarea
                      onChange={handleInputChange}
                      value={formDataTextArea.text}
                      name="text"
                      className="w-full p-2 border rounded-md h-24 text-gray-700"
                      placeholder="Thông báo nội dung nào đó cho lớp học của bạn"
                    ></textarea>
                  </div>

                  <div className="mb-4 flex space-x-2">
                    <button className="p-2 bg-gray-100 rounded hover:bg-gray-200">
                      <strong>B</strong>
                    </button>
                    <button className="p-2 bg-gray-100 rounded hover:bg-gray-200">
                      <em>I</em>
                    </button>
                    <button className="p-2 bg-gray-100 rounded hover:bg-gray-200">
                      <u>U</u>
                    </button>
                    <button className="p-2 bg-gray-100 rounded hover:bg-gray-200">
                      <div className="w-4 h-4 flex items-center justify-center">
                        ☰
                      </div>
                    </button>
                    <button className="p-2 bg-gray-100 rounded hover:bg-gray-200">
                      <span>𝑥</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-4 mb-4">
                    <button className="p-2 bg-gray-100 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                    <button className="p-2 bg-gray-100 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15 10l4.553-4.553a1 1 0 00-1.414-1.414L10 8.586 7.061 5.646a1 1 0 00-1.415 1.415L8.586 10l-4.553 4.554a1 1 0 101.414 1.414L10 11.414l4.554 4.553a1 1 0 001.414-1.414L11.414 10z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={handleButtonClick}
                      className="p-2 bg-gray-100 rounded-full"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M3 7h8l2 2h8v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                        />
                      </svg>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }} // Hide the input element
                      onChange={handleFileChange} // Handle file selection
                    />
                    {uploadedFileName && (
                      <p className="text-gray-700">{uploadedFileName}</p>
                    )}
                  </div>
                  {previewImage ? (
                    <div className="mt-4 mb-4 relative z-10 w-max">
                      {/* Image */}
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="object-cover h-20 w-96 rounded shadow-md"
                      />

                      {/* Delete button positioned on top of the image */}

                      <button
                        className="absolute top-2  right-2 bg-red-500 text-white px-2 py-2 rounded-full shadow"
                        onClick={handleDeleteClick}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : uploadedFile ? (
                    <div className="mt-4">
                      {/* Show file name if it's not an image */}
                      <div className="flex items-center space-x-4">
                        <p className="text-gray-700">
                          <strong>File uploaded:</strong> {uploadedFile.name}
                        </p>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded shadow"
                          onClick={handleDeleteClick}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : null}
                  <div
                    className="flex justify-end space-x-4"
                    onClick={handleDropdownItemClick}
                  >
                    <button className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                      Hủy
                    </button>
                    <button
                      onClick={sendPost}
                      disabled={!formDataTextArea.text.trim}
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Đăng
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={handleDropdownItemClick}
                  className="flex-1 cursor-pointer"
                >
                  <div className="bg-white shadow-xl ring-1 ring-gray-300 dark:ring-gray-300 rounded p-3">
                    <div className="flex items-center space-x-4">
                      <img
                        src={
                          userInfo?.urlAvatar ||
                          "https://cdn3.iconfinder.com/data/icons/business-avatar-1/512/3_avatar-512.png"
                        }
                        alt="avatar"
                        className="w-10 h-10 rounded-full"
                      />
                      <p className="hover:text-gray-800 text-gray-500 ">
                        Thông báo nội dung nào đó cho lớp học của bạn
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {dataContentClassRoom.posts &&
              dataContentClassRoom.posts.length > 0 ? (
                dataContentClassRoom.posts.map((post: Post, index: number) => (
                  <div
                    key={index}
                    className="border border-gray-300   rounded-lg mt-4 mx-auto bg-gray-10"
                  >
                    <div className=" px-4 py-2 flex items-center">
                      <img
                        src={post.avatar}
                        alt="User profile"
                        className="rounded-full h-10 w-10 object-cover"
                      />
                      <div className="ml-3">
                        <p className="font-semibold">{post.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleString("vi-VN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false, // Đặt thành true nếu bạn muốn giờ 12 tiếng
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white  px-4 ">
                      <p className="text-gray-800 mb-4">{post.content.text}</p>

                      {post.content.file &&
                        (post.content.partName.endsWith(".pdf") ||
                        post.content.partName.endsWith(".docx") ||
                        post.content.partName.endsWith(".xlsx") ? (
                          // Nếu file là PDF, hiển thị liên kết để tải về
                          <a
                            href={post.content.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline"
                          >
                            {post.content.partName}
                          </a>
                        ) : (
                          // Nếu không phải PDF, hiển thị hình ảnh
                          <img
                            src={post.content.file}
                            alt="Content"
                            className="h-auto max-w-md border border-gray-300 rounded-md"
                          />
                        ))}

                      <p className="text-xs text-gray-500 mt-2">
                        {post.content.partName}
                      </p>
                    </div>
                    <hr className="h-px my-2 bg-gray-200 border-0 dark:bg-gray-300" />

                    <div className=" px-4 py-3">
                      {post.comments.length > 0 && (
                        <div
                          onClick={toggleComment}
                          className="inline-flex cursor-pointer hover:bg-gray-100 p-2 rounded items-center"
                        >
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
                              d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                            />
                          </svg>

                          <p className="ml-2">
                            {post.comments.length} nhan xet
                          </p>
                        </div>
                      )}

                      <div className="space-y-4 mt-2">
                        {post.comments &&
                          post.comments.length > 0 &&
                          (idShowAllComment
                            ? post.comments
                            : [post.comments[post.comments.length - 1]]
                          ).map((cmt) => (
                            <div
                              key={cmt.id}
                              className="flex   items-center space-x-2"
                            >
                              <img
                                src={
                                  userInfo?.urlAvatar ||
                                  "https://cdn3.iconfinder.com/data/icons/business-avatar-1/512/3_avatar-512.png"
                                }
                                alt="Avatar"
                                className="w-8 h-8 rounded-full"
                              />
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-gray-800">
                                    {cmt.name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(cmt.createdAt).toLocaleString(
                                      "vi-VN",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false, // Đặt thành true nếu bạn muốn giờ 12 tiếng
                                      }
                                    )}
                                  </span>
                                </div>
                                <p className="text-gray-800">{cmt.comment}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="ml-1 p-3">
                      <div className="flex items-center ">
                        <img
                          src={
                            userInfo?.urlAvatar ||
                            "https://cdn3.iconfinder.com/data/icons/business-avatar-1/512/3_avatar-512.png"
                          }
                          alt="avatar"
                          className="w-8 h-8 rounded-full"
                        />
                        <input
                          type="text"
                          onChange={handleInputCommentChange}
                          value={formDataTextArea.comment}
                          name="comment"
                          placeholder="Thêm nhận xét trong lớp học..."
                          className="placeholder:text-sm ml-3 w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />{" "}
                        {isLoadingComment ? (
                          <div role="status">
                            <svg
                              aria-hidden="true"
                              className="inline ml-3 w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
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
                        ) : (
                          <svg
                            onClick={(e) => clickAddComment(e, post.id)}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            className="size-6 ml-3 cursor-pointer"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center mt-4">
                  Không có bài viết nào.
                </p> // Thông báo nếu không có bài viết
              )}
            </div>
          </div>
          {/* ---------- */}
        </div>
      )}
    </div>
  );
};
export default TabStory;
