import React from 'react';
import Meter from '../RatingMeterActor';
import './styles.css';

const RatingBox = ({ name, movie_count, budget, genre, imdbRating, popularity }) => {
    
    const formattedBudget = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(budget);

    return (
        <div className="rating-box-container">
            <div className="rating-box-text">           
                <div className="rating-box-title">{name}</div>
                <div className="rating-box-description">
                    Total Movies Acted:<br/> <span className = "renderedTxt">{movie_count}</span><br />
                    Average Movie Budget:<br/> <span className = "renderedTxt">{formattedBudget}</span><br />
                    Most Common Genre:<br/> <span className = "renderedTxt">{genre}</span><br />
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