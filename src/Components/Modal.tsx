import React from "react";
import { Tooltip } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@material-tailwind/react";
import avatar from "../../assets/images/avatar.jpg";

interface ModalProps {
    openModal: boolean;
    setOpenModal: (open: boolean) => void;
    title: string;
    showFooter?: boolean;
    children: React.ReactNode;
    position?: "center" | "left";
}

const Modal: React.FC<ModalProps> = ({ openModal, setOpenModal, title, showFooter, children, position = "center" }) => {
    return (
        <>
            <button
                data-modal-target="default-modal"
                data-modal-toggle="default-modal"
                className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 hidden"
                type="button"
                onClick={() => setOpenModal(!openModal)}
            >
                {title}
            </button>

            {/* Modal */}
            {openModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
                    <div
                        id="default-modal"
                        tabIndex="-1"
                        aria-hidden={!openModal}
                        className="relative p-4 w-full max-w-2xl max-h-full z-50"
                    >
                        <div className="relative bg-white rounded-lg shadow light:bg-gray-50">
                            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                                <h3 className={`${position === "center" ? "text-center" : "text-left"} text-xl font-semibold text-gray-900 dark:text-dark-900`}>
                                    {title}
                                </h3>
                                <button
                                    type="button"
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                    data-modal-hide="default-modal"
                                    onClick={() => setOpenModal(false)}
                                >
                                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>

                            {/* Modal body */}
                            <div className="p-4 md:p-5 space-y-4">
                                {children}
                            </div>

                            {/* Modal footer */}
                            {showFooter && (
                                <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                                    <button
                                        data-modal-hide="default-modal"
                                        type="button"
                                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                        onClick={() => setOpenModal(false)}
                                    >
                                        I accept
                                    </button>
                                    <button
                                        data-modal-hide="default-modal"
                                        type="button"
                                        className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                                        onClick={() => setOpenModal(false)}
                                    >
                                        Decline
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Modal;
