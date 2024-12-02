import React, { useRef, useState, useEffect, useContext } from "react";
import nature from "../../assets/images/nature.jpg";
import { Tooltip } from "@material-tailwind/react";
import { Avatar } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import job from "../../assets/images/job.png";
import location from "../../assets/images/location.png";
import facebook from "../../assets/images/facebook.png";
import twitter from "../../assets/images/twitter.png";
import laptop from "../../assets/images/laptop.jpg";
import media from "../../assets/images/media.jpg";
import apps from "../../assets/images/apps.jpg";
import tik from "../../assets/images/tik.jpg";
import { AuthContext } from "../AppContext/AppContext";

interface Image {
  id: string;
  image: string;
}

const LeftSide: React.FC = () => {
  const [data, setData] = useState<Image | null>(null);
  const count = useRef<number>(0);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/group"); // Replace with your target route
  };
  if (!authContext) {
    return null; // or some loading/error state
  }
  const { user, userData } = authContext;
  const handleRandom = (arr: Image[]) => {
    setData(arr[Math.floor(Math.random() * arr.length)]);
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const imageList: Image[] = [
      {
        id: "1",
        image: laptop,
      },
      {
        id: "2",
        image: media,
      },
      {
        id: "3",
        image: apps,
      },
      {
        id: "4",
        image: tik,
      },
    ];
    handleRandom(imageList);
    let countAds = 0;
    const startAds = setInterval(() => {
      countAds++;
      handleRandom(imageList);
      count.current = countAds;
      if (countAds === 5) {
        clearInterval(startAds);
      }
    }, 2000);

    return () => {
      clearInterval(startAds);
    };
  }, []);

  const progressBar = () => {
    switch (count.current) {
      case 1:
        return 20;
      case 2:
        return 40;
      case 3:
        return 60;
      case 4:
        return 80;
      case 5:
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white pb-4 border-2 rounded-r-xl shadow-lg">
      <div className="flex flex-col items-center relative">
        <img
          className="h-28 w-full rounded-r-xl"
          src={nature}
          alt="nature"
        ></img>
        <div className="absolute -bottom-4">
          <Tooltip content="Profile" placement="top">
            <Avatar size="md" src={userData?.image || user?.photoURL} alt="avatar"></Avatar>
          </Tooltip>
        </div>
      </div>
      <div className="flex flex-col items-center pt-6">
        <p className="font-roboto font-medium text-md text-gray-700 no-underline tracking-normal leading-none">
          {user?.email || userData?.email}
        </p>
        <p className="font-roboto font-medium text-xs text-gray-700 no-underline tracking-normal leading-none">
          Access exclusive tools & insights
        </p>
        <p className="font-roboto font-medium text-sm text-gray-700 no-underline tracking-normal leading-none py-2">
          Try premium for free
        </p>
      </div>
      {/* <div className="flex flex-col pl-2">
        <div className="flex items-center pb-4">
          <img className="h-10" src={location} alt="location"></img>
          <p className="font-roboto font-bold text-lg no-underline tracking-normal leading-none">
            California
          </p>
        </div>
        <div className="flex items-center">
          <img className="h-10" src={job} alt="job"></img>
          <p className="font-roboto font-bold text-lg no-underline tracking-normal leading-none">
            React Developer
          </p>
        </div>
        <div className="flex justify-center items-center pt-4">
          <p className="font-roboto font-bold text-md text-[#0177b7] no-underline tracking-normal leading-none">
            Events
          </p>
          <p className="font-roboto font-bold text-md text-[#0177b7] no-underline tracking-normal leading-none mx-2">
            Groups
          </p>
          <p className="font-roboto font-bold text-md text-[#0177b7] no-underline tracking-normal leading-none">
            Follow
          </p>
          <p className="font-roboto font-bold text-md text-[#0177b7] no-underline tracking-normal leading-none mx-2">
            More
          </p>
        </div>
      </div> */}
      <div className="ml-2">
        <p className="font-roboto font-bold text-lg no-underline tracking-normal leading-none py-2">
          Social Profiles
        </p>
        <div className="flex items-center">
          {/* <img className="h-10 mb-3 mr-2" src={facebook} alt="facebook"></img> */}
          <svg class="h-8 w-8 text-slate-500 mr-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>

          <p
            onClick={handleNavigate}
            style={{ cursor: "pointer" }}
            className="font-roboto font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r to-red-700 from-blue-500 no-underline tracking-normal leading-none py-2"
          >
            Group
          </p>
        </div>
        {/* <div className="flex items-center">
          <img className="h-10 mb-3 mr-2" src={twitter} alt="twitter"></img>
          <p className="font-roboto font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r to-red-700 from-blue-500 no-underline tracking-normal leading-none py-2">
            Social Network
          </p>
        </div> */}
      </div>
      {/* <div className="flex flex-col justify-center items-center pt-4">
        <p className="font-roboto font-bold text-lg no-underline tracking-normal leading-none py-2">
          Random Ads
        </p>
        <div
          style={{ width: `${progressBar()}%` }}
          className="bg-blue-600 rounded-xl h-1 mb-4"
        ></div>
        <div id="indicators-carousel" class="relative w-full" data-carousel="static">
          <div class="relative h-56 overflow-hidden rounded-lg md:h-96">
            <div class="hidden duration-700 ease-in-out" data-carousel-item="active">
              <img src="https://firebasestorage.googleapis.com/v0/b/mediasocial-education2.appspot.com/o/images%2Fcource.png?alt=media&token=9c7adf83-403b-4b4f-a539-eb7a6630202f" class="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" alt="..."/>
            </div>
            <div class="hidden duration-700 ease-in-out" data-carousel-item>
              <img src="https://firebasestorage.googleapis.com/v0/b/mediasocial-education2.appspot.com/o/images%2Fcource.png?alt=media&token=9c7adf83-403b-4b4f-a539-eb7a6630202f" class="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" alt="..."/>
            </div>
            <div class="hidden duration-700 ease-in-out" data-carousel-item>
              <img src="https://firebasestorage.googleapis.com/v0/b/mediasocial-education2.appspot.com/o/images%2Fcource.png?alt=media&token=9c7adf83-403b-4b4f-a539-eb7a6630202f" class="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" alt="..."/>
            </div>
            <div class="hidden duration-700 ease-in-out" data-carousel-item>
              <img src="https://firebasestorage.googleapis.com/v0/b/mediasocial-education2.appspot.com/o/images%2Fcource.png?alt=media&token=9c7adf83-403b-4b4f-a539-eb7a6630202f" class="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" alt="..."/>
            </div>
            <div class="hidden duration-700 ease-in-out" data-carousel-item>
              <img src="https://firebasestorage.googleapis.com/v0/b/mediasocial-education2.appspot.com/o/images%2Fcource.png?alt=media&token=9c7adf83-403b-4b4f-a539-eb7a6630202f" class="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" alt="..."/>
            </div>
          </div>
          <div class="absolute z-30 flex -translate-x-1/2 space-x-3 rtl:space-x-reverse bottom-5 left-1/2">
            <button type="button" class="w-3 h-3 rounded-full" aria-current="true" aria-label="Slide 1" data-carousel-slide-to="0"></button>
            <button type="button" class="w-3 h-3 rounded-full" aria-current="false" aria-label="Slide 2" data-carousel-slide-to="1"></button>
            <button type="button" class="w-3 h-3 rounded-full" aria-current="false" aria-label="Slide 3" data-carousel-slide-to="2"></button>
            <button type="button" class="w-3 h-3 rounded-full" aria-current="false" aria-label="Slide 4" data-carousel-slide-to="3"></button>
            <button type="button" class="w-3 h-3 rounded-full" aria-current="false" aria-label="Slide 5" data-carousel-slide-to="4"></button>
          </div>
          <button type="button" class="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none" data-carousel-prev>
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
              <svg class="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4" />
              </svg>
              <span class="sr-only">Previous</span>
            </span>
          </button>
          <button type="button" class="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none" data-carousel-next>
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
              <svg class="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4" />
              </svg>
              <span class="sr-only">Next</span>
            </span>
          </button>
        </div>


      </div> */}
    </div>
  );
};

export default LeftSide;
