import { Features, Hero } from "../components/home";
("use client");

export default function Home(): JSX.Element {
  return (
    <div className="w-full h-full">
      <Hero />
      <Features />
    </div>
  );
}
