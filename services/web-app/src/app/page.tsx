"use client"
import { Features, Hero } from "../components/home";

export default function Home(): JSX.Element {
  return (
    <div className="w-full h-full">
      <Hero />
      <Features />
    </div>
  );
}
