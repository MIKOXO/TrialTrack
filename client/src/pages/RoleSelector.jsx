import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaUserCog, FaGavel } from "react-icons/fa";
import Logo from "../components/Logo";

const RoleSelector = () => {
  const navigate = useNavigate();

  const handleSelect = (role) => {
    navigate(`/signin?role=${role}`);
  };

  return (
    <section className="mx-auto container px-7 lg:px-32 mt-10">
      <div>
        <Logo />
      </div>

      <div className="mt-20 text-2xl font-light font-Lexend text-center">
        <h1>Please select your role to continue</h1>
      </div>

      <div className="font-Lexend grid grid-cols-1 gap-5 lg:grid-cols-3">
        <button onClick={() => handleSelect("Client")}>
          <div className="cursor-pointer mt-20 py-14  text-center rounded-lg shadow-lg hover:shadow-400 ease-in-out duration-300">
            <div className="flex flex-col items-center">
              <FaUser className="text-5xl text-tertiary" />
              <p className="mt-6 text-xl font-light">Login As A Client</p>
            </div>
          </div>
        </button>

        <button onClick={() => handleSelect("Judge")}>
          <div className="cursor-pointer mt-20 py-14  text-center rounded-lg shadow-lg hover:shadow-400 ease-in-out duration-300">
            <div className="flex flex-col items-center">
              <FaGavel className="text-5xl text-tertiary" />
              <p className="mt-6 text-xl font-light">Login As A Judge</p>
            </div>
          </div>
        </button>

        <button onClick={() => handleSelect("Admin")}>
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
