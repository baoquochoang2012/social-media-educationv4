
import React, { useState, useEffect } from "react";
import LeftSide from "../LeftSidebar/LeftSide";
import Navbar from "../Navbar/Navbar";
import RightSide from "../RightSidebar/RightSide";
import Main from "../Main/Main";
import profilePic from "../../assets/images/profilePic.jpg";
import { Avatar, Button, Tooltip } from "@material-tailwind/react";
import avatar from "../../assets/images/avatar.jpg";
import { collection, where, query, onSnapshot, addDoc, doc, setDoc } from "firebase/firestore";
import { db, storage } from "../firebase/firebase";
import { useParams } from "react-router-dom";
import Modal from "../Modal";
import Swal from "sweetalert2";
import { listAll, getDownloadURL, ref, uploadBytesResumable, uploadBytes, getStorage } from "firebase/storage";
import { v4 } from "uuid";
import { isEmpty, set } from "lodash";
import { Select, Option } from "@material-tailwind/react";
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const LINKs_CORS = "https://cors-anywhere.herokuapp.com/";
interface User {
  uid: string;
  email: string;
  name: string;
  image: string;
  address: string;
  city: string;
  city_id: string;
  district: string;
  district_id: string;
  ward: string;
  ward_id: string;
  job: string;
  cv: string;
  cv_name: string;
  phone: string;
  about: string;
  experience: string;
  education: string;
  skills: string;
  password: string;
  confirmPassword: string;
  is_teacher: boolean;
}

const FriendProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<User | null>(null);
  const [data, setData] = useState<User | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [openModalInfor, setOpenModalInfor] = useState(false);
  const [img, setImg] = useState<string>("");
  const [imgUrl, setImgUrl] = useState<string[]>([]);
  const uniqueImgUrl = Array.from(new Set(imgUrl));




  const [city, setcity] = useState<string[]>([]);
  const [cityId, setcityId] = useState<Object>("");
  const [district, setdistrict] = useState<string[]>([]);
  const [districtId, setdistrictId] = useState<Object>("");
  const [ward, setward] = useState<string[]>([]);

  const [isImageSelected, setIsImageSelected] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const requestOptions = {
          method: "GET",
          mode: "no-cors",
          redirect: "follow",
        };
  
        // Fetch data từ API
        const response = await fetch(
          LINKs_CORS+"/http://vapi.vnappmob.com/api/province"
        );
        console.log('response',response);
        // Kiểm tra nếu response không thành công
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        // Chuyển dữ liệu sang JSON
        const data = await response.json();
  
        // Log và cập nhật state
        console.log(data);
        setcity(data.results); // Đảm bảo setcity được khai báo trước
      } catch (error) {
        console.error("Error fetching the cities:", error);
      }
    };
  
    // fetchCities();
  }, []); // Dependency array trống để chạy 1 lần khi component mount
  
  useEffect(() => {
    const getDistrict = async () => {
      const resdistrict = await fetch(
        `https://vapi.vnappmob.com/api/province/district/46`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "origin": "https://vapi.vnappmob.com",
          "Referer": "https://vapi.vnappmob.com/api/province",
          "x-requested-with": "XMLHttpRequest"
        }
      }
      );
      const datadistrict = await resdistrict.json();
      setdistrict(await datadistrict.results);
      console.log(datadistrict);
    };
    getDistrict();
  }, [cityId]);

  useEffect(() => {
    const getWard = async () => {
      const resward = await fetch(
        LINKs_CORS+`https://vapi.vnappmob.com/api/province/ward/${districtId.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "origin": "https://vapi.vnappmob.com",
          "Referer": "https://vapi.vnappmob.com/api/province",
          "x-requested-with": "XMLHttpRequest"
        }
      }
      );
      const dataward = await resward.json();
      setward(await dataward.results);
    };
    // getWard();
  }, [districtId]);

  const arrCities: { label: any; idCity: any; }[] = [];

  city.map((city: any) => {
    arrCities.push({
      label: city.province_name,
      idCity: city.province_id,
    });
  });
  const arrDistricts: { label: any; idDistrict: any; }[] = [];
  if (!isEmpty(district)) {
    district.map((district: any) => {
      arrDistricts.push({
        label: district.district_name,
        idDistrict: district.district_id,
      });
    });
  }

  const arrWards: { label: any; idWard: any; }[] = [];
  if (!isEmpty(ward)) {
    ward.map((ward: any) => {
      arrWards.push({
        label: ward.ward_name,
        idWard: ward.ward_id,
      });
    });
  }
  const handleChangeCity = (_e: any, value: any) => {
    setcityId({
      ...cityId,
      id: _e,
    });
  }


  const handleChangeDistrict = (_e: any, value: any) => {

    setdistrictId({
      ...districtId,
      id: _e,
    });
  }
  // useEffect(() => {
  //   setTimeout(() => {
  //   if(profile?.city_id !== '') {
  //     console.log(data?.city_id);
  //     handleChangeCity(data?.city_id, data?.city_id);
  //   }
  // if(profile?.district_id !== '') {
  //   console.log(data?.district_id);
  //   handleChangeDistrict(data?.district_id, data?.district_id);
  // }
  // }, 1000);
  // }, [data]);
  const popup = () => {
    setOpenModal(true);
  };
  useEffect(() => {
    const getUserProfile = async () => {
      const q = query(collection(db, "users"), where("uid", "==", id));
      console.log(q);
      await onSnapshot(q, (doc) => {
        setProfile(doc.docs[0].data() as User);
        setData(doc.docs[0].data() as User);
      });
    };
    getUserProfile();
    const fetchAvatar = async () => {
      listAll(ref(storage, 'avatars')).then((res) => {
        setImgUrl([]);
        res.items.forEach((itemRef) => {
          console.log(itemRef);
          getDownloadURL(itemRef).then((url) => {
            setImgUrl(data => [...data, url]);
          });
        });
      }).catch((error) => {
        console.log(error);
      });
    }
    fetchAvatar();
  }, [id]);
  const collectionUsersRef = collection(db, "users");
  const [openModalAva, setOpenModalAva] = useState(false);
  const handleChooseFile = () => {
    const fileInput = document.querySelector("#fileInput");
    fileInput?.click();
  };
  const [stageAddFriend, setStageAddFriend] = useState(false);
  const [listFriend, setListFriend] = useState([]);
  useEffect(() => {
    const checkFriend = async () => {
      try {
        const q = query(collection(db, "users"), where("uid", "==", user?.uid));
        const docSnap = await getDocs(q);
        const data = docSnap.docs[0].data();
        setListFriend(data.friends);
      } catch (err: any) {
        // alert(err.message);
        console.log(err.message);
      }
    };
    checkFriend();
  }, [stageAddFriend]);
console.log(listFriend);
console.log(stageAddFriend);

useEffect(() => {
  if(typeof listFriend === 'undefined') {
    setStageAddFriend(false);
  } else {
  listFriend.map((friend: any) => {
    if (friend.id === id) {
      setStageAddFriend(true);
    }
  }
  );
}
}
, [listFriend]);

  const handleChooseFileProfile = () => {
    const fileInput = document.querySelector("#ProfileInput") as HTMLInputElement;
    fileInput.value = '';
    fileInput?.click();
  };

  const applyAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const avatarFile = e.target.files[0];
    if (!avatarFile) return; // Return if no file is selected

    const previewUrl = URL.createObjectURL(avatarFile); // Create a preview URL
    setUploadedImage(previewUrl); // Set preview image
    setIsImageSelected(true); // Set image selected to true
  };

  // const handleUploadConfirm = async () => {
  //   // Handle URL update
  //   if (url) {
  //     const confirmed = await Swal.fire({
  //       title: "Bạn chắc chứ?",
  //       text: "Bạn có chắc muốn thay đổi ảnh đại diện?",
  //       icon: "warning",
  //       showCancelButton: true,
  //       confirmButtonText: "Có",
  //       cancelButtonText: "Không",
  //     });
  
  //     if (confirmed.isConfirmed) {
  //       if (profile.image !== url) { // Only update if different
  //         storeData('image', url);
  //         setProfile({ ...profile, image: url });
  //         setImg(url);
  //       }
  //       setOpenModalAva(false);
  //       Swal.fire({
  //         title: "Thành công",
  //         text: "Ảnh đại diện đã được cập nhật",
  //         icon: "success",
  //         showConfirmButton: false,
  //         timer: 1500,
  //         toast: true,
  //         position: "top-right",
  //       });
  //     }
  //   } else {
  //     // Handle file upload
  //     const avatar = e.target.files[0];
  //     if (!avatar) return; // Return if no file
  
  //     setImg(URL.createObjectURL(avatar)); // Show preview
  //     const confirmed = await Swal.fire({
  //       title: "Bạn chắc chứ?",
  //       text: "Bạn có chắc muốn thay đổi ảnh đại diện?",
  //       icon: "warning",
  //       showCancelButton: true,
  //       confirmButtonText: "Có",
  //       cancelButtonText: "Không",
  //     });
  
  //     if (confirmed.isConfirmed) {
  //       const storageRef = ref(storage, `avatars/${v4()}`);
  //       await uploadBytes(storageRef, avatar);
  //       const downloadURL = await getDownloadURL(storageRef);
  //       storeData('image', downloadURL);
  //       setProfile((prevProfile) => ({ ...prevProfile, image: downloadURL }));
  //       setImg(downloadURL);
  //       setOpenModalAva(false);
  //       Swal.fire({
  //         title: "Thành công",
  //         text: "Ảnh đại diện đã được cập nhật",
  //         icon: "success",
  //         showConfirmButton: false,
  //         timer: 1500,
  //         toast: true,
  //         position: "top-right",
  //       });
  //     }
  //   }
  // };
  const handleUploadConfirm = async () => {
    if (!uploadedImage) return; // Return if no uploaded image

    const storageRef = ref(storage, `avatars/${v4()}`);
    const avatarFile = document.getElementById('fileInput').files[0]; // Get the selected file
    await uploadBytes(storageRef, avatarFile); // Upload the selected file
    const downloadURL = await getDownloadURL(storageRef); // Get the download URL

    // Update profile with the new image
    storeData('image', downloadURL);
    setImg(downloadURL);
    setProfile((prevProfile) => ({ ...prevProfile, image: downloadURL }));
    setUploadedImage(downloadURL); // Update the uploaded image URL
    setIsImageSelected(false); // Reset the selection state

    Swal.fire({
      title: "Thành công",
      text: "Ảnh đại diện đã được cập nhật",
      icon: "success",
      showConfirmButton: false,
      timer: 1500,
      toast: true,
      position: "top-right",
    });
  };

  // const applyAvatar = async (e: React.ChangeEvent<HTMLInputElement>, url: string) => {
  //   if (url) {
  //     // Handle URL update (optional)
  //     const confirmed = await Swal.fire({
  //       title: "Bạn chắc chứ?",
  //       text: "Bạn có chắc muốn thay đổi ảnh đại diện?",
  //       icon: "warning",
  //       showCancelButton: true,
  //       confirmButtonText: "Có",
  //       cancelButtonText: "Không",
  //     });

  //     if (confirmed.isConfirmed) {
  //       setProfile((prevProfile) => ({ ...prevProfile, image: url }));
  //       setUploadedImage(url); // Update the uploaded image
  //     }
  //     return;
  //   }

  //   // Handle file upload
  //   const avatar = e.target.files[0];
  //   if (!avatar) return; // Return if no file

  //   const previewUrl = URL.createObjectURL(avatar); // Create a preview URL
  //   setUploadedImage(previewUrl); // Set preview image
  //   setIsImageSelected(true); // Set image selected to true

  //   const confirmed = await Swal.fire({
  //     title: "Bạn chắc chứ?",
  //     text: "Bạn có chắc muốn thay đổi ảnh đại diện?",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonText: "Có",
  //     cancelButtonText: "Không",
  //   });

  //   if (confirmed.isConfirmed) {
  //     const storageRef = ref(storage, `avatars/${v4()}`);
  //     await uploadBytes(storageRef, avatar); // Upload the selected file
  //     const downloadURL = await getDownloadURL(storageRef); // Get the download URL
  //     setProfile((prevProfile) => ({ ...prevProfile, image: downloadURL }));
  //     setUploadedImage(downloadURL); // Set the uploaded image URL
  //     setIsImageSelected(false); // Reset the selection state
  //     Swal.fire({
  //       title: "Thành công",
  //       text: "Ảnh đại diện đã được cập nhật",
  //       icon: "success",
  //       showConfirmButton: false,
  //       timer: 1500,
  //       toast: true,
  //       position: "top-right",
  //     });
  //   }
  // };

  // const handleChooseFile = () => {
  //   const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  //   if (fileInput) {
  //     fileInput.click(); // Trigger the file input click
  //   }
  // };
  
  const storeData = async (type: string, data: string) => {
    const ref = collection(db, "users");
    const q = query(ref, where("uid", "==", id));
    const querySnapshot = await onSnapshot(q, (doc) => {
      doc.forEach(async (doc) => {
        await setDoc(doc.ref, { [type]: data }, { merge: true });
      });
    });
  };
  const checkPassword = (password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
      Swal.fire({
        title: "Mật khẩu không khớp",
        icon: "error",
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        position: "top-right",
      });
      return false;
    }
    return true;
  };
  const checkPasswordDb = async (password: string) => {
    const ref = collection(db, "users");
    const q = query(ref, where("uid", "==", id));
    const querySnapshot = await onSnapshot(q, (doc) => {
      doc.forEach(async (doc) => {
        if (doc.data().password !== password) {
          Swal.fire({
            title: "Mật khẩu không đúng",
            icon: "error",
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            position: "top-right",
          });
        }
      });
    });
  }
  const applyInfor = (e: any) => {
    e.preventDefault();
    console.log(e.target.email?.value);
    // const username = e.target.email?.value;
    // if (username == '') {
    //   storeData('email', profile?.email || '');
    // }
    const name = e.target.name?.value;
    if (name == '') {
      storeData('name', profile?.name || '');
    }
    // const password = e.target.password?.value;
    // const confirmPassword = e.target.confirmPassword.value;
    // if (!checkPassword(password, confirmPassword)) {
    //   return;
    // }
    // checkPasswordDb(password);
    const phone = e.target.phone?.value;
    const address = e.target.address?.value;
    // const city = e.target.city.querySelector('span').textContent;
    // const city_id = e.target.city.querySelector('span').attributes[1].value;
    // const district = e.target.district.querySelector('span').textContent;
    // const district_id = e.target.district.querySelector('span').attributes[1].value;
    // const ward = e.target.ward.querySelector('span').textContent;
    // const ward_id = e.target.ward.querySelector('span').attributes[1].value;
    const job = e.target.job?.value;
    // address = `${address}, ${ward}, ${district}, ${city}`;
    // storeData('email', username);
    storeData('name', name);
    // storeData('password', password);
    storeData('phone', phone);
    storeData('address', address);
    // storeData('city', city);
    // storeData('city_id', city_id);
    // storeData('district', district);
    // storeData('district_id', district_id);
    // storeData('ward', ward);
    // storeData('ward_id', ward_id);
    storeData('job', job);
    setOpenModalInfor(false);
    Swal.fire({
      title: "Cập nhật thành công",
      icon: "success",
      showConfirmButton: false,
      timer: 1500,
      toast: true,
      position: "top-right",
    });
  };
  const handlePhone = (e: any) => {
    const re = /^[0-9\b]+$/;
    if (e.target.value === "" || re.test(e.target.value)) {
      e.target.value = e.target.value;
    } else {
      e.target.value = e.target.value.substring(0, e.target.value.length - 1);
    }
    setData({
      ...data,
      [e.target.id]: e.target.value,
    });
  }
  const onHandleChange = (e: any) => {
    setData({
      ...data,
      [e.target.id]: e.target.value,
    });
  };

  // const applyProfile = (e: any) => {
  //   const file = e.target.files;
  //   const storageRef = ref(storage, `profiles/${v4()}`);
  //   uploadBytes(storageRef, file).then((snapshot) => {
  //     console.log("Uploaded a blob or file!");
  //     getDownloadURL(snapshot.ref).then((downloadURL) => {
  //       console.log("File available at", downloadURL);
  //       storeData('cv', downloadURL);
  //       setProfile({ ...profile, cv: downloadURL });
  //       Swal.fire({
  //         title: "Thành công",
  //         text: "Hồ sơ đã được cập nhật",
  //         icon: "success",
  //         showConfirmButton: false,
  //         timer: 1500,
  //         toast: true,
  //         position: "top-right",
  //       });
  //     });
  //   });
  // }

  const applyProfile = (e: any) => {
    const files = e.target.files;
    const uploadPromises = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          title: "Định dạng file không hợp lệ.",
          icon: "error",
          showConfirmButton: false,
          timer: 1500,
          toast: true,
          position: "top-right",
        });
        return;
      }

      const storageRef = ref(storage, `profiles/${v4()}`);
      const file_name = file.name;
      const uploadTask = uploadBytes(storageRef, file).then((snapshot) => {
        return getDownloadURL(snapshot.ref).then((downloadURL) => {
          console.log("File available at", downloadURL);
          // Here you can handle each download URL as needed
          // For example, storing them in an array or updating the state
          return downloadURL; // Returning the download URL for further processing
        });
      });
      uploadPromises.push(uploadTask);
    }

    Promise.all(uploadPromises).then((downloadURLs) => {
      console.log("All files uploaded:", downloadURLs);
      setProfile({ ...profile, cv: downloadURLs[0] });
      setProfile({ ...profile, cv_name: files[0].name });
      storeData('cv', downloadURLs[0]);
      storeData('cv_name', files[0].name);
      Swal.fire({
        title: "Thành công",
        text: "Hồ sơ đã được cập nhật",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        position: "top-right",
      });
    });
  }

  return (
    <>
      <div className="w-full">
        <div className="fixed top-0 z-10 w-full bg-white">
          <Navbar></Navbar>
        </div>
        <div className="flex bg-gray-100">
          <div className="flex-auto w-[20%] fixed top-12">
            <LeftSide></LeftSide>
          </div>
          <div className="flex-auto w-[60%] absolute left-[20%] top-14 bg-gray-100 rounded-xl">
            <div className="w-[80%] mx-auto">
              <div>
                <div className="relative py-4">
                  <img
                    className="h-96 w-full rounded-md"
                    src={profilePic}
                    alt="profilePic"
                  ></img>
                  <div className="absolute top-10 right-6">
                    <Tooltip content="Profile" placement="top">
                      <>
                        <svg class="h-6 w-6 text-blue-600" style={{ cursor: "pointer" }} onClick={() => popup()}
                          width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" />
                          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />  <circle cx="12" cy="12" r="3" /></svg>
                      </>
                    </Tooltip>
                  </div>
                  <div className="absolute bottom-10 left-6">
                    <Avatar
                      size="xl"
                      variant="circular"
                      src={profile?.image || avatar}
                      alt="avatar" ></Avatar>
                    <p className="py-2 font-roboto font-medium text-sm text-white no-underline tracking-normal leading-none">
                      {profile?.email}
                    </p>
                    <p className="py-2 font-roboto font-medium text-sm text-white no-underline tracking-normal leading-none flex items-center">
                      {profile?.name}
                      {profile?.is_teacher && (
                        <span className="text-slate-500 ml-2">
                          <svg class="h-6 w-6 text-sky-500"  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <path d="M7 12l5 5l10 -10" />  <path d="M2 12l5 5m5 -5l5 -5" /></svg>
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col absolute right-6 bottom-10">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="#fff"
                        className="w-6 h-6"
                        onClick={() => popup()}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                        />
                      </svg>
                      {profile?.city ? (
                        <span className="ml-2 py-2 font-roboto font-medium text-sm text-white no-underline tracking-normal leading-none">
                          Từ {profile?.city}
                        </span>
                      ) : (
                        <span className="ml-2 py-2 font-roboto font-medium text-sm text-white no-underline tracking-normal leading-none">
                          Chưa cập nhật
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="#fff"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819"
                        />
                      </svg>
                      {profile?.ward ? (
                        <span className="ml-2 py-2 font-roboto font-medium text-sm text-white no-underline tracking-normal leading-none">
                          Sống tại {profile?.ward}, {profile?.district}
                        </span>
                      ) : (
                        <span className="ml-2 py-2 font-roboto font-medium text-sm text-white no-underline tracking-normal leading-none">
                          Chưa cập nhật
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <Main From="profile" dataPosts={[{id:id}]}></Main>
            </div>
          </div>
          <div className="flex-auto w-[20%] fixed right-0 top-12">
            <RightSide></RightSide>
          </div>
        </div>
      </div>
      <Modal
        openModal={openModal}
        setOpenModal={setOpenModal}
        title="Chỉnh sửa trang cá nhân"
        position="center"
        showFooter={false}>
        <div className="flex font-sans">
          <div className="flex flex-wrap w-full">
            <h1 className="flex-auto text-lg font-semibold text-slate-900">
              Ảnh đại diện
            </h1>
            <div className="text-lg font-semibold text-slate-500">
              <Button
                color="white"
                size="sm"
                onClick={() => setOpenModalAva(true)}
              >
                Thêm
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Avatar
            size="xl"
            variant="circular"
            src={profile?.image || avatar}
            alt="avatar" ></Avatar>
        </div>

        <div className="flex font-sans">
          <div className="flex flex-wrap w-full">
            <h1 className="flex-auto text-lg font-semibold text-slate-900">
              Thông tin cá nhân
            </h1>
            <div className="text-lg font-semibold text-slate-500">
              <Button
                color="white"
                size="sm"
                onClick={() => { setOpenModalInfor(true); }}
              >
                Chỉnh sửa
              </Button>
            </div>
          </div>
        </div>
        <div className="font-sans flex items-center space-x-2 text-slate-900">
          <svg class="h-6 w-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>{profile?.name}</span>
        </div>
        <div className="font-sans flex items-center space-x-2 text-slate-900">
          <svg class="h-6 w-6 text-gray-900" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <rect x="3" y="5" width="18" height="14" rx="2" />  <polyline points="3 7 12 13 21 7" /></svg>
          <span>{profile?.email}</span>
        </div>
        {profile?.phone && (
          <div className="font-sans flex items-center space-x-2 text-slate-900">
            <svg class="h-6 w-6 text-slate-500" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" /></svg>
            <span>{profile?.phone}</span>
          </div>
        )}
        {profile?.address && (
          <div className="font-sans flex items-center space-x-2 text-slate-900">
            <svg class="h-6 w-6 text-slate-500" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <circle cx="12" cy="11" r="3" />  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1 -2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" /></svg>
            <span>{profile?.address}</span>
          </div>
        )}
        {profile?.about && (
          <div className="font-sans flex items-center space-x-2 text-slate-900">
            <svg
              className="h-6 w-6 text-gray-900"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>{profile?.about}</span>
          </div>
        )}
        {profile?.experience && (
          <div className="font-sans flex items-center space-x-2 text-slate-900">
            <svg
              className="h-6 w-6 text-gray-900"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 14l9-5-9-5-9 5 9 5z"
              />
            </svg>
            <span>{profile?.experience}</span>
          </div>
        )}
        {profile?.education && (
          <div className="font-sans flex items-center space-x-2 text-slate-900">
            <svg
              className="h-6 w-6 text-gray-900"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 14l9-5-9-5-9 5 9 5z"
              />
            </svg>
            <span>{profile?.education}</span>
          </div>
        )}
        {profile?.skills && (
          <div className="font-sans flex items-center space-x-2 text-slate-900">
            <svg
              className="h-6 w-6 text-gray-900"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 14l9-5-9-5-9 5 9 5z"
              />
            </svg>
            <span>{profile?.skills}</span>
          </div>
        )}

        <div className="flex font-sans">
          <div className="flex flex-wrap w-full">
            <h1 className="flex-auto text-lg font-semibold text-slate-900">
              Hồ sơ 
              <span className="text-lg font-semibold text-slate-500 ml-2 text-sm">
                <i>(Chỉ hổ trợ định dạng PDF, DOCX, DOC)</i>
              </span>
            </h1>
            <div className="text-lg font-semibold text-slate-500">
              <input type="file" id="ProfileInput" hidden onChange={(e) => applyProfile(e)} multiple />
              <Button
                color="white"
                size="sm"
                onClick={() => handleChooseFileProfile()}
              >
                Thêm
              </Button>
            </div>
          </div>
        </div>
        {profile?.cv ? (
          <div className="font-sans flex items-center space-x-2 text-slate-900">
            <svg class="h-6 w-6 text-slate-500"  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <path d="M10 14a3.5 3.5 0 0 0 5 0l4 -4a3.5 3.5 0 0 0 -5 -5l-.5 .5" />  <path d="M14 10a3.5 3.5 0 0 0 -5 0l-4 4a3.5 3.5 0 0 0 5 5l.5 -.5" />  <line x1="16" y1="21" x2="16" y2="19" />  <line x1="19" y1="16" x2="21" y2="16" />  <line x1="3" y1="8" x2="5" y2="8" />  <line x1="8" y1="3" x2="8" y2="5" /></svg>
            <span>
              <a href={profile.cv} target="_blank">
                {profile?.cv_name}
              </a>
              {/* <Button
                color="white"
                size="sm"
                onClick={(e) => downloadProfile(e)}
              >
                {profile?.cv_name}
              </Button> */}
            </span>
          </div>
        ) : (
          <div className="font-sans flex items-center space-x-2 text-slate-900">
            <svg class="h-6 w-6 text-gray-900" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <circle cx="12" cy="12" r="9" />  <line x1="12" y1="8" x2="12" y2="12" />  <line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            <span><i>(Chưa cập nhật)</i></span>
          </div>
        )}
      </Modal>
      <Modal
        openModal={openModalAva}
        setOpenModal={setOpenModalAva}
        title="Chọn ảnh đại diện"
        position="center"
        showFooter={false}>
        <div className="flex items-center justify-center position:flex font-sans">
          <Avatar
            size="xl"
            variant="circular"
            // src={profile?.image || avatar}
            src={uploadedImage || profile?.image || avatar}
            alt="avatar" ></Avatar>
        </div>
        <input type="file" id="fileInput" hidden onChange={(e) => applyAvatar(e)} />
        <div className="flex items-center justify-center font-sans position:flex">
          <div className="flex align-center justify-center w-full">
            <div className="text-lg font-semibold text-slate-500">
              <Button
                color="white"
                size="sm"
                // onClick={() => handleChooseFile()}
                onClick={handleChooseFile}
                className="flex items-center justify-center"
              >
                <svg class="h-6 w-6 text-gray-900" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <line x1="12" y1="5" x2="12" y2="19" />  <line x1="5" y1="12" x2="19" y2="12" /></svg>
                {!isImageSelected ? "Tải ảnh lên" : "Thay đổi ảnh"}
              </Button>
            </div>
              {isImageSelected && (
                <Button
                  color="white"
                  size="sm"
                  // onClick={() => handleChooseFile()}
                  onClick={handleUploadConfirm}
                  className="flex items-center justify-center"
                >
                  <svg class="h-6 w-6 text-gray-900" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <line x1="12" y1="5" x2="12" y2="19" />  <line x1="5" y1="12" x2="19" y2="12" /></svg>
                  {isImageSelected ? "Xác nhận" : "Tải ảnh lên"}
                </Button>
              )}
          </div>
        </div>
        
        {/* <div className="font-sans space-x-2 text-slate-900">
          <h1 className="flex-auto text-lg font-semibold text-slate-900">
            Ảnh đã tải lên
          </h1>
          {uniqueImgUrl.length > 0 ? (
            <>
              <div className="flex flex-wrap w-full align-baseline">
                {imgUrl.map((url) => (
                  <img
                    className="h-20 w-20 rounded-md cursor-pointer m-2"
                    src={url}
                    alt="avatar"
                    onClick={(e) => applyAvatar(e, url)}
                  ></img>
                ))}
              </div>
            </>
          ) : (
            <div className="font-sans flex items-center space-x-2 text-slate-900">
              <svg class="h-6 w-6 text-gray-900" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <circle cx="12" cy="12" r="9" />  <line x1="12" y1="8" x2="12" y2="12" />  <line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              <span><i>(Chưa có ảnh đại diện)</i></span>
            </div>
          )}


        </div> */}

      </Modal>
      <Modal
        openModal={openModalInfor}
        setOpenModal={setOpenModalInfor}
        title="Chỉnh sửa thông tin cá nhân"
        position="center"
        showFooter={false}>
        <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={(e) => applyInfor(e)}>
          <div className="grid grid-cols-2 gap-4">
            <div class="mb-6">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="Name">
                Tên
              </label>
              <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" placeholder="Name" required value={data?.name} onChange={(e) => onHandleChange(e)} />
            </div>
          </div>
          {/* <div className="grid grid-cols-2 gap-4">
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                Mật khẩu
              </label>
              <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="Password" required value={data?.password} onChange={(e) => onHandleChange(e)} />
            </div>
            <div class="mb-6">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                Xác nhận mật khẩu
              </label>
              <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="confirmPassword" type="password" placeholder="Confirm password" required value={data?.confirmPassword} onChange={(e) => onHandleChange(e)} />
            </div>
          </div> */}
          <div className="grid grid-cols-2 gap-4">
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="Phone">
                Số điện thoại
              </label>
              <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="phone" type="text" placeholder="0123456889"  value={data?.phone} onChange={(e) => handlePhone(e)} />
            </div>
            <div class="mb-6">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="Address">
                Địa chỉ
              </label>
              <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="address" type="text" placeholder="Address"  value={data?.address} onChange={(e) => onHandleChange(e)} />
            </div>
          </div>
            <div className="grid grid-cols-2 gap-4">
              <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="City">
                  Tỉnh/Thành phố
                </label>
                <Select
                  id="city"
                  value={data?.city_id}
                  onChange={(e: any, value: any) => handleChangeCity(e, value)}
                  key={data?.city_id}
                  label="Tỉnh/Thành phố"
                >
                  {arrCities.map((city) => (
                    <Option
                      value={city.idCity}
                      key={city.label}
                      aria-label={city.label}
                    >
                      {city.label}
                    </Option>
                  ))}
                </Select>
              </div>
              <div class="mb-6">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="district">
                  Quận/Huyện
                </label>
                <Select
                  id="district"
                  value={data?.district_id}
                  onChange={(e: any, value: any) => handleChangeDistrict(e, value)}
                  label="Quận/Huyện"
                >
                  {arrDistricts.map((district) => (
                    <Option
                      value={district.idDistrict}
                      key={district.label}
                    >
                      {district.label}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="ward">
                  Xã/Phường
                </label>
                <Select
                  id="ward"
                  label="Xã/Phường"
                >
                  {arrWards.map((ward) => (
                    <Option
                      value={ward.idWard}
                      key={ward.label}
                    >
                      {ward.label}
                    </Option>
                  ))}
                </Select>
              </div>
              <div class="mb-6">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="job">
                  Tiêu đề công việc
                </label>
                <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="job" type="text" placeholder="Job" required value={data?.job} onChange={(e) => onHandleChange(e)} />
              </div>
            </div>
          <div class="flex items-center justify-between">
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
              Xác nhận
            </button>
            {/* <a class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" onClick={(e) => handleNoChange(e)}>
                Hoàn tác
              </a> */}
          </div>
        </form>
      </Modal>

    </>
  );
};

export default FriendProfile;

