export const getRandomImage = (): string => {
  // Array of image URLs (You can replace these with your own image links)
  const imageUrls = [
    "https://img.freepik.com/free-vector/hand-drawn-back-school-background_23-2149464866.jpg?w=2000&t=st=1729159680~exp=1729160280~hmac=f0a4839b388b1c5494746b68e363f7bcfe3c38ac5820debcb3865e4aac54c2bf",
    "https://img.freepik.com/free-vector/geometric-science-education-background-vector-gradient-blue-digital-remix_53876-125993.jpg?w=2000&t=st=1729159718~exp=1729160318~hmac=03eead340490e0bf17594dd480391bb2b699f2562735ff2c7a6853ee1e19b197",
    "https://img.freepik.com/free-vector/gradient-international-day-education-background_23-2151120687.jpg?w=2000&t=st=1729160298~exp=1729160898~hmac=7f4435f401b804b923972a672afb6e0fa309d4d865a9f9afc919b89229c20082",
    "https://img.freepik.com/free-vector/flat-international-day-education-background_23-2151081135.jpg?w=2000&t=st=1729160349~exp=1729160949~hmac=72430e0c2e77c63f032befe79ce0e75d2542d7eb60e9110cbc7c15037988a5a4",
    "https://img.freepik.com/free-vector/flat-design-back-to-school-background_23-2148594824.jpg?w=2000&t=st=1729160371~exp=1729160971~hmac=8addd2e1615d0a4e4f934250b6f9e6137bdfe41dd95b037116634a0972a543d4",
    "https://img.freepik.com/free-vector/blue-background-back-school_1053-591.jpg?w=1380&t=st=1729160400~exp=1729161000~hmac=955cce91874add57845db218d994b3955ef7e4c177f8fe907b5524546b051a0b",
  ];

  // Generate a random index to select an image URL
  const randomIndex = Math.floor(Math.random() * imageUrls.length);
  return imageUrls[randomIndex]; // Return the randomly selected image URL
};
