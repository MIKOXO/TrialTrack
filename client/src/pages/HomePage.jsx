import React from "react";
import Navbar from "../components/Navbar";
import IMG3 from "../assets/IMG3.jpg";
import IMG5 from "../assets/IMG5.jpg";
import { Link } from "react-router-dom";
import Features from "../components/Features";
import Footer from "../components/Footer";
import useScrollAnimation from "../hooks/useScrollAnimation";

const HomePage = () => {
  const [heroRef, heroVisible] = useScrollAnimation();
  const [secondSectionRef, secondSectionVisible] = useScrollAnimation();
  const [featuresRef, featuresVisible] = useScrollAnimation();
  const [ctaRef, ctaVisible] = useScrollAnimation();

  return (
    <main>
      <Navbar />

      <section
        ref={heroRef}
        className={`mx-auto container px-7 sm:px-32 mt-10 transition-all duration-1000 ease-out ${
          heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="font-Lexend flex flex-col-reverse items-center justify-between sm:flex-row">
          <div
            className={`transition-all duration-1000 ease-out delay-200 ${
              heroVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
            }`}
          >
            <h1 className="text-3xl text-tertiary text-center w-full sm:text-left lg:text-5xl font-light sm:w-[70%] ">
              Streamline Your Court Cases With Ease
            </h1>
            <p className="text-secondary text-center sm:text-left sm:w-[70%] mt-5 font-light">
              Our innovative court case management system simplifies the legal
              process for all parties involved. Experience seamless
              collaboration, efficient tracking, and enhanced communication.
            </p>
            <div className="mt-6 flex items-center justify-center sm:justify-start">
              <Link
                to="/signup"
                className="bg-tertiary text-primary px-8 py-3 rounded-md shadow-400 hover:scale-95 ease-in-out duration-300"
              >
                Get Started
              </Link>
            </div>
          </div>

          <div
            className={`transition-all duration-1000 ease-out delay-400 ${
              heroVisible
                ? "opacity-100 translate-x-0 scale-100"
                : "opacity-0 translate-x-10 scale-95"
            }`}
          >
            <img
              src={IMG3}
              className="mb-10 h-[20rem] w-[10rem] sm:h-[28rem] sm:w-[28rem] shadow-500 object-fill rounded-xl sm:mb-0"
            />
          </div>
        </div>
      </section>

      <section
        ref={secondSectionRef}
        className={`mx-auto container px-7 sm:px-32 mt-10 lg:mt-44 transition-all duration-1000 ease-out ${
          secondSectionVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <div className="font-Lexend flex flex-col items-center justify-between sm:flex-row">
          <div
            className={`transition-all duration-1000 ease-out delay-200 ${
              secondSectionVisible
                ? "opacity-100 translate-x-0 scale-100"
                : "opacity-0 -translate-x-10 scale-95"
            }`}
          >
            <img
              src={IMG5}
              className="mb-10 h-[20rem] w-[10rem] sm:h-[28rem] sm:w-[44rem] shadow-500 object-fill rounded-xl sm:mb-0"
            />
          </div>

          <div
            className={`lg:ml-44 transition-all duration-1000 ease-out delay-400 ${
              secondSectionVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-10"
            }`}
          >
            <h1 className="text-3xl text-tertiary text-center w-full sm:text-left lg:text-5xl font-light sm:w-[80%]">
              Effortless Court Case Management
            </h1>
            <p className="text-secondary text-center sm:text-left sm:w-[80%] mt-5 font-light">
              Our system streamlines case tracking, document management, and
              scheduling. With secure automation and an intuitive interface,
              legal professionals can work more efficiently and stay organized.
            </p>
          </div>
        </div>
      </section>

      <section
        ref={featuresRef}
        className={`transition-all duration-1000 ease-out ${
          featuresVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <Features />
      </section>

      <section
        ref={ctaRef}
        className={`container mx-auto px-7 sm:px-32 mt-20 lg:mt-44 transition-all duration-1000 ease-out ${
          ctaVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="font-Lexend flex flex-col items-start gap-10 lg:flex-row">
          <div
            className={`transition-all duration-1000 ease-out delay-200 ${
              ctaVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
            }`}
          >
            <h1 className="text-3xl text-tertiary text-center w-full sm:text-left lg:text-5xl font-light ">
              Transform Your Court Management Today
            </h1>
          </div>

          <div
            className={`transition-all duration-1000 ease-out delay-400 ${
              ctaVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-10"
            }`}
          >
            <p className="text-secondary text-center sm:text-left sm:w-[90%] font-light">
              Experience the future of court case management with our innovative
              system. Sign up for a demo and discover how we can streamline your
              processes.
            </p>
            <div className="mt-6 flex items-center justify-center sm:justify-start">
              <Link
                to="/signup"
                className="bg-tertiary text-primary px-8 py-3 rounded-md shadow-400 hover:scale-95 ease-in-out duration-300"
              >
                Sign Up Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default HomePage;
