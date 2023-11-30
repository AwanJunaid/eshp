import React from "react";
import { AiOutlineArrowRight } from "react-icons/ai";

import "./NextArrowStyles.scss";
const NextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div className={`${className} arrow next`} style={{ ...style, display: "block" }} onClick={onClick}>
      <AiOutlineArrowRight className="arrow-icon" />
    </div>
  );
};

export default NextArrow;