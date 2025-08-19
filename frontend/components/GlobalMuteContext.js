import { createContext, useContext, useState } from 'react';

const GlobalMuteContext = createContext();

export function GlobalMuteProvider({ children }) {
  const [globalMute, setGlobalMute] = useState(false);
  return (
    <GlobalMuteContext.Provider value={{ globalMute, setGlobalMute }}>
      {children}
    </GlobalMuteContext.Provider>
  );
}

export function useGlobalMute() {
  return useContext(GlobalMuteContext);
}
