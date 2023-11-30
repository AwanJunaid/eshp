// ProductItem.jsx
import React from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { ADD_TO_CART, CALCULATE_TOTAL_QUANTITY } from "../../../redux/slice/cartSlice";
import Card from "../../card/Card";
import styles from "./ProductItem.module.scss";
import NextArrow from "../NextArrow/NextArrow"; // Update the path if needed
import PrevArrow from "../PrevArrow/PrevArrow"; // Update the path if needed

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ProductItem = ({ product, grid, id, name, price, desc, imageURLs }) => {
  const dispatch = useDispatch();

  const shortenText = (text, n) => {
    if (text.length > n) {
      const shortenedText = text.substring(0, n).concat("...");
      return shortenedText;
    }
    return text;
  };

  const addToCart = (product) => {
    dispatch(ADD_TO_CART(product));
    dispatch(CALCULATE_TOTAL_QUANTITY());
  };

  // Slick carousel settings with custom arrows
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <Card cardClass={grid ? `${styles.grid}` : `${styles.list}`}>
      <Link to={`/product-details/${id}`}>
        <div className={styles.img}>
          <Slider {...sliderSettings}>
            {imageURLs.map((url, index) => (
              <div key={index}>
                <img src={url} alt={`${name}-image-${index + 1}`} />
              </div>
            ))}
          </Slider>
        </div>
      </Link>
      <div className={styles.content}>
        <div className={styles.details}>
          <p>{`PKR${price}`}</p>
          <h4>{shortenText(name, 18)}</h4>
        </div>
        {!grid && <p className={styles.desc}>{shortenText(desc, 200)}</p>}

        <button
          className="--btn --btn-danger"
          onClick={() => addToCart(product)}
        >
          Add To Cart
        </button>
      </div>
    </Card>
  );
};

export default ProductItem;
