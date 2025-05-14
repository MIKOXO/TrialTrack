import React from "react";
import { Link } from "react-scroll";

const Footer = () => {
  return (
    <footer className="bg-quaternary mt-20 lg:mt-44">
      <div className="mx-auto container text-center text-primary px-7 sm:px-32 pt-10 pb-5">
        <div>
          <h1 className="font-Libre text-2xl">TrialTrack</h1>
        </div>

        <div className="gap-10 flex flex-col lg:flex-row items-center justify-center mt-10">
          <Link to="/" className="links2">
            Home
          </Link>
          <Link to="/" className="links2">
            About
          </Link>
          <Link to="/" className="links2">
            Features
          </Link>
          <Link to="/" className="links2">
            Contact
          </Link>
        </div>

        <div>
          <p className="mt-10 font-Lexend font-light">
            {new Date().getFullYear()} TrialTrack. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
