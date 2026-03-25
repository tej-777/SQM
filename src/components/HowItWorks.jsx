import React from "react";
import { motion } from "framer-motion";
import hospital from "../assets/hospital.png";
import queue from "../assets/queue.png";
import notification from "../assets/notification.png";


const HowItWorks = () => {

  const steps = [
    {
      icon: hospital,
      title: "Select Hospital",
      description: "Choose your hospital and department easily from list."
    },
    {
      icon: queue,
      title: "Join Queue",
      description: "Enter your details and receive a digital token instantly."
    },
    {
      icon: notification,
      title: "Get Notified",
      description: "Track your position and get notified when your turn is near."
    }
  ];

  return (
    <section
      id="How-It-Works"
      className="w-screen bg-[#0f172a] py-16 sm:py-24"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          <span className="inline-block mb-5 mt-1 rounded-full bg-blue-100 px-4 py-1 text-md font-semibold text-blue-700">
            How It Works
          </span>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 sm:mb-6">
            Get Started in{" "}
            <span className="bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              3 Simple Steps
            </span>
          </h2>

          <p className="mt-5 text-base sm:text-xl text-gray-300">
            Join hospital queues remotely and save valuable time.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ 
                scale: 1.03,
                boxShadow: "0 10px 40px rgba(99, 102, 241, 0.3)"
              }}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-[#1e293b] border border-gray-700 rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center cursor-pointer relative min-h-[300px] sm:min-h-[320px]"
            >
              {/* Step Number */}
              <div className="absolute top-4 left-4">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: index * 0.2 }}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center text-sm sm:text-base font-bold z-10 border-2 border-[#1e293b]"
                >
                  {index + 1}
                </motion.div>
              </div>

              {/* Icon */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
                className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl mx-auto mb-3 sm:mb-4 bg-blue-100 flex items-center justify-center"
              >
                <img src={step.icon} alt={step.title} className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
              </motion.div>

              <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-2 sm:mb-3">
                {step.title}
              </h3>

              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed flex-grow">
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
