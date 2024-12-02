import React, { useState, ChangeEvent } from "react";
import { Input } from "@material-tailwind/react";
import { Button } from "@material-tailwind/react";
import { Typography } from "@material-tailwind/react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebase";
import Swal from "sweetalert2";
const Reset: React.FC = () => {
  const [email, setEmail] = useState<string>("");

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      Swal.fire({
        title: "Success",
        text: "Password reset email sent!",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: (error as Error).message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 justify-items-center items-center h-screen">
      <div className="w-96">
        <Typography variant="h6" color="blue-gray" className="pb-4">
          Enter the email address associated with your account and we'll send
          you a link to reset your password
        </Typography>
        <Input
          name="email"
          type="email"
          label="Email"
          value={email}
          onChange={handleEmailChange}
        />
        <Button variant="gradient" fullWidth className="mt-4" onClick={handlePasswordReset}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default Reset;
