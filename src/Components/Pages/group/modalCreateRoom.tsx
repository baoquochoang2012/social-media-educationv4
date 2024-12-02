import { getRandomColor } from "../../../utils/func_random_color";
import { getRandomImage } from "../../../utils/func_random_img";
import { generateRandomCode } from "../../../utils/function_random_code";
import { addDoc, arrayUnion, collection } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import Swal from "sweetalert2";
import { ChangeEvent, useContext, useState } from "react";
import { useAppContext } from "../../../AppContext";
import moment from "moment-timezone";
import { AuthContext } from "../../AppContext/AppContext";
interface ModalProps {
  userInfo: { uid: string | null; email: string | null };
  isOpen: boolean;
  closeModal: () => void;
}

const ModalCreateRoom = ({ userInfo, isOpen, closeModal }: ModalProps) => {
  // Always declare hooks at the top level

  const [internalLoading, setInternalLoading] = useState(false);
  const { setShouldRefresh } = useAppContext(); // Sử dụng context
  const [formData, setFormData] = useState({
    name: "",
    description: "",

    part: "",
    isFeeRequired: false,
    feeAmount: "",
  });
  const authContext = useContext(AuthContext);
  if (!authContext) {
    return null; // or some loading/error state
  }
  const formatCurrency = (value: string) => {
    const numberValue = parseInt(value.replace(/[^0-9]/g, ""));
    if (isNaN(numberValue)) return "";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numberValue);
  };
  const { user, userData } = authContext;
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.isFeeRequired && !formData.feeAmount.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Số tiền học phí không được bỏ trống",
        text: "Vui lòng nhập số tiền học phí.",
        toast: true,
        position: "top-right",
        timer: 2500,
        showConfirmButton: false,
      });
      return;
    }
    const randomColor = getRandomColor();
    const randomThumbnail = getRandomImage();
    const randomCode = generateRandomCode();
    const vietnamTime = moment().tz("Asia/Ho_Chi_Minh").format();

    try {
      setInternalLoading(true);
      // Add form data to Firestore
      const classRoomRef = await addDoc(collection(db, "classRoom"), {
        nameRoom: formData.name,
        description: formData.description,

        part: formData.part,
        uid: userInfo.uid, // User's UID
        thumbnail: randomThumbnail,
        color: randomColor,
        email: userInfo.email,
        code: randomCode,
        isFeeRequired: formData.isFeeRequired,
        feeAmount: formData.isFeeRequired ? formData.feeAmount : null,
        groups: arrayUnion({
          uid: userInfo.uid,
          email: userInfo.email,
          craeteAt: vietnamTime, // Your email
          name: user?.displayName || userData.name, // Your email
          role: userData.role,
        }),
        timestamp: new Date(),
      });
      console.log("Document written with ID: ", classRoomRef.id);

      // Success handling
      closeModal(); // Close modal after success

      Swal.fire({
        title: "Tạo lớp học thành công",
        icon: "success",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });

      setShouldRefresh(true);
    } catch (error) {
      console.error("Error adding document: ", error);
      Swal.fire({
        icon: "error",
        title: "Đã xảy ra lỗi",
        text: "Không thể tạo lớp học.",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setInternalLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (name === "feeAmount") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: formatCurrency(value),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-md shadow-lg p-6 w-96">
        <h2 className="text-lg font-bold mb-4">Tạo lớp học</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Tên lớp học
            </label>
            <input
              onChange={handleInputChange}
              value={formData.name}
              name="name"
              type="text"
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Tên lớp học (bắt buộc)"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Mô tả lớp học
            </label>

            <textarea
              value={formData.description}
              name="description"
              onChange={handleInputChange}
              placeholder="Mô tả"
              className="border border-gray-300 rounded-md p-2 w-full"
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Phần
            </label>
            <input
              onChange={handleInputChange}
              value={formData.part}
              name="part"
              type="text"
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Phần"
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center text-gray-700 text-sm font-bold mb-2">
              <input
                type="checkbox"
                name="isFeeRequired"
                checked={formData.isFeeRequired}
                onChange={handleInputChange}
                className="mr-2"
              />
              Khoá học có đóng học phí
            </label>
          </div>
          {formData.isFeeRequired && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Số tiền học phí
              </label>
              <input
                onChange={handleInputChange}
                value={formData.feeAmount}
                name="feeAmount"
                type="text"
                className="border border-gray-300 rounded-md p-2 w-full"
                placeholder="Nhập số tiền học phí"
              />
            </div>
          )}
          <div className="flex justify-between">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900"
              onClick={closeModal}
            >
              Huỷ
            </button>
            <button
              disabled={!formData.name.trim() || internalLoading}
              type="submit"
              className={`bg-blue-500 text-white rounded-md px-4 py-2 ${
                !formData.name.trim() ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {internalLoading ? <span>Loading...</span> : "Tạo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCreateRoom;
