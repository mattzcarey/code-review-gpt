import Image from "next/image";
import Link from "next/link";

export const Logo = (): JSX.Element => {
  return (
    <Link className="flex items-center mb-2" href="/">
      <div className="rounded-full overflow-hidden w-12 h-12">
        <Image src="/icon.png" alt={"orion logo"} width={100} height={100} />
      </div>
      <span className="text-2xl text-white font-extralight ml-4">
        Code Review GPT
      </span>
    </Link>
  );
};

Logo.displayName = "Logo";
export default Logo;
