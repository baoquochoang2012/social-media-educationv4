// LeftSidebar.tsx
import { DocumentData } from "firebase/firestore";
import React from "react";
import { useAppContext } from "../../../AppContext";
import { useNavigate } from "react-router-dom";

interface LeftSidebarProps {
  dataClassRoom: DocumentData[];
  dataUser: DocumentData;
}
const LeftSidebar: React.FC<LeftSidebarProps> = ({
  dataClassRoom,
  dataUser,
}) => {
  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate("/group"); // Replace with your target route
    setNameRoom("");
  };
  /// Redirect to Detail page
  const {
    setShouldRefreshTabDetail,
    nameRoom,
    idRoom,
    setNameRoom,
    setIdRoom,
  } = useAppContext();

  const handleRedirect = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    id: string,
    nameRoom: string
  ) => {
    e.preventDefault();

    console.log("nameRoom:", nameRoom);
    console.log("id:", id);

    const customPath: string = `/detail/${id}`;
    setShouldRefreshTabDetail(true);
    setNameRoom(nameRoom);
    setIdRoom(id);

    navigate(customPath, {
      state: { formDataClassRoom: dataClassRoom, dataUser: dataUser, id: id },
    });
  };

  return (
    <div className="w-80 p-4 mt-9 flex flex-col h-screen bg-white pb-4 border-r shadow-lg">
      <div className="flex flex-col pt-6">
        {/* <p className="font-roboto font-bold text-lg no-underline tracking-normal leading-none">
          Lớp học {`${nameRoom.length == 0 ? "" : ` > ${nameRoom}`}`}
        </p> */}

        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
            <li className="inline-flex items-center">
              <a
                onClick={handleNavigate}
                href="#"
                className="inline-flex items-center text-base font-medium text-gray-700 hover:text-blue-600 hover:underline"
              >
                <svg
                  className="w-3 h-3 me-2.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                </svg>
                Home
              </a>
            </li>

            {nameRoom && (
              <li>
                <div
                  onClick={(e) => handleRedirect(e, idRoom, nameRoom)}
                  className="flex items-center"
                >
                  <svg
                    className="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 6 10"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="m1 9 4-4-4-4"
                    />
                  </svg>
                  <a className="ms-1 text-base font-medium text-gray-700 hover:text-blue-600 md:ms-2 hover:text-blue-600 hover:underline">
                    {nameRoom}
                  </a>
                </div>
              </li>
            )}
          </ol>
        </nav>
      </div>

      <div className="mt-4">
        <div className="flex items-center hover:bg-gray-100 cursor-pointer p-2 rounded">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
          <div className="pl-2 cursor-pointer flex font-bold text-sm no-underline tracking-normal leading-none hover:bg-gray-50 focus:ring-4 duration-500 ease-in-out hover:text-blue-500 rounded">
            <p>{dataUser?.role === "student" ? "Đã đăng ký" : "Giảng dạy"}</p>
          </div>
        </div>
      </div>

      {dataClassRoom.map((room, index) => (
        <div
          onClick={(e) => handleRedirect(e, room.id, room.nameRoom)}
          className="space-y-2"
          key={index}
        >
          <div className="flex items-center space-x-3 hover:bg-gray-100 cursor-pointer p-2 rounded">
            <div
              style={{ backgroundColor: room.color }}
              className="w-8 h-8 p-3 rounded-full bg-black text-white flex items-center justify-center font-bold"
            >
              {room.nameRoom.charAt(0)}
            </div>
            <div className="flex flex-col max-w-full pr-8">
              <span className="font-semibold text-sm text-gray-900 truncate overflow-hidden whitespace-nowrap">
                {room.nameRoom}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeftSidebar;
