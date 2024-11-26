import React from 'react';
import './styles.css'; // Assuming you have some CSS for styling
import SidePanel from '../../components/SidePanel'; // Import the SidePanel component
import logo from '../../assets/CinerateLogo.png'; // Import the logo

const AboutUs = ({ connectionStatus, handleStatusClick }) => {
  return (
    <div className="about-us">
      <SidePanel connectionStatus={connectionStatus} handleStatusClick={handleStatusClick} /> {/* Include the SidePanel */}
      <div className="logo-container">
        {/* Temporarily replace the image with a placeholder image */}
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