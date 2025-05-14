import React from "react";

const Feature = (prop) => {
  return (
    <section className="font-Lexend rounded-lg shadow-lg cursor-pointer hover:shadow-400 ease-in-out duration-300 p-8 text-center">
      <div className="space-y-8">
        {/* Icon */}
        <div className="text-tertiary text-4xl justify-center flex">
          {prop.icon}
        </div>

        {/* Title */}
        <div>
          <h1 className="text-tertiary text-xl">{prop.title}</h1>
        </div>

        {/* Description */}
        <div>
          <p className="text-secondary font-light">{prop.text}</p>
        </div>
      </div>
    </section>
  );
};

export default Feature;
