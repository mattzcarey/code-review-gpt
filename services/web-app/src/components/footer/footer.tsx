import Image from "next/image";

export const Footer = (): JSX.Element => {
  return (
    <footer className="flex flex-col items-center text-l text-white fixed bottom-0 left-0 w-full bg-black py-1">
      Join the community
      <div className="flex flex-row justify-evenly py-2 space-x-4">
          <a href="https://github.com/mattzcarey/code-review-gpt">
            <Image src="/githubLogo.svg" alt={"github logo"} width={20} height={20} />
          </a>
          <a href="https://twitter.com/intent/follow?screen_name=oriontools.ai">
            <Image src="/twitterLogo.svg" alt={"twitter logo"} width={20} height={20} />
          </a>
          <a href="https://join.slack.com/t/orion-tools/shared_invite/zt-20x79nfgm-UGIHK1uWGQ59JQTpODYDwg">
            <Image src="/slackLogo.png" alt={"slack logo"} width={20} height={20} />
          </a>
      </div>
    </footer>
  );
};

Footer.displayName = 'Footer';
export default Footer;
