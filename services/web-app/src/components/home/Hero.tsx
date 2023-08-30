import { Button, Link } from "@radix-ui/themes";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import React, { useRef } from "react";
import { MdNorthEast } from "react-icons/md";

export function Hero() {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const scaleSync = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const scale = useSpring(scaleSync, { mass: 0.1, stiffness: 100 });

  const position = useTransform(scrollYProgress, (pos) => {
    if (pos === 1) {
      return "relative";
    }

    return "sticky";
  });

  const videoScaleSync = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);
  const videoScale = useSpring(videoScaleSync, { mass: 0.1, stiffness: 100 });

  const opacitySync = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const opacity = useSpring(opacitySync, { mass: 0.1, stiffness: 200 });

  return (
    <section
      ref={targetRef}
      className="relative w-full flex flex-col gap-24 items-center text-center min-h-[768px] py-12"
    >
      <motion.div
        style={{ scale, opacity, position }}
        className="top-24 -z-0 flex flex-col gap-2 items-center justify-center pt-24"
      >
        <h1 className="text-3xl sm:text-5xl font-bold max-w-lg sm:max-w-xl">
          Empower Developers with{" "}
          <span className="text-primary">Orion Review</span>
        </h1>
        <p className="text-base max-w-sm text-gray-500 mb-5 sm:mb-10">
          Orion Review uses Large Language Models to review code in your CI/CD
          pipeline.
        </p>
        <Link href={"/installation"}>
          <Button size={"4"}>Install</Button>
        </Link>
        <Link
          target="_blank"
          href={"https://github.com/mattzcarey/code-review-gpt/"}
        >
          <Button variant={"ghost"}>
            Github <MdNorthEast />
          </Button>
        </Link>
      </motion.div>
      <motion.video
        style={{ scale: videoScale }}
        className="rounded-md max-w-screen-lg shadow-lg dark:shadow-white/25 border dark:border-white/25 w-full bg-white dark:bg-black"
        src="https://user-images.githubusercontent.com/77928207/253059283-92029baf-f691-465f-8d15-e1363fcb808e.mp4"
        autoPlay
        muted
        loop
      />
    </section>
  );
}
