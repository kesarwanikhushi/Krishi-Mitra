import React, { createContext, useContext, useState } from "react";

const MuteContext = createContext();

export const GlobalMuteProvider = ({ children }) => {
  const [muted, setMuted] = useState(false);
  const toggleMute = () => setMuted((m) => !m);
  return (
    <MuteContext.Provider value={{ muted, toggleMute }}>
      {children}
    </MuteContext.Provider>
  );
};

export const useMute = () => {
  const context = useContext(MuteContext);
  if (!context) throw new Error("useMute must be used within a GlobalMuteProvider");
  return context;
};
