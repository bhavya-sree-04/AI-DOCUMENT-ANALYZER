import React, {

  useState

} from "react";

import {

  Link,
  useNavigate

} from "react-router-dom";

import {

  signIn

} from "aws-amplify/auth";



const Login = () => {
    const navigate =
  useNavigate();

const [email, setEmail] =
  useState("");

const [password, setPassword] =
  useState("");
  const [errorMessage,

setErrorMessage] =
  useState("");
  const handleLogin =
async () => {

  try {

    await signIn({

      username: email,

      password
    });


   window.location.href =
  "/dashboard";

  } catch (error) {

  console.error(error);

  if (

    error.name ===

    "UserAlreadyAuthenticatedException"

  ) {

    window.location.href =
      "/dashboard";

    return;
  }

  setErrorMessage(
    "Invalid email or password"
  );
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
        max-w-6xl
        grid
        md:grid-cols-2
        bg-[#111827]
        rounded-3xl
        overflow-hidden
        border
        border-gray-800
        shadow-2xl
      ">

        {/* LEFT SIDE */}

        <div className="
          hidden
          md:flex
          flex-col
          justify-center
          px-12
          bg-gradient-to-br
          from-purple-600/20
          to-[#111827]
          relative
        ">

          <div className="
            absolute
            w-72
            h-72
            bg-purple-500/20
            rounded-full
            blur-3xl
            top-10
            left-10
          "></div>

          <h1 className="
            text-5xl
            font-bold
            text-white
            relative
            z-10
          ">

            SmartDoc AI

          </h1>

          <p className="
            text-gray-300
            mt-6
            text-lg
            relative
            z-10
          ">

            AI Document Intelligence Platform

          </p>

        </div>


        {/* RIGHT SIDE */}

        <div className="
          p-10
          md:p-14
          flex
          flex-col
          justify-center
        ">

          <h2 className="
            text-4xl
            font-bold
            text-white
            mb-8
          ">

            Login

          </h2>

          <input

            type="email"

            placeholder="Email"

            value={email}

onChange={(e) => {

  setEmail(
    e.target.value
  );

  setErrorMessage("");
}}

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

            type="password"

            placeholder="Password"
            value={password}

onChange={(e) => {

  setPassword(
    e.target.value
  );

  setErrorMessage("");
}}

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
          {errorMessage && (

  <p className="
    text-red-400
    text-sm
    mt-2
    mb-4
  ">

    {errorMessage}

  </p>

)}

          <button onClick={handleLogin}

            className="
            w-full
            bg-purple-600
            hover:bg-purple-700
            transition
            p-4
            rounded-xl
            text-white
            font-semibold
            shadow-lg
            shadow-purple-500/20
          ">

            Login

          </button>
          <p className="
  text-gray-400
  text-sm
  mt-6
  text-center
">

  Don’t have an account?{" "}

  <Link

    to="/signup"

    className="
      text-purple-400
      hover:text-purple-300
    "
  >

    Create Account

  </Link>

</p>

        </div>

      </div>

    </div>
  );
};

export default Login;