import Image from "next/image";

export const Footer = (): JSX.Element => {
  return (
    <footer className="flex flex-row justify-evenly items-center text-xl">
      <div>
        Where you can find us
        <div className="flex flex-row justify-evenly py-[10px]">
          <a href="https://github.com/mattzcarey/code-review-gpt">
            <Image src="/githubLogo.svg" alt={"github logo"} width={40} height={40} />
          </a>
          <a href="https://twitter.com/intent/follow?screen_name=oriontools.ai">
            <Image src="/twitterLogo.svg" alt={"twitter logo"} width={40} height={40} />
          </a>
          <a href="https://join.slack.com/t/orion-tools/shared_invite/zt-20x79nfgm-UGIHK1uWGQ59JQTpODYDwg">
            <Image src="/slackLogo.svg" alt={"slack logo"} width={40} height={40} className="scale-[2]" />
          </a>
        </div>
      </div>
      <div>
        Our Sponsors ❤️
        <div className="flex flex-row justify-evenly py-[10px]">
          <a href="https://www.quivr.app/">
            <Image src="https://github.com/mattzcarey/code-review-gpt/assets/77928207/30361248-3159-4535-8efb-b114989ae886" alt={"quiver logo"} width={40} height={40} />
          </a>
          <a href="https://www.aleios.com/">
            <Image src="https://github.com/mattzcarey/code-review-gpt/assets/77928207/a47c2460-b866-433f-a4c9-efb5737d4fed" alt={"aleios logo"} width={40} height={40} />
          </a>
        </div>
      </div>
    </footer>
  );
};
Footer.displayName = 'Footer';
export default Footer;
