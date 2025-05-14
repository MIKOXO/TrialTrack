import { useState } from "react";
import { IoIosLogIn, IoIosMenu, IoIosClose } from "react-icons/io";
import { Link } from "react-router-dom";
import { MdLogin } from "react-icons/md";
import Logo from "./Logo";
// import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="">
      <div className="mx-auto container p-5 flex flex-row items-center justify-between lg:justify-around gap-6">
        {/* Logo */}
        <div>
          <Logo />
        </div>

        {/* Links */}
        <div className="hidden gap-10 lg:flex">
          <Link to="/" className="links">
            Home
          </Link>
          <Link to="/" className="links">
            About
          </Link>
          <Link to="/" className="links">
            Features
          </Link>
          <Link to="/" className="links">
            Contact
          </Link>
        </div>

        {/* Login Link */}
        <div className="hidden lg:flex cursor-pointer">
          <Link
            to="/roleselector"
            className="font-Lexend flex flex-row items-center gap-2 bg-tertiary shadow-400 hover:scale-95 ease-in-out duration-300 text-primary px-8 py-2 rounded-md"
          >
            Login
            <MdLogin className="text-xl" />
          </Link>
        </div>

        {/* Hamburger Menu */}
        <div className="lg:hidden">
          <button className="" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? (
              <IoIosClose className="text-3xl " />
            ) : (
              <IoIosMenu className="text-3xl " />
            )}
          </button>

          <div
            className={`${
              isOpen ? "block" : "hidden"
            } w-full fixed top-20 left-0 flex flex-col gap-6 items-center mt-10 py-5 bg-primary shadow-md`}
          >
            <Link to="/" className="links">
              Home
            </Link>
            <Link to="/" className="links">
              About
            </Link>
            <Link to="/" className="links">
              Features
            </Link>
            <Link to="/" className="links">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
