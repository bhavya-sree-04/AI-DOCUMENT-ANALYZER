import React, {

  useState

} from "react";

import {

  confirmSignUp

} from "aws-amplify/auth";

import {

  useNavigate

} from "react-router-dom";


const Verify = () => {

  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState("");

  const [code, setCode] =
    useState("");


  const handleVerify =
  async () => {

    try {

      await confirmSignUp({

        username: email,

        confirmationCode:
          code
      });

      alert(
        "Verification successful!"
      );

      navigate("/");

    } catch (error) {

      console.error(error);

      alert(error.message);
    }
  };


  return (

    <div className="
      min-h-screen
      bg-[#0f172a]
      flex
      items-center
      justify-center
      px-6
    ">

      <div className="
        w-full
        max-w-md
        bg-[#111827]
        border
        border-gray-800
        rounded-3xl
        p-10
        shadow-2xl
      ">

        <h1 className="
          text-4xl
          font-bold
          text-white
          mb-8
          text-center
        ">

          Verify Account

        </h1>


        <input

          type="email"

          placeholder="Email"

          value={email}

          onChange={(e) =>
            setEmail(e.target.value)
          }

          className="
            w-full
            p-4
            rounded-xl
            bg-[#1f2937]
            border
            border-gray-700
            text-white
            mb-5
            outline-none
            focus:border-purple-500
          "
        />


        <input

          type="text"

          placeholder="Verification Code"

          value={code}

          onChange={(e) =>
            setCode(e.target.value)
          }

          className="
            w-full
            p-4
            rounded-xl
            bg-[#1f2937]
            border
            border-gray-700
            text-white
            mb-6
            outline-none
            focus:border-purple-500
          "
        />


        <button

          onClick={handleVerify}

          className="
            w-full
            bg-purple-600
            hover:bg-purple-700
            transition
            p-4
            rounded-xl
            text-white
            font-semibold
          "
        >

          Verify Account

        </button>

      </div>

    </div>
  );
};

export default Verify;