import React from "react";
import { motion } from "framer-motion";
import hospital from "../assets/hospital.png";
import queue from "../assets/queue.png";
import notification from "../assets/notification.png";


const HowItWorks = () => {

  const steps = [
    {
      icon: (
        <img src={hospital} alt="Select Hospital" className="w-8 h-8" />
      ),
      title: "Select Hospital",
      description: "Choose your hospital and department easily from list."
    },
    {
      icon: (
        <img src={queue} alt="Join Queue" className="w-8 h-8" />
      ),
      title: "Join Queue",
      description: "Enter your details and receive a digital token instantly."
    },
    {
      icon: (
        <img src={notification} alt="Get Notified" className="w-8 h-8" />
      ),
      title: "Get Notified",
      description: "Track your position and get notified when your turn is near."
    }
  ];

  return (
    <section
      id="How-It-Works"
      className="relative bg-blue-200 flex items-center justify-center min-h-screen mask-[linear-gradient(to_top,transparent,black_15%,black_80%,transparent)] "
    >
      
      <div className="max-w-8xl ">

        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          <span className="inline-block mb-5 mt-1 rounded-full bg-blue-100 px-4 py-1 text-md font-semibold text-blue-700 pt-1">
            How It Works
          </span>

          <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-5">
            Get Started in{" "}
            <span className="bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              3 Simple Steps
            </span>
          </h2>

          <p className="mt-5 text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Join hospital queues remotely and save valuable time.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 justify-items-center">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative w-full max-w-sm h-72 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition flex flex-col items-center justify-center"
              whileHover={{ y: -4 }}
            >
              {/* Step Number */}
              <div className="absolute -top-3 -left-3 w-9 h-9 p-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>

              {/* Icon */}
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-blue-100">
                {step.icon}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 text-center mb-3">
                {step.title}
              </h3>

              <p className="text-sm text-gray-600 text-center leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
