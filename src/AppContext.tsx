import React, { createContext, useContext, useState, ReactNode } from "react";

// Tạo context và định nghĩa loại cho nó
interface AppContextType {
  shouldRefresh: boolean;
  shouldRefreshTabDetail: boolean;
  nameRoom: string;
  idRoom: string;

  mainRefresh: boolean;
  //  idDetailRoom: string;

  setShouldRefresh: (value: boolean) => void;
  setShouldRefreshTabDetail: (value: boolean) => void;
  setNameRoom: (name: string) => void;
  setIdRoom: (name: string) => void;

  setMainRefresh: (value: boolean) => void;
  // setIdDetailRoom: (id: string) => void;
}

// Tạo context mặc định
const AppContext = createContext<AppContextType | undefined>(undefined);

// Tạo AppProvider
export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [shouldRefreshTabDetail, setShouldRefreshTabDetail] = useState(false);
  const [nameRoom, setNameRoom] = useState("");
  const [idRoom, setIdRoom] = useState("");

  const [mainRefresh, setMainRefresh] = useState(false);
  // const [idDetailRoom, setIdDetailRoom] = useState<string>("");
  return (
    <AppContext.Provider
      value={{
        shouldRefresh,
        setShouldRefresh,
        shouldRefreshTabDetail,
        setShouldRefreshTabDetail,
        nameRoom,
        setNameRoom,
        idRoom,
        setIdRoom,
        setMainRefresh,
        mainRefresh,
        /*    idDetailRoom, // Truyền idDetailRoom qua provider
        setIdDetailRoom, // Truyền setter qua provider */
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Tạo hook để sử dụng context
// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export default AppContext;
