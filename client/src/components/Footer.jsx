import React from "react";

const Footer = () => {
  return (
    <footer className="bg-quaternary mt-20 lg:mt-44">
      <div className="mx-auto container text-center text-primary px-7 sm:px-32 pt-10 pb-5">
        <div>
          <h1 className="font-Libre text-2xl">TrialTrack</h1>
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
