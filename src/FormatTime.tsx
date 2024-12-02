const formatVietnameseDate = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1; // JavaScript months are 0-11
    const hours = date.getHours();
    const minutes = date.getMinutes();
  
    // Pad minutes with leading zero if necessary
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
    return `${day} tháng ${month} lúc ${hours}:${formattedMinutes}`;
  };

export default formatVietnameseDate;