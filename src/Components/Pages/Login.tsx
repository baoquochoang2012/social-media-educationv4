import React, { useState, useContext, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
} from "@material-tailwind/react";
import { Input } from "@material-tailwind/react";
import { Button } from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import ClipLoader from "react-spinners/ClipLoader";
import { AuthContext } from "../AppContext/AppContext";
import { auth, onAuthStateChanged } from "../firebase/firebase";
import Swal from "sweetalert2";

const Login = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const authContext = useContext(AuthContext);
  
  if (!authContext) {
    return null;
  }

  const { signInWithGoogle, loginWithEmailAndPassword, userData } = authContext;
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('role',userData?.role);
        if (userData?.role === 'admin') {
          navigate("/auth/dashbroad");  // Redirect to admin dashboard
        } else if (userData?.role === 'user') {
          navigate("/");  // Redirect to the user home page
        }
      } else {
        navigate("/login");
      }
      setLoading(false);
    });
  }, [navigate, userData]);

  const initialValues: { email: string; password: string } = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Required"),
    password: Yup.string()
      .required("Required")
      .min(6, "Must be at least 6 characters long"),
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { email, password } = formik.values;
    setLoading(true);
    if (formik.isValid) {
      try {
        await loginWithEmailAndPassword(email, password);
      } catch (error) {
        Swal.fire({
          title: 'Login failed, please try again!',
          icon: 'error',
          toast: true,
          position: 'top-end',
          timer: 2000,
          showConfirmButton: false,
        });
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      // alert("Check your input fields");
      console.log("123");
      Swal.fire({
        title: "Vui lòng nhập thông tin",
        icon: "error",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const formik = useFormik({ initialValues, validationSchema, handleSubmit });

  return (
    <>
      {loading ? (
        <div className="grid grid-cols-1 justify-items-center items-center h-screen">
          <ClipLoader color="#367fd6" size={150} speedMultiplier={0.5} />
        </div>
      ) : (
        <div className="grid grid-cols-1 h-screen justify-items-center items-center">
          <Card className="w-96">
            <CardHeader
              variant="gradient"
              color="blue"
              className="mb-4 grid h-28 place-items-center"
            >
              <Typography variant="h3" color="white">
                LOGIN
              </Typography>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <Input
                    name="email"
                    type="email"
                    label="Email"
                    size="lg"
                    required
                    {...formik.getFieldProps("email")}
                  />
                </div>
                <div>
                  {formik.touched.email && formik.errors.email && (
                    <Typography variant="small" color="red">
                      {formik.errors.email}
                    </Typography>
                  )}
                </div>
                <div className="mt-4 mb-2">
                  <Input
                    name="password"
                    type="password"
                    label="Password"
                    size="lg"
                    required
                    {...formik.getFieldProps("password")}
                  />
                  <div>
                    {formik.touched.password && formik.errors.password && (
                      <Typography variant="small" color="red">
                        {formik.errors.password}
                      </Typography>
                    )}
                  </div>
                </div>
                <Button
                  variant="gradient"
                  fullWidth
                  className="mb-4"
                  type="submit"
                >
                  Login
                </Button>
              </form>
            </CardBody>
            <CardFooter className="pt-0">
              <Button
                variant="gradient"
                fullWidth
                className="mb-4"
                onClick={signInWithGoogle}
              >
                Sign In with Google
              </Button>
              <Link to="/reset">
                <p className="ml-1 font-bold font-roboto text-sm text-blue-500 text-center ">
                  Reset the password
                </p>
              </Link>
              <div className="mt-6 flex items-center font-roboto text-base justify-center">
                Don't have an account?
                <Link to="/register">
                  <p className="ml-1 font-bold font-roboto text-sm text-blue-500 text-center ">
                    Register
                  </p>
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
};

export default Login;
