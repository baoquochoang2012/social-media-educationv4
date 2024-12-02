import React from "react";

interface CardProps {
  name: string;
  img: string;
  status: "Online" | "Offline"; // Assuming status can only be "Online" or "Offline"
}

const Card: React.FC<CardProps> = () => {
  return (
    // <div>
    //   <div className="relative">
    //     <img
    //       className="h-80 w-56 rounded-2xl hover:scale-105 duration-700 ease-in-out cursor-pointer shadow-lg"
    //       src={img}
    //       alt={name}
    //     />
    //     <p className="absolute bottom-4 left-4 text-sm font-medium text-white font-roboto no-underline leading-none">
    //       {name}
    //     </p>
    //     <p
    //       className={`absolute bottom-4 right-4 text-sm font-medium ${
    //         status === "Offline" ? "text-red-600" : "text-green-600"
    //       } font-roboto no-underline leading-none`}
    //     >
          
    //     </p>
    //   </div>
    // </div>
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
  );
};

export default Card;
