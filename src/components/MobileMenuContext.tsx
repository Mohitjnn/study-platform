// "use client";
// import { createContext, useContext, useState, ReactNode } from "react";

// interface MobileMenuContextType {
//   isOpen: boolean;
//   toggle: () => void;
//   open: () => void;
//   close: () => void;
// }

// const MobileMenuContext = createContext<MobileMenuContextType | null>(null);

// export function MobileMenuProvider({ children }: { children: ReactNode }) {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <MobileMenuContext.Provider
//       value={{
//         isOpen,
//         toggle: () => setIsOpen((prev) => !prev),
//         open: () => setIsOpen(true),
//         close: () => setIsOpen(false),
//       }}
//     >
//       {children}
//     </MobileMenuContext.Provider>
//   );
// }

// export const useMobileMenu = () => {
//   const ctx = useContext(MobileMenuContext);
//   if (!ctx) throw new Error("useMobileMenu must be used inside provider");
//   return ctx;
// };

"use client";
import { createContext, useContext, useEffect, useState } from "react";

const MobileMenuContext = createContext({
  isOpen: false,
  toggle: () => {},
});

import type { ReactNode } from "react";

export function MobileMenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <MobileMenuContext.Provider value={{ isOpen, toggle }}>
      {children}
    </MobileMenuContext.Provider>
  );
}

export const useMobileMenu = () => useContext(MobileMenuContext);
