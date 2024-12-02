/* eslint-disable react-hooks/rules-of-hooks */
import React, {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AuthContext } from "../../AppContext/AppContext";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import {
  arrayUnion,
  doc,
  DocumentData,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import moment from "moment";
import Swal from "sweetalert2";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
enum UserRole {
  Teacher = "teacher",
  Student = "student",
}
interface Contents {
  dueDate: string;
  file: string;
  partName: string;
  title: string;
}
interface Members {
  email: string;
  name: string;
  uid: string;
  craeteAt: string;
  role: UserRole;
  submitted: boolean;
}
interface Exercise {
  id: string;
  uid: string;
  createdAt: string; // hoặc Date nếu bạn muốn xử lý ngày tháng
  content: Contents;
  members: Members[];

  name: string;
  email: string;
}
interface TabMemberProps {
  idCollection: string;
  formDataClassRoom: DocumentData[];
}
const TabExercise: React.FC<TabMemberProps> = ({
  idCollection,
  formDataClassRoom,
}) => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  if (!authContext) {
    return null; // or some loading/error state
  }
  const { user, userData } = authContext;
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [dueTime, setDueTime] = useState("");
  const [isShowAddExercise, setShowAddExercise] = useState(false);
  const [isLoadingSubmit, setLoadingSubmit] = useState(false);
  const [isToggleDetail, setToggleDetail] = useState<number | null>(null);
  const [openMenus, setOpenMenus] = useState<number | null>(null);
  const [dataContentClassRoom, setDataContentClassRoom] =
    useState<DocumentData>([]);
  const [formDataTextArea, setFormData] = useState({
    title: "",
    description: "",
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const handleInputCommentChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };
  const handleClickMenu = (index: number) => {
    setOpenMenus((prev) => (prev === index ? null : index));
  };
  const handleToggleClick = (index: number) => {
    console.log("index", index);
    setToggleDetail((prev) => (index === prev ? null : index));
  };

  const sendExercise = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const textInput = formDataTextArea.title.trim(); // Get the code from input
    if (!textInput) {
      alert("Vui lòng nhập tiêu đề lớp."); // Alert if code is empty
      return;
    }
    setLoadingSubmit(true);
    try {
      if (idCollection) {
        const newStudents: Members[] = [];
        const classRoomRef = doc(db, "classRoom", idCollection);
        const docSnapshot = await getDoc(classRoomRef);
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

        if (docSnapshot.exists()) {
          console.log("Fetched tab member:", docSnapshot.data());
          const dataDetail = docSnapshot.data();

          dataDetail?.groups.forEach((gr: Members) => {
            if (gr.role === UserRole.Student) {
              newStudents.push({ ...gr, submitted: false });
            }
          });
          // setDataMemberClassRoom(dataDetail);
        } else {
          console.log("No such document!");
        }

        const vietnamTime = moment().tz("Asia/Ho_Chi_Minh").format();
        if (userData != null) {
          await updateDoc(classRoomRef, {
            id: uuidv4(),
            exercise: arrayUnion({
              id: uuidv4(),
              content: {
                title: textInput,
                file: fileUrl || "",
                partName: uploadedFileName,
                dueDate: `${dueDate + " " + dueTime}` || null,
              },
              members: newStudents || [],
              name: user?.displayName || userData.name,
              createdAt: vietnamTime,
              uid: userData?.uid, // Your user ID
              email: userData?.email,
              isActive: true,
            }),
          });
        }
        setLoadingSubmit(false);
        fetchDataContent();
        // Create success
        Swal.fire({
          icon: "success",
          title: "Đã giao bài tập",
          showConfirmButton: false,
          toast: true,
          position: "top-right",
          timer: 2000,
        });
        formDataTextArea.title = "";
        formDataTextArea.description = "";

        setDueDate("");
        setDueTime("");
        setPreviewImage(null);
        setUploadedFileName(null); // Clear the file name when deleting
        setUploadedFile(null);
        setShowAddExercise(false);
      }
    } catch (error) {
      setLoadingSubmit(false);

      console.error("Error fetching form data: ", error);
    }
  };

  const fetchDataContent = useCallback(async () => {
    try {
      if (idCollection) {
        // const newMember: Members[] = [];
        const docRef = doc(db, "classRoom", idCollection);
        const docSnapshot = await getDoc(docRef); // Lấy dữ liệu tài liệu

        if (docSnapshot.exists()) {
          console.log("Fetched data exercise", docSnapshot.data());

          const dataDetail = docSnapshot.data();
          console.log("Fetched data exercise dataDetail", dataDetail.id);

          const sortedPosts = dataDetail.exercise?.sort(
            (a: Exercise, b: Exercise) => {
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            }
          );

          /*  sortedPosts.forEach((exercise: Exercise) => {
            console.log("Exercise ID:", exercise.id);
            if (exercise.members) {
              exercise.members.forEach((mb: Members) => {
                console.log("Member submitted status:", mb.submitted);
                if (mb.submitted) {
                  newMember.push(mb);
                }
              });
            }
          });

          setSubmited(newMember); */

          /*  sortedPosts?.forEach((post) => {
            console.log("Post ID:", post.content.dueDate);
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
  useEffect(() => {
    fetchDataContent();
  }, [fetchDataContent]);
  const handleClickAddExercise = () => {
    setShowAddExercise((prev) => !prev);
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
  const handleButtonClick = () => {
    // Trigger the file input click when the button is clicked
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // xoa file upload
  const handleDeleteClick = () => {
    // Remove the preview image by resetting the state
    setPreviewImage(null);
    setUploadedFileName(null); // Clear the file name when deleting
    setUploadedFile(null);
  };

  const handleClearDate = () => {
    setDueDate(null);
    setDueTime("");
  };
  //delete excercise
  const handleDeleteExercise = async (exerciseId: string) => {
    const classRoomRef = doc(db, "classRoom", idCollection);
    try {
      // Get the classroom document
      const classRoomDoc = await getDoc(classRoomRef);

      if (classRoomDoc.exists()) {
        const classRoomData = classRoomDoc.data();
        // Filter out the exercise with the matching id
        const updatedExercises = classRoomData.exercise.filter(
          (exercise: Exercise) => exercise.id !== exerciseId
        );
        // Update the document with the new array
        await updateDoc(classRoomRef, { exercise: updatedExercises });
        // Show success alert
        Swal.fire({
          icon: "success",
          title: "Xoá bài tập thành công!",
          showConfirmButton: false,
          toast: true,
          position: "top-right",
          timer: 2000,
        });

        // Refresh data
        fetchDataContent();
        setOpenMenus(() => null);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error deleting exercise: ", error);

      // Show error alert
      Swal.fire({
        icon: "error",
        title: "Xoá không thành công!",
        text: "Đã xảy ra lỗi khi xóa bài tập.",
      });
    }
  };
  const handleRedirect = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,

    exercise: Exercise
  ) => {
    e.preventDefault();
    console.log("exercise: ", exercise);
    const customPath: string = `/detail/${idCollection}/detail`;
    navigate(customPath, {
      state: {
        idCollection: idCollection,
        exercise: exercise,
        formDataClassRoom: formDataClassRoom,
      },
    });
  };
  return (
    <div className="mx-auto max-w-screen-lg px-4 py-8 mt-6 sm:px-8">
      {userData.role === UserRole.Teacher && (
        <button
          onClick={handleClickAddExercise}
          type="button"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          {!isShowAddExercise ? (
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
          ) : (
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
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          )}
          <span>{isShowAddExercise ? "Đóng" : "Thêm bài tập"} </span>
        </button>
      )}

      {isShowAddExercise ? (
        <div className="p-4    mx-auto   bg-white rounded-md mt-10 shadow-md">
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">
              Tiêu đề
            </label>
            <input
              type="text"
              onChange={handleInputCommentChange}
              value={formDataTextArea.title}
              name="title"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tiêu đề"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">
              Hướng dẫn (không bắt buộc)
            </label>
            <textarea
              onChange={handleInputCommentChange}
              value={formDataTextArea.description}
              name="description"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Hướng dẫn (không bắt buộc)"
            ></textarea>
            <div className="mb-4 mt-4 flex space-x-2">
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
          </div>
          <hr className="h-px my-2 bg-gray-200 border-0 dark:bg-gray-300" />

          <label className="block text-gray-700 font-semibold mb-1">
            Đính kèm
          </label>
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
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="h-6 w-6 text-gray-600"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
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

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">
              Hạn nộp
            </label>
            <div className="flex items-center space-x-2">
              {dueDate?.trim() && (
                <div className="flex items-center space-x-2 mx-2">
                  <input
                    name="description"
                    type="time"
                    value={dueTime || ""}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setDueTime("")}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none"
                  >
                    {/* Clear Icon (X) for Time */}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>
                </div>
              )}

              <input
                type="date"
                value={dueDate || ""}
                onChange={(e) => setDueDate(e.target.value)}
                className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {dueDate?.trim() && (
                <button
                  onClick={handleClearDate}
                  className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none"
                >
                  {/* Clear Icon (X) */}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              )}
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              {/*   <button className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
            Hủy
          </button> */}
              <button
                disabled={isLoadingSubmit}
                onClick={sendExercise}
                className={`p-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
                  isLoadingSubmit ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoadingSubmit ? <span>Loading...</span> : "Giao bài"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 ">
          {dataContentClassRoom.exercise &&
          dataContentClassRoom.exercise.length > 0 ? (
            dataContentClassRoom.exercise.map(
              (exercise: Exercise, index: number) => (
                <div key={exercise.id} className="space-y-4 border rounded-md ">
                  <div
                    onClick={() => handleToggleClick(index)}
                    className="flex group items-center px-6  p-4 border-b relative  hover:border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-500 rounded-full">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 3a1 1 0 00-1 1v1H2.5A1.5 1.5 0 001 6.5v10A1.5 1.5 0 002.5 18h15a1.5 1.5 0 001.5-1.5v-10A1.5 1.5 0 0017.5 5H16V4a1 1 0 00-1-1H4zm11 2H5V4h10v1zM2 8h16v8H2V8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>

                    <div className="flex-1 ml-4">
                      <p className="font-medium">{exercise.content.title}</p>
                    </div>

                    <div className="text-gray-500 px-2 text-sm">
                      Đã đăng {exercise.content.dueDate}
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClickMenu(index);
                      }}
                      className={`absolute right-2 ml-2 ${
                        openMenus === index
                          ? "block"
                          : "hidden group-hover:block"
                      }`}
                    >
                      <svg
                        className="w-5 h-4"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 4 15"
                      >
                        <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                      </svg>
                      {openMenus === index && (
                        <div
                          ref={dropdownRef}
                          className="z-10  absolute bg-white divide-y divide-gray-100 rounded-lg shadow w-44   dark:divide-gray-600"
                        >
                          <ul className="py-2 text-sm text-black">
                            <li>
                              <a
                                onClick={() =>
                                  handleDeleteExercise(dataContentClassRoom.id)
                                }
                                className="block px-4 py-2 hover:bg-gray-100 hover:text-black"
                              >
                                Xoá
                              </a>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  {isToggleDetail === index && (
                    <div
                      className={`transition-all duration-300 overflow-hidden ${
                        isToggleDetail === index
                          ? "max-h-screen opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      {userData.role === UserRole.Teacher && (
                        <div className="flex justify-around py-4 text-center  text-gray-500">
                          <div>
                            <p className="text-xl font-semibold">
                              {
                                exercise.members.filter(
                                  (member) => member.submitted
                                ).length
                              }
                            </p>
                            <p className="text-sm">Đã nộp</p>
                          </div>
                          <div>
                            <p className="text-xl font-semibold">
                              {exercise.members.length}
                            </p>
                            <p className="text-sm">Đã giao</p>
                          </div>
                        </div>
                      )}
                      {userData.role === UserRole.Student && (
                        <div className="flex justify-between py-4 px-6 text-center  text-gray-500">
                          <div className="text-sm">
                            {exercise.content.dueDate.length == 0
                              ? "Không có ngày đến hạn"
                              : `Đã đăng ${exercise.content.dueDate}`}
                          </div>
                          <div className="text-[#70A87B]">Ðã giao</div>
                        </div>
                      )}
                      <div className="inline-flex items-center border rounded-md ml-4 ">
                        {exercise.content.partName &&
                          (exercise.content.partName.endsWith(".pdf") ||
                          exercise.content.partName.endsWith(".docx") ||
                          exercise.content.partName.endsWith(".xlsx") ? (
                            // Nếu file là PDF, hiển thị liên kết để tải về
                            <a
                              href={exercise.content.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 underline"
                            >
                              {exercise.content.partName}
                            </a>
                          ) : (
                            // Nếu không phải PDF, hiển thị hình ảnh
                            <img
                              src={exercise.content.file}
                              alt="Content"
                              className="h-auto max-w-md border border-gray-300 rounded-md"
                            />
                          ))}
                        {/* <img
                          src={exercise.content.file}
                          alt="Preview"
                          className="object-cover    h-20 w-60 rounded shadow-md"
                        />
                        <div className="text-sm px-2">
                          {exercise.content.partName}
                        </div> */}
                      </div>

                      <div className="py-4 ml-4 ">
                        <a
                          onClick={(e) => handleRedirect(e, exercise)}
                          className="text-blue-500 font-medium cursor-pointer"
                        >
                          Xem hướng dẫn
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )
            )
          ) : (
            <p className="text-gray-500 text-center mt-4">
              Không có bài viết nào.
            </p> // Thông báo nếu không có bài viết
          )}

          {/* Dòng phân cách */}
        </div>
      )}
    </div>
  );
};
export default TabExercise;
