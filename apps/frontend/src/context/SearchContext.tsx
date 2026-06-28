import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

// 1. Define the shape of our context
interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

// 2. Create the context with undefined initial value
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// 3. Create the Provider Component
export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      {children}
    </SearchContext.Provider>
  );
};

// 4. Create a custom hook to use it easily
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
