// src/utils/utils.ts

export const generateRandomCode = (): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 7; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};
