import React, { createContext, useContext, useState, ReactNode } from "react";

interface FiltreSubmissionContextType {
  filtreSubmission: number | null;
  setFiltreSubmission: React.Dispatch<React.SetStateAction<number | null>>;
}

const FiltreSubmissionContext = createContext<FiltreSubmissionContextType | undefined>(undefined);

export const useFiltreSubmissionContext = () => {
  const context = useContext(FiltreSubmissionContext);
  if (!context) {
    throw new Error("useFiltreSubmissionContext must be used within a FiltreSubmissionProvider");
  }
  return context;
};

export const FiltreSubmissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // ne peut etre que null ou 1
  const [filtreSubmission, setFiltreSubmission] = useState<number | null>(null);

  return (
    <FiltreSubmissionContext.Provider value={{ filtreSubmission, setFiltreSubmission }}>
      {children}
    </FiltreSubmissionContext.Provider>
  );
};
