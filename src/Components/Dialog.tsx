import React from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  IconButton,
} from "@material-tailwind/react";

interface DialogProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  handleOpen: (value: any) => void;
  title: string;
  content: React.ReactNode;
  showFooter?: boolean;
  confirm?: () => void;
  cancel?: () => void;
}

const CustomDialog: React.FC<DialogProps> = ({
  size = "md",
  handleOpen,
  title,
  content,
  showFooter = true,
  confirm,
  cancel,
}) => {
  return (
    <Dialog
      open={["xs", "sm", "md", "lg", "xl", "xxl"].includes(size)}
      size={size}
      handler={handleOpen}
      
    >
      <DialogHeader>
        <div className="flex items-center justify-between w-full">
        {title}
        <IconButton
            color="blue-gray"
            size="sm"
            variant="text"
            // onClick={() => handleOpen(null)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </IconButton>
        </div>
      </DialogHeader>
      <DialogBody>{content}</DialogBody>
      {showFooter && (
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => {
              handleOpen(null);
              if (cancel) cancel();
            }}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
          <Button
            variant="gradient"
            color="green"
            onClick={() => {
              handleOpen(null);
              if (confirm) confirm();
            }}
          >
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      )}
    </Dialog>
  );
};

export default CustomDialog;