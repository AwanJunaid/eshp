import React from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import './PrevStyls.scss';

const PrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div className={`${className} arrow prev`} style={{ ...style, display: "block" }} onClick={onClick}>
      <AiOutlineArrowLeft className="arrow-icon" />
    </div>
  );
};

export default PrevArrow;