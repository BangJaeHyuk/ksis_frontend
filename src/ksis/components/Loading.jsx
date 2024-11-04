import React from "react";
import { PacmanLoader } from "react-spinners";

const Loading = () => {
  return (
    <div className="h-full w-full flex  items-center justify-center min-h-screen">
      <PacmanLoader color="#FF9C00" />
    </div>
  );
};

export default Loading;
