import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Cross2Icon, TextAlignJustifyIcon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import React from "react";
import { NavItems } from "./NavItems";

export const MobileMenu = (): JSX.Element => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root onOpenChange={setOpen} open={open}>
      <Dialog.Trigger asChild>
        <button className="block sm:hidden" aria-label="open menu">
          <TextAlignJustifyIcon className="text-4xl" height={25} width={25} />
        </button>
      </Dialog.Trigger>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 flex overflow-auto cursor-pointer z-50 shadow-xl dark:shadow-primary/25"
                initial={{ opacity: 1, y: "-100%" }}
                animate={{ opacity: 1, y: "0%" }}
                exit={{ opacity: 1, y: "-100%" }}
                transition={{ duration: 0.4, ease: "circOut" }}
              >
                <Dialog.Content asChild forceMount>
                  <div className="flex flex-col items-center justify-between py-24 flex-1 w-full bg-white dark:bg-black border border-black/10 dark:border-white/25 p-10 shadow-xl dark:shadow-primary/50 focus:outline-none cursor-auto z-50">
                    <NavItems className="text-3xl h-fit text-center flex-col items-center justify-between gap-10" setOpen={setOpen}/>

                    <Dialog.Close asChild>
                      <button
                        className="absolute top-0 p-3 right-0 flex items-center justify-center gap-2 appearance-none rounded-full focus:shadow-sm focus:outline-none"
                        aria-label="close menu"
                      >
                        <Cross2Icon className="text-4xl" />
                      </button>
                    </Dialog.Close>
                  </div>
                </Dialog.Content>
              </motion.div>
            </Dialog.Overlay>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
};
