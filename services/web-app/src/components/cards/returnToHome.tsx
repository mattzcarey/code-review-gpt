import Link from "next/link";

interface ReturnToHomeProps {
  message: string;
}
export const ReturnToHome: React.FC<ReturnToHomeProps> = ({ message }) => {
  return (
    <div>
      <p className="text-xl flex justify-center mt-16 ml-10">{message}</p>
      <Link
        className="text-xl underline flex justify-center mb-5 ml-10"
        href="/"
      >
        Click here to return to home page.
      </Link>
    </div>
  );
};
