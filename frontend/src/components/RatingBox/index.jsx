import React from 'react';
import Meter from '../../components/RatingMeter';
import TextLooper from '../ChangingWords';
import './styles.css';

const RatingBox = ({ title, director, starring, genre, imdbRating, popularity }) => {

    const renderTextLooper = (texts) => {
        console.log(texts);
        if (Array.isArray(texts)) {
            return texts.length > 1 ? <TextLooper texts={texts} /> : texts[0];
        }
        return texts;
    };

    return (
        <div className="rating-box-container">
            <div className="rating-box-text">
                
                <div className="rating-box-title">{title}</div>
                <div className="rating-box-description">
                    Directed by: {renderTextLooper(director)}<br />
                    Starring: {renderTextLooper(starring)}<br />
                    Genre: {renderTextLooper(genre)}<br />
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