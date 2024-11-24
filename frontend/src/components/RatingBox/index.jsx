import React from 'react';
import Meter from '../../components/RatingMeter';
import TextLooper from '../ChangingWords';
import './styles.css';

const RatingBox = ({ title, director, starring, genre, imdbRating, popularity }) => {
    const renderTextLooper = (texts) => {
        console.log(texts);
        if (Array.isArray(texts)) {
            if (texts[0] === "Unknown") {
                return "-";
            }
            return texts.length > 1 ? <TextLooper texts={texts} /> : texts[0];
        }
    
        return texts === "Unknown" ? "-" : texts; // Return texts directly
    };

    return (
        <div className="rating-box-container">
            <div className="rating-box-text">
                
                <div className="rating-box-title">{title}</div>
                <div className="rating-box-description">
                    Directed by: <span className = "renderedTxt">{renderTextLooper(director)}</span><br />
                    Starring: <span className = "renderedTxt">{renderTextLooper(starring)}</span><br />
                    Genre: <span className = "renderedTxt">{renderTextLooper(genre)}</span><br />
                </div>
            </div>
            <div className="rating-box">
                <div className="rating-box-imdb">
                    <Meter value={imdbRating} />
                    <div className="rating-box-label">IMDB Rating</div>
                </div>
                <div className="rating-box-popular">
                    <Meter value={popularity} />
                    <div className="rating-box-label">Popularity</div>
                </div>
            </div>
        </div>
    );
};

export default RatingBox;