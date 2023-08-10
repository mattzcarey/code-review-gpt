import Image from "next/image";
import GithubImg from "../../../public/github-mark-white.svg";

export const Footer = (): JSX.Element => {
  return (
    <footer className='flex flex-row justify-center'>
      <a href="https://github.com/mattzcarey/code-review-gpt">
          <Image src={GithubImg} alt={"Github logo"} className="p-[10px] w-[60px]" />
      </a>
    </footer>
  );
};
Footer.displayName = 'Footer';
export default Footer;
