// src/components/TabButton.js
import React from "react";
import { useNavigate } from "react-router-dom";

const TabButton = ({ isActive, label, onClick }) => {
  return (
    <div className={`border-b-2 ${isActive ? 'border-[#FF9C00]' : 'border-gray-200 hover:border-b-2 hover:border-b-[#FF9C00]'}`}>
      <button
        className={`px-6 py-2 rounded-t-lg font-semibold border 
          ${isActive ? 'text-black bg-white border-gray-300 border-b-0' : 'text-gray-500 bg-gray-100 border-transparent '}
          ${!isActive ? 'hover:text-black hover:bg-white hover:border-solid hover:border-gray-200' : ''}
        `}
        onClick={onClick}
      >
        {label}
      </button>
    </div>
  );
};

const TabButtons = ({ currentPath, imageBoardPath, videoBoardPath }) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-end mb-4">
      <div className="w-auto flex space-x-2">
        <TabButton
          isActive={currentPath === imageBoardPath}
          label="이미지"
          onClick={() => navigate(imageBoardPath)}
        />
        <TabButton
          isActive={currentPath === videoBoardPath}
          label="영상"
          onClick={() => navigate(videoBoardPath)}
        />
      </div>
    </div>
  );
};

export default TabButtons;
