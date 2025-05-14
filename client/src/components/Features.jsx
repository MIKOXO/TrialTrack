import React from "react";
import Feature from "./Feature";
import { FaShieldAlt, FaCalendarAlt, FaBell } from "react-icons/fa";

const Features = () => {
  return (
    <section className="font-Lexend mx-auto container px-7 sm:px-32 mt-10 lg:mt-44">
      <div>
        <h1 className="text-3xl text-tertiary text-center w-full lg:text-5xl font-light">
          Explore Our Comprehensive Features for Efficient Court Case Management
        </h1>
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Feature
          icon={<FaShieldAlt />}
          title="Secure Document Storage for Peace of Mind and Accessibility"
          text="Store all your important documents securely in one place"
        />
        <Feature
          icon={<FaCalendarAlt />}
          title="Seamless Calendar Integration to Manage Your Court Dates Effectively"
          text="Easily sync your court dates with your personal calendar."
        />
        <Feature
          icon={<FaBell />}
          title="Automated Reminders to Keep You Organized and On Schedule"
          text="Receive timely notifications for important deadlines and appointments."
        />
      </div>
    </section>
  );
};

export default Features;
