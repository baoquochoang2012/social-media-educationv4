import React, { createContext, useState, useEffect, ReactNode } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, db, onAuthStateChanged } from "../firebase/firebase";
import {
  query,
  where,
  collection,
  getDocs,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { StreamChat } from 'stream-chat';


interface AuthContextType {
  signInWithGoogle: () => Promise<void>;
  loginWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  registerWithEmailAndPassword: (name: string, email: string, password: string) => Promise<void>;
  sendPasswordToUser: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  user: FirebaseUser | null;
  userData: any;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AppContextProps {
  children: ReactNode;
}

const AppContext = ({ children }: AppContextProps) => {
  const collectionUsersRef = collection(db, "users");
  const provider = new GoogleAuthProvider();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    try {
      const popup = await signInWithPopup(auth, provider);
      const user = popup.user;
      const q = query(collectionUsersRef, where("uid", "==", user.uid));
      const docs = await getDocs(q);
      if (docs.docs.length === 0) {
        await addDoc(collectionUsersRef, {
          uid: user?.uid,
          name: user?.displayName,
          email: user?.email,
          image: user?.photoURL,
          authProvider: popup?.providerId,
        });
      }
    } catch (err: any) {
      alert(err.message);
      console.log(err.message);
    }
  };

  const loginWithEmailAndPassword = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      Swal.fire({
        title: 'Sai tài khoản hoặc mật khẩu',
        icon:'error',
        toast: true,
        position: 'top-end',
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const registerWithEmailAndPassword = async (name: string, email: string, password: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;
      await addDoc(collectionUsersRef, {
        uid: user.uid,
        name,
        providerId: "email/password",
        email: user.email,
        role: "student",
      });
    } catch (err: any) {
      alert(err.message);
      console.log(err.message);
    }
  };

  const sendPasswordToUser = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("New password sent to your email");
    } catch (err: any) {
      alert(err.message);
      console.log(err.message);
    }
  };

  const signOutUser = async () => {
    setUser(null);
    navigate("/login");
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const q = query(collectionUsersRef, where("uid", "==", user?.uid));
        onSnapshot(q, (doc) => {
          const userData = doc?.docs[0]?.data();
          console.log('userData',userData);
          setUserData(userData);
          setUser(user);
          if (userData?.role === "admin") {
          console.log('authen');
            navigate("/auth/dashbroad");
          } else {
            navigate("/");
          }
        });
      } else {
        setUser(null);
        navigate("/login");
      }
    });
  
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user || userData) {
      if (userData?.role === 'admin') {
        navigate("/auth/dashbroad");  // Redirect to admin dashboard
      } else {
        // navigate("/");  // Redirect to user home page
      }
    } else {
      navigate("/login");  // Redirect to login if not authenticated
    }
  }, [user, userData, navigate]);
  
  

  const initialState: AuthContextType = {
    signInWithGoogle,
    loginWithEmailAndPassword,
    registerWithEmailAndPassword,
    sendPasswordToUser,
    signOutUser,
    user,
    userData,
  };

  return (
    <div>
      <AuthContext.Provider value={initialState}>
        {children}
      </AuthContext.Provider>
    </div>
  );
};

export default AppContext;
