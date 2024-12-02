import React, { useEffect } from "react";
import Swal from "sweetalert2";

interface NotificationProps {
  title: string;
  text: string;
  icon: "success" | "error" | "warning" | "info" | "question";
  showCancelButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  toast?: boolean;
}

const Notification: React.FC<NotificationProps> = ({
  title,
  text,
  icon,
  showCancelButton = false,
  confirmButtonText = "OK",
  cancelButtonText = "Cancel",
  toast = false,
}) => {
  useEffect(() => {
    Swal.fire({
      title,
      text,
      icon,
      showCancelButton,
      confirmButtonText,
      cancelButtonText,
      toast,
    });
  }, [title, text, icon, showCancelButton, confirmButtonText, cancelButtonText, toast]);

  return null;
};

export default Notification;
