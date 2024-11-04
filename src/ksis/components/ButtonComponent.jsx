import React from "react";
import { Link } from "react-router-dom";

const ButtonComponent = ({
  to,
  onClick,
  color = "blue", // 기본값을 blue로 설정
  type = "button",
  children,
}) => {
  // blue 색상용 클래스
  const blueButtonClass = `mr-2 rounded-md border border-blue-600 
    bg-white text-blue-600 py-1 px-2 text-sm font-semibold shadow-sm 
    hover:bg-blue-600 hover:text-white hover:shadow-inner hover:shadow-blue-800 
    focus-visible:outline-blue-600 transition duration-200 whitespace-nowrap`;

  // red 색상용 클래스
  const redButtonClass = `mr-2 rounded-md border border-red-600 
    bg-white text-red-600 py-1 px-2 text-sm font-semibold shadow-sm 
    hover:bg-red-600 hover:text-white hover:shadow-inner hover:shadow-red-800 
    focus-visible:outline-red-600 transition duration-200 whitespace-nowrap`;

  const orangeButtonClass = `mr-2 rounded-md border border-[#FF9C00]
    bg-white text-[#FF9C00] py-1 px-2 text-sm font-semibold shadow-sm 
    hover:bg-[#FF9C00] hover:text-white hover:shadow-inner hover:shadow-[#FF9C00] 
    focus-visible:outline-[#FF9C00] transition duration-200 whitespace-nowrap`;

  // color에 따라 올바른 클래스 선택
  const buttonClass =
    color === "blue"
      ? blueButtonClass
      : color === "orange"
      ? orangeButtonClass
      : redButtonClass;

  return to ? (
    <Link to={to}>
      <button type={type} className={buttonClass}>
        {children}
      </button>
    </Link>
  ) : (
    <button type={type} className={buttonClass} onClick={onClick}>
      {children}
    </button>
  );
};

export default ButtonComponent;
