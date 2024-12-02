/* eslint-disable react-hooks/rules-of-hooks */
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../AppContext/AppContext";
import { doc, DocumentData, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import Swal from "sweetalert2";

enum UserRole {
  Teacher = "teacher",
  Student = "student",
}

interface TabMemberProps {
  idCollection: string;
}
/* interface PostContent {
  file: string;
  text: string;
  partName: string;
}
interface PostComment {
  comment: string;
  avatar: string;
  craeteAt: string;
  id: string;
  name: string;
  uid: string;
} */

interface Groups {
  email: string;
  name: string;
  uid: string;
  craeteAt: string;
  role: UserRole;
}

/* interface Post {
  id: string;
  groupg: Groups[];
  avatar: string;
  uid: string;
  createdAt: string; // hoặc Date nếu bạn muốn xử lý ngày tháng
  content: PostContent;
  comments: PostComment[];
  name: string;

  email: string;
} */
const TabMembers: React.FC<TabMemberProps> = ({ idCollection }) => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    return null; // or some loading/error state
  }
  const { userData } = authContext;
  const [, setLoading] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);

  const [isShowModal, setShowModal] = useState(false);
  const [formDataDetailClassRoom, setDataDetailClassRoom] =
    useState<DocumentData>([]);

  const [teachers, setTeachers] = useState<Groups[]>([]);
  const [students, setStudents] = useState<Groups[]>([]);
  const [email, setEmail] = useState("");

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (!email.trim()) {
        alert("Vui lòng nhập email!!!"); // Alert if code is empty
        return;
      }
      setLoadingForm(true);
      const to = email; // Declare the variable
      const subject = "Mời tham gia lớp học"; // Declare the variable
      const text = `Mã lớp học là: ${
        formDataDetailClassRoom.code || "Đang cập nhật"
      }`;
      const response = await fetch("http://localhost:3000/invite-user", {
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
      if (result.success) {
        console.log("Invite success");
        setShowModal(false);
        Swal.fire({
          title: "Gửi lời mời thành công",
          icon: "success",
          toast: true,
          position: "top-right",
          timer: 2000,
          showConfirmButton: false,
        });
      }
      setLoadingForm(false);
      console.log("result", result);

      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      Swal.fire({
        title: "Mời thất bại",
        icon: "error",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
      });
      setLoadingForm(false);
      console.error("Error sending email:", error);
    }
  };

  const handleClickAdd = () => {
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false); // Function to close modal
  };
  useEffect(() => {
    console.log("userData:", userData);
  }, [userData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (idCollection) {
          const docRef = doc(db, "classRoom", idCollection);
          const docSnapshot = await getDoc(docRef); // Lấy dữ liệu tài liệu
          const newTeachers: Groups[] = [];
          const newStudents: Groups[] = [];
          if (docSnapshot.exists()) {
            console.log("Fetched tab member:", docSnapshot.data());
            const dataDetail = docSnapshot.data();
            setDataDetailClassRoom(dataDetail);
            dataDetail?.groups.forEach((gr: Groups) => {
              if (gr.role === UserRole.Teacher) {
                newTeachers.push(gr);
              } else if (gr.role === UserRole.Student) {
                newStudents.push(gr);
              }
            });
            setTeachers(newTeachers);
            setStudents(newStudents);
            // setDataMemberClassRoom(dataDetail);
          } else {
            console.log("No such document!");
          }
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);

        console.error("Error fetching classroom data: ", error);
      }
    };
    fetchData();
  }, [idCollection]);

  return (
    <div className="mx-auto max-w-screen-lg px-4 py-8 sm:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-700">Giáo viên</h2>
        </div>
        {/* <div>
          {userData.role === UserRole.Teacher && (
            <div className="flex items-center justify-between">
              <div className="ml-10 space-x-8 lg:ml-40">
                <button className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring hover:bg-blue-700">
                  
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
                      d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div> */}
      </div>
      <hr className="h-px my-2 bg-gray-200 border-0 dark:bg-gray-300" />
      {teachers.map((teacher) => (
        <div key={teacher.email} className="flex items-center">
          <p className=" text-sm">{teacher.name}</p>
          <p className="text-sm ml-8">{teacher.email}</p>
        </div>
      ))}
      <div className="flex items-center justify-between pb-6 mt-8">
        <div>
          <h2 className="font-semibold text-gray-700">Học viên</h2>
          <span className="text-xs text-gray-500">Danh sách học viên</span>
        </div>
        {userData.role === UserRole.Teacher && (
          <div
            onClick={handleClickAdd}
            className="flex items-center justify-between"
          >
            <div className="ml-10 space-x-8 lg:ml-40">
              <button className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring hover:bg-blue-700">
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
                    d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="overflow-y-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-600 text-left text-xs font-semibold uppercase tracking-widest text-white">
                <th className="px-5 py-3">Full Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Created at</th>
              </tr>
            </thead>
            {students.map((student) => (
              <tbody key={student.email} className="text-gray-500">
                <tr>
                  <td className="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                    <div className="flex items-center">
                      <div className="ml-3">
                        <p className="whitespace-no-wrap">{student.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                    <p className="whitespace-no-wrap">{student.email}</p>
                  </td>
                  <td className="border-b border-gray-200 bg-white px-5 py-5 text-sm">
                    <p className="whitespace-no-wrap">
                      {new Date(Date.parse(student.craeteAt)).toLocaleString(
                        "vi-VN",
                        {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",

                          hour12: false, // Đặt thành true nếu bạn muốn giờ 12 tiếng
                        }
                      )}
                    </p>
                  </td>
                </tr>
              </tbody>
            ))}
          </table>
        </div>

        {isShowModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-md shadow-lg p-5 w-100">
              <h2 className="text-lg font-bold mb-4">Mời học viên</h2>
              <form onSubmit={handleInvite}>
                <div className="mb-2   rounded-lg p-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Email
                  </label>

                  <input
                    onChange={(e) => setEmail(e.target.value)}
                    name="email"
                    type="text"
                    className="border border-gray-300 rounded-md p-2 w-96"
                    placeholder="Email"
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={closeModal}
                    type="button"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Huỷ
                  </button>
                  {loadingForm ? (
                    <button
                      disabled
                      type="button"
                      className="py-2.5 px-5 me-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 inline-flex items-center"
                    >
                      <svg
                        aria-hidden="true"
                        role="status"
                        className="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600"
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
                          fill="#1C64F2"
                        />
                      </svg>
                      Loading...
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="bg-blue-500 text-white rounded-md px-4 py-2"
                    >
                      Mời
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center border-t bg-white px-5 py-5 sm:flex-row sm:justify-between">
          <span className="text-xs text-gray-600 sm:text-sm">
            {" "}
            Showing 1 to 5 of 12 Entries{" "}
          </span>
          <div className="mt-2 inline-flex sm:mt-0">
            <button className="mr-2 h-12 w-12 rounded-full border text-sm font-semibold text-gray-600 transition duration-150 hover:bg-gray-100">
              Prev
            </button>
            <button className="h-12 w-12 rounded-full border text-sm font-semibold text-gray-600 transition duration-150 hover:bg-gray-100">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TabMembers;
