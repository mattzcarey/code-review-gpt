/* eslint-disable */
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

export const useHeader = () => {
  const [hidden, setHidden] = useState(false);
  const scrollPos = useRef<number>(0);

  const { data: session } = useSession();
  useEffect(() => {
    const handleScroll = (e: Event) => {
      if (session?.user !== undefined) {
        setHidden(false);
        return;
      }

      const target = e.currentTarget as Window;
      if (target.scrollY > scrollPos.current) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      scrollPos.current = target.scrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return {
    hidden,
  };
};
