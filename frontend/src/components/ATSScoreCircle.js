import React from "react";
import { motion } from "framer-motion";

const ATSScoreCircle = ({ score }) => {

  const radius = 90;

  const strokeWidth = 10;

  const normalizedRadius =
    radius - strokeWidth * 2;

  const circumference =
    normalizedRadius * 2 * Math.PI;

  const strokeDashoffset =
    circumference -
    (score / 100) * circumference;


  return (

    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "20px"
      }}
    >

      <div
        style={{
          position: "relative",
          width: "180px",
          height: "180px"
        }}
      >

        <svg
          height="180"
          width="180"
        >

          {/* Background Circle */}
          <circle
            stroke="#2b2b45"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx="90"
            cy="90"
          />


          {/* Animated Progress Circle */}
          <motion.circle
            stroke="#a855f7"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            r={normalizedRadius}
            cx="90"
            cy="90"
            strokeDasharray={circumference}
            initial={{
              strokeDashoffset:
                circumference
            }}
            animate={{
              strokeDashoffset
            }}
            transition={{
              duration: 2
            }}
            style={{
              transform:
                "rotate(-90deg)",
              transformOrigin:
                "50% 50%"
            }}
          />

        </svg>


        {/* Score Text */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform:
              "translate(-50%, -50%)",
            textAlign: "center"
          }}
        >

          <h1
            style={{
              color: "white",
              margin: 0,
              fontSize: "38px"
            }}
          >
            {score}%
          </h1>

          <p
            style={{
              color: "#9ca3af",
              marginTop: "5px"
            }}
          >
            ATS Score
          </p>

        </div>

      </div>

    </div>
  );
};

export default ATSScoreCircle;

