import React from 'react';
import { useOutletContext } from 'react-router-dom';
import './styles.css'; 
import logo from '../../assets/CinerateLogo.png'; 

const AboutUs = () => {
  const { connectionStatus, handleStatusClick, setIsAuthenticated } = useOutletContext();

  return (
    <div className="about-us">
      <div className="logo-container">
        <img src={logo} alt="Placeholder Logo" className="img"  />
      </div>
      <div className="content">
        <section className="mission">
          <h2>Our Mission</h2>
          <p>
          To simplify movie discovery for enthusiasts and casual viewers by offering an intuitive, visually engaging platform that makes exploring, comparing, and analyzing IMDb ratings effortless. Cinerate is committed to helping its users make informed and enjoyable viewing choices by turning complex data into accessible insights.
          </p>
        </section>
        <section className="vision">
          <h2>Our Vision</h2>
          <p>
          To be the ultimate tool for movie enthusiasts and casual viewers seeking personalized recommendations and meaningful insights. By transforming how IMDb data is explored, Cinerate aims to enhance the movie-watching experience, empowering users to navigate the vast world of cinema with confidence and ease.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;