import { Link } from "react-router-dom";
import { MdLogin } from "react-icons/md";
import Logo from "./Logo";

const Navbar = () => {
  return (
    <header className="">
      <div className="mx-auto lg:pt-5 lg:px-32 container p-2 flex flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div>
          <Logo />
        </div>

        {/* Login Link */}
        <div className="flex cursor-pointer">
          <Link
            to="/roleselector"
            className="font-Lexend flex flex-row items-center gap-2 bg-tertiary shadow-400 hover:scale-95 ease-in-out duration-300 text-primary px-8 py-2 rounded-md"
          >
            Login
            <MdLogin className="text-xl" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
