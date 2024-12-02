import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import Swal from "sweetalert2";
import { ChangeEvent, useContext, useState } from "react";
import { useAppContext } from "../../../AppContext";
import moment from "moment";
import { AuthContext } from "../../AppContext/AppContext";

interface Groups {
  email: string;
  name: string;
  uid: string;
  craeteAt: string;
  role: string;
}
interface ClassRoom {
  id: string;
  code?: string;
  groups: Groups[];
}
interface ModalProps {
  userInfo: { uid: string | null; email: string | null };
  isOpen: boolean;
  closeModal: () => void;
}

const ModalJoinRoom = ({ userInfo, isOpen, closeModal }: ModalProps) => {
  const [formDataJoinRoom, setFormDataJoinRoom] = useState({ code: "" });
  const { setShouldRefresh } = useAppContext(); // Sử dụng context
  const [loading, setLoading] = useState(false); // New state for loading
  const authContext = useContext(AuthContext);
  if (!authContext) {
    return null; // or some loading/error state
  }
  const { user, userData } = authContext;
  const fetchDataCheckJoinClassRoom = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setLoading(true);
    const code = formDataJoinRoom.code.trim(); // Get the code from input
    if (!code) {
      alert("Vui lòng nhập mã lớp."); // Alert if code is empty
      return;
    }

    try {
      // Fetch all documents from the classRoom collection
      const classRoomsCollectionRef = collection(db, "classRoom");
      const classRoomSnapshot = await getDocs(classRoomsCollectionRef);

      let foundClassRoom: ClassRoom | null = null;
      const vietnamTime = moment().tz("Asia/Ho_Chi_Minh").format();
      // Iterate through each document to find the matching code
      classRoomSnapshot.forEach((doc) => {
        const classRoomData = doc.data();

        if (classRoomData.code === code) {
          foundClassRoom = {
            id: doc.id,
            groups: classRoomData.groups ? classRoomData.groups : [],
          };
        }
      });

      if (foundClassRoom) {
        const userAlreadyInGroup = foundClassRoom?.groups?.some(
          (group: { uid: string | null }) => group.uid === userInfo.uid
        );
        if (userAlreadyInGroup) {
          Swal.fire({
            icon: "info",
            title: "Bạn đã tham gia lớp này trước đó!",
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            position: "top-right",
          });
          closeModal();
          setLoading(false);

          return;
        }

        const classRoomRef = doc(db, "classRoom", foundClassRoom.id);

        await updateDoc(classRoomRef, {
          groups: arrayUnion({
            uid: userInfo.uid,
            email: userInfo.email,
            craeteAt: vietnamTime,
            name: user?.displayName || userData.name,
            role: userData.role,
          }),
        });
        setLoading(false);

        Swal.fire({
          icon: "success",
          title: "Tham gia lớp học thành công!",
          showConfirmButton: false,
          timer: 1500,
          toast: true,
          position: "top-right",
        });

        closeModal();
        setShouldRefresh(true);
      } else {
        setLoading(false);

        Swal.fire({
          icon: "error",
          title: "Mã lớp không hợp lệ!",
          text: "Vui lòng kiểm tra lại mã lớp bạn đã nhập.",
        });
      }
    } catch (error) {
      setLoading(false);

      console.error("Error fetching form data: ", error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormDataJoinRoom((prevData) => ({ ...prevData, [name]: value }));
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-md shadow-lg p-7 w-100">
        <h2 className="text-lg font-bold mb-4">Tham gia lớp học</h2>
        <form onSubmit={fetchDataCheckJoinClassRoom}>
          <div className="mb-4 border border-gray-200 rounded-lg p-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Mã lớp
            </label>
            <p className="text-xs mb-2">
              Đề nghị giáo viên của bạn cung cấp mã lớp rồi nhập mã đó vào đây.
            </p>
            <input
              onChange={handleInputChange}
              value={formDataJoinRoom.code}
              name="code"
              type="text"
              className="border border-gray-300 rounded-md p-2 w-50"
              placeholder="Mã lớp"
            />
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900"
              onClick={closeModal} // Close modal on cancel
            >
              Huỷ
            </button>
            {loading ? (
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
                disabled={!formDataJoinRoom.code.trim()}
                type="submit"
                className={`bg-blue-500 text-white rounded-md px-4 py-2 ${
                  !formDataJoinRoom.code.trim()
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                Tham gia
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalJoinRoom;
