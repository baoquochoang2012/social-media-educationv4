/* eslint-disable react-hooks/rules-of-hooks */
import React, {
  useState,
  useRef,
  ChangeEvent,
  useContext,
  useEffect,
} from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, uploadBytes, ref, getDownloadURL } from "firebase/storage";
import moment from "moment";

import { v4 as uuidv4 } from "uuid";

import { db } from "../../../firebase/firebase";
import { AuthContext } from "../../../AppContext/AppContext";
import Swal from "sweetalert2";

interface HomeworkCardProps {
  dueDate: string | null;
  idCollection: string | null;
}
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
const FormOnSubmit: React.FC<HomeworkCardProps> = ({
  dueDate,
  idCollection,
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [submittedLink, setSubmittedLink] = useState<string>("");
  const [link, setLink] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const authContext = useContext(AuthContext);
  if (!authContext) {
    return null; // or some loading/error state
  }
  const { userData } = authContext;
  // Các hàm xử lý sự kiện

  const handleDeleteClick = () => {
    setPreviewImage(null);
    setUploadedFile(null);
    setSubmittedLink("");
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
    handleCloseMenu();
  };

  const handleLinkClick = () => {
    setLinkDialogOpen(true);
    handleCloseMenu();
  };

  const handleDialogClose = () => {
    setLinkDialogOpen(false);
    setLink("");
  };

  const handleLinkSubmit = () => {
    setSubmittedLink(link);
    setLinkDialogOpen(false);
    setLink("");
  };

  useEffect(() => {
    console.log("Link submit useEffect", submittedLink);
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const submitHomework = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("idCollection", idCollection);
    const vietnamTime = moment().tz("Asia/Ho_Chi_Minh").format();
    /*  const checkUploadFile = uploadedFile?.name; // Get the code from input
    if (!checkUploadFile) {
      alert("Vui lòng nhập mã lớp."); // Alert if code is empty
      return;
    } */

    try {
      if (idCollection) {
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
          const dataDetail = docSnapshot.data();

          const updatedExercises = dataDetail.exercise.map(
            (exercise: Exercise) => {
              if (exercise.members) {
                // Update the members array with the new comment if uid matches
                const updatedMembers = exercise.members.map((mb: Members) => {
                  if (mb.uid === userData.uid) {
                    const newComment = {
                      id: uuidv4(),
                      file: fileUrl || "",
                      link: submittedLink,
                      partName: uploadedFile?.name || "",
                      createdAt: vietnamTime,
                      comment: "",
                    };

                    return {
                      ...mb,
                      submitted: true,
                      newComment,
                    };
                  }
                  return mb;
                });

                return {
                  ...exercise,
                  members: updatedMembers,
                };
              }
              return exercise;
            }
          );

          await updateDoc(classRoomRef, {
            exercise: updatedExercises,
          });
          Swal.fire({
            icon: "success",
            title: "Nộp bài tập thành công!",
            showConfirmButton: false,
            toast: true,
            position: "top-right",
            timer: 2000,
          });
          console.log("  updateExercise!", updatedExercises);
        } else {
          console.log("No such document!");
        }
      }
    } catch (error) {
      console.error("Error fetching form data: ", error);
    }
  };
  return (
    <div className="bg-white w-2/7">
      <Card
        sx={{
          width: "280px",
          boxShadow: 2,
          borderRadius: 1,
          backgroundColor: "#f5f5f5",
        }}
      >
        <CardContent>
          <div className="flex justify-between items-center">
            <Typography variant="h6" color="textPrimary">
              Bài tập của bạn
            </Typography>
            {dueDate && (
              <Typography color="error">
                {new Date(dueDate) < new Date() ? "Quá hạn" : ""}
              </Typography>
            )}
          </div>
          {previewImage ? (
            <div className="col  mt-4 mx-4">
              <div className="mt-4 mb-4  flex z-10 w-max">
                {/* Image */}
                <img
                  src={previewImage}
                  alt="Preview"
                  className="object-cover h-10 w-40 rounded shadow-md"
                />

                <button
                  className="  top-2  right-2 bg-red-500 text-white px-2 py-2 rounded-full shadow"
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
              <p className="text-gray-700">
                <strong>File uploaded:</strong> {uploadedFile?.name}
              </p>
            </div>
          ) : uploadedFile ? (
            <div className="flex items-center space-x-4">
              <p className="text-gray-700">
                <strong>File uploaded:</strong> {uploadedFile?.name}
              </p>
              <button
                className="bg-red-500 text-sm text-white px-2 py-1 rounded shadow"
                onClick={handleDeleteClick}
              >
                Delete
              </button>
            </div>
          ) : null}
          {submittedLink && (
            <div className="mt-4">
              <Typography variant="h6">Preview:</Typography>
              <iframe
                src={submittedLink}
                rel="noopener noreferrer"
                title="Link Preview"
                width="100%"
                height="60px"
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  marginTop: "8px",
                }}
              />
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleDeleteClick}
                sx={{ mt: 1 }}
              >
                Clear Link
              </Button>
            </div>
          )}
          {!uploadedFile && !submittedLink && (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleOpenMenu}
              sx={{ mt: 1 }}
            >
              + Thêm hoặc tạo
            </Button>
          )}

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            transformOrigin={{ vertical: "top", horizontal: "center" }}
            PaperProps={{
              style: {
                width: anchorEl ? anchorEl.clientWidth : undefined, // Set width to match button
              },
            }}
          >
            <MenuItem onClick={handleFileClick}>File</MenuItem>
            <MenuItem onClick={handleLinkClick}>Link</MenuItem>
          </Menu>
          <Dialog open={linkDialogOpen} onClose={handleDialogClose}>
            <DialogTitle>Enter Link</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Link"
                type="url"
                fullWidth
                variant="outlined"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose} color="primary">
                Cancel
              </Button>
              <Button onClick={handleLinkSubmit} color="primary">
                Submit
              </Button>
            </DialogActions>
          </Dialog>

          {/*  <Button
                variant="contained"
                color="inherit"
                fullWidth
                disabled
                sx={{ mt: 2 }}
              >
                Đánh dấu đã hoàn thành
              </Button> */}

          <button
            //  disabled={!uploadedFile || !submittedLink.trim()}
            onClick={submitHomework}
            className={`mt-2 w-full py-2 rounded-lg text-white ${
              previewImage || submittedLink
                ? "bg-blue-500 cursor-pointer"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Nộp bài
          </button>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Work cannot be turned in after the due date
          </Typography>
        </CardContent>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </Card>
    </div>
  );
};
export default FormOnSubmit;
