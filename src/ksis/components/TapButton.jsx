import React from 'react';

const TabButton = ({ label, path, isActive, onClick }) => (
    <div className={`border-b-2 ${isActive ? "border-[#FF9C00]" : "border-gray-200 hover:border-[#FF9C00]"}`}>
        <button
            className={`px-6 py-2 rounded-t-lg font-semibold border ${
                isActive 
                    ? "text-black bg-white border-gray-300 border-b-0" 
                    : "text-gray-500 bg-gray-100 border-transparent hover:border-gray-300 hover:bg-white hover:text-black"
            }`}
            onClick={onClick}
        >
            {label}
        </button>
    </div>
);

export default TabButton;