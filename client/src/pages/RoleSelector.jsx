import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaUserCog, FaGavel } from "react-icons/fa";
import Logo from "../components/Logo";
import usePageLoadAnimation from "../hooks/usePageLoadAnimation";

const RoleSelector = () => {
  const navigate = useNavigate();
  const logoVisible = usePageLoadAnimation(100);
  const headingVisible = usePageLoadAnimation(300);
  const cardsVisible = usePageLoadAnimation(500);

  const handleSelect = (role) => {
    navigate(`/signin?role=${role}`);
  };

  return (
    <section className="mx-auto container px-7 lg:px-32 mt-10">
      <div
        className={`transition-all duration-1000 ease-out ${
          logoVisible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-10 scale-95"
        }`}
      >
        <Logo />
      </div>

      <div
        className={`mt-20 text-2xl font-light font-Lexend text-center transition-all duration-1000 ease-out ${
          headingVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <h1>Please select your role to continue</h1>
      </div>

      <div className="font-Lexend grid grid-cols-1 gap-5 lg:grid-cols-3">
        <button
          onClick={() => handleSelect("Client")}
          className={`transition-all duration-1000 ease-out ${
            cardsVisible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-10 scale-95"
          }`}
          style={{ transitionDelay: cardsVisible ? "0ms" : "0ms" }}
        >
          <div className="cursor-pointer mt-20 py-14  text-center rounded-lg shadow-lg hover:shadow-400 ease-in-out duration-300">
            <div className="flex flex-col items-center">
              <FaUser className="text-5xl text-tertiary" />
              <p className="mt-6 text-xl font-light">Login As A Client</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleSelect("Judge")}
          className={`transition-all duration-1000 ease-out ${
            cardsVisible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-10 scale-95"
          }`}
          style={{ transitionDelay: cardsVisible ? "200ms" : "0ms" }}
        >
          <div className="cursor-pointer mt-20 py-14  text-center rounded-lg shadow-lg hover:shadow-400 ease-in-out duration-300">
            <div className="flex flex-col items-center">
              <FaGavel className="text-5xl text-tertiary" />
              <p className="mt-6 text-xl font-light">Login As A Judge</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleSelect("Admin")}
          className={`transition-all duration-1000 ease-out ${
            cardsVisible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-10 scale-95"
          }`}
          style={{ transitionDelay: cardsVisible ? "400ms" : "0ms" }}
        >
          <div className="cursor-pointer mt-20 py-14  text-center rounded-lg shadow-lg hover:shadow-400 ease-in-out duration-300">
            <div className="flex flex-col items-center">
              <FaUserCog className="text-5xl text-tertiary" />
              <p className="mt-6 text-xl font-light">Login As An Admin</p>
            </div>
          </div>
        </button>
      </div>
    </section>
  );
};

export default RoleSelector;
