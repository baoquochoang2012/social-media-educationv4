import React, { createContext, useContext, useState, useEffect } from 'react';
import { StreamChat } from 'stream-chat';

interface ClientContextType {
  client: any;
  setClient: React.Dispatch<React.SetStateAction<any>>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const useClient = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
};

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [client, setClient] = useState<any>(null);

  return (
    <ClientContext.Provider value={{ client, setClient }}>
      {children}
    </ClientContext.Provider>
  );
};