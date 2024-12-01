import React, { useState, useEffect, useRef } from 'react';
import SidePanel from '../../components/SidePanel';
import { StackedBarplot } from '../../components/StackedBarPlot/';
import RatingBox from '../../components/RatingBoxActor';
import CircularBarplot from '../../components/CircularBarPlot/';
import './styles.css';

function ActorRanking({ connectionStatus, handleStatusClick }) { 
    const [overallActors, setOverallActors] = useState([]);
    const [barplotData, setBarplotData] = useState([]);
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState('All Genres'); 
    const [selectedYear, setSelectedYear] = useState("All Years"); 
    const [topActors, setTopActors] = useState([]);
    const [ActorsGenre, setActorsGenre] = useState([]);
    const [isLoadingTopActors, setIsLoadingTopActors] = useState(true);
    const [isLoadingRank, setIsLoadingRank] = useState(true);
    const [isLoadingProlific, setIsLoadingProlific] = useState(true);
    const [isloadingActorsGenre, setisLoadingActorsGenre] = useState(true);

    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const fetchActors = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/actorRanking`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const actorData = await response.json();
                setOverallActors(actorData.actors);
                console.log(actorData.actors);
            } catch (error) {
                console.error('Error overall actors:', error);
            } finally {
                setIsLoadingRank(false); 
            }
        };
        fetchActors();
    }, []);

    useEffect(() => {
        const fetchBarPlotData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/MostProlificActors`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const barPlotRequest = await response.json();
                setBarplotData(barPlotRequest);

                if (barPlotRequest.length > 0) {
                    const extractedGenres = Object.keys(barPlotRequest[0]).filter(key => key !== 'x');
                    setGenres(extractedGenres);
                }
            } catch (error) {
                console.error('Error fetching top prolific actors:', error);
            } finally {
                setIsLoadingProlific(false); 
            }
        };
        fetchBarPlotData();
    }, []);

    useEffect(() => {
        setIsLoadingTopActors(true);
        const fetchTopActors = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/TopActorByGenre?genre=${selectedGenre}&year=${selectedYear}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const topActorsData = await response.json();
                setTopActors(topActorsData.actors);
            } catch (error) {
                console.error('Error fetching top actors by genre:', error);
            } finally {
                setIsLoadingTopActors(false);
            }
        };
        fetchTopActors();
    }, [selectedGenre, selectedYear]);

    useEffect(() => {
        const fetchCircularBarPlot = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/ActorsByGenre`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const circularBarRequest = await response.json();
                setActorsGenre(circularBarRequest);
            } catch (error) {
                console.error('Error fetching top prolific actors:', error);
            } finally {
                setisLoadingActorsGenre(false); 
            }
        };
        fetchCircularBarPlot();
    }, []);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => 1900 + i);
    console.log(ActorsGenre);

    return (
        <div className="actor-dashboard">
            <SidePanel connectionStatus={connectionStatus} handleStatusClick={handleStatusClick} />
            <div className="top-row">
                <div className="bar-container">    
                <h2><strong>Top 5 Most Prolific Actors</strong></h2>
                    {isLoadingProlific ? (
                        <p>Fetching Data...</p>
                    ) : (
                    <StackedBarplot allSubgroups={genres} data={barplotData} width={550} height={475} xLabel='Actors' yLabel='Number of movies' />
                    )}
                </div>
            </div>
            <div className="mid-row">
                <div className="circular-bar-box">
                <h3>Number Of Actors Per Genre</h3>
                    {isloadingActorsGenre ? (
                        <p>Fetching Data...</p>
                    ) : (
                    <CircularBarplot width={400} height={580} data={ActorsGenre} /> 
                    )}
                </div>
                <div className="actor-rank-box">
                    <div className="ovr-container scale-content">
                        <h3>Overall Actor Ranking</h3>
                        {isLoadingRank ? (
                            <p>Fetching Data...</p>
                        ) : (
                            <div className="place-containers">
                                {overallActors.length >= 3 && (
                                    <>
                                        <div className="place-box-wrapper">
                                            <div className="place-number-2">2</div>
                                            <div key={overallActors[1].actor_id} className="place-box place-box-2">
                                                <h3><strong>{overallActors[1].actor_name}</strong></h3><br />
                                                <strong>Average Popularity:</strong><br /> {overallActors[1].average_popularity}<br />
                                                <strong>Average Critic Score:</strong><br /> {overallActors[1].average_imdb_rating}<br />
                                                <strong>Most Common Genre:</strong><br /> {overallActors[1].most_common_genre}<br />
                                                <strong>Number of Movies:</strong><br /> {overallActors[1].movie_count}
                                            </div>
                                        </div>
                                        <div className="place-box-wrapper">
                                            <div className="place-number-1">1</div>
                                            <div key={overallActors[0].actor_id} className="place-box place-box-1">
                                                <h3><strong>{overallActors[0].actor_name}</strong></h3><br />
                                                <strong>Average Popularity:</strong><br /> {overallActors[0].average_popularity}<br />
                                                <strong>Average Critic Score:</strong><br /> {overallActors[0].average_imdb_rating}<br />
                                                <strong>Most Common Genre:</strong><br /> {overallActors[0].most_common_genre}<br />
                                                <strong>Number of Movies:</strong><br /> {overallActors[0].movie_count}
                                            </div>
                                        </div>
                                        <div className="place-box-wrapper">
                                            <div className="place-number-3">3</div>
                                            <div key={overallActors[2].actor_id} className="place-box place-box-3">
                                                <h3><strong>{overallActors[2].actor_name}</strong></h3><br />
                                                <strong>Average Popularity:</strong><br /> {overallActors[2].average_popularity}<br />
                                                <strong>Average Critic Score:</strong><br /> {overallActors[2].average_imdb_rating}<br />
                                                <strong>Most Common Genre:</strong><br /> {overallActors[2].most_common_genre}<br />
                                                <strong>Number of Movies:</strong><br /> {overallActors[2].movie_count}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="watchlist-box">
                    <div className="ovr-container scale-content">
                        <h3>Most Watchlisted Actors</h3>
                        {isLoadingRank ? (
                            <p>Fetching Data...</p>
                        ) : (
                            <div className="place-containers">
                                {overallActors.length === 6 && (
                                    <>
                                        <div className="place-box-wrapper">
                                            <div className="place-number-2">2</div>
                                            <div key={overallActors[4].actor_id} className="place-box place-box-2">
                                                <h3><strong>{overallActors[4].actor_name}</strong></h3><br />
                                                <strong>Average Popularity:</strong><br /> {overallActors[4].average_popularity}<br />
                                                <strong>Average Critic Score:</strong><br /> {overallActors[4].average_imdb_rating}<br />
                                                <strong>Most Common Genre:</strong><br /> {overallActors[4].most_common_genre}<br />
                                                <strong>Watchlist adds:</strong><br /> {overallActors[4].movie_count}
                                            </div>
                                        </div>
                                        <div className="place-box-wrapper">
                                            <div className="place-number-1">1</div>
                                            <div key={overallActors[3].actor_id} className="place-box place-box-1">
                                                <h3><strong>{overallActors[3].actor_name}</strong></h3><br />
                                                <strong>Average Popularity:</strong><br /> {overallActors[3].average_popularity}<br />
                                                <strong>Average Critic Score:</strong><br /> {overallActors[3].average_imdb_rating}<br />
                                                <strong>Most Common Genre:</strong><br /> {overallActors[3].most_common_genre}<br />
                                                <strong>Watchlist adds:</strong><br /> {overallActors[3].movie_count}
                                            </div>
                                        </div>
                                        <div className="place-box-wrapper">
                                            <div className="place-number-3">3</div>
                                            <div key={overallActors[5].actor_id} className="place-box place-box-3">
                                                <h3><strong>{overallActors[5].actor_name}</strong></h3><br />
                                                <strong>Average Popularity:</strong><br /> {overallActors[5].average_popularity}<br />
                                                <strong>Average Critic Score:</strong><br /> {overallActors[5].average_imdb_rating}<br />
                                                <strong>Most Common Genre:</strong><br /> {overallActors[5].most_common_genre}<br />
                                                <strong>Watchlist adds:</strong><br /> {overallActors[5].movie_count}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="bottom-row">
                <h3>Top Actors by Genre and Year</h3>
                <div className="dropdown-container">
                    <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
                        <option value="All Genres">All Genres</option>
                        {genres.map((genre) => (
                            <option key={genre} value={genre}>{genre}</option>
                        ))}
                    </select>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                        <option value="All Years">All Years</option>
                        {years.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                <div className="scroll-buttons">
                    <button onClick={scrollLeft}>&lt;</button>
                    <button onClick={scrollRight}>&gt;</button>
                </div>
                {isLoadingTopActors ? (
                    <p>Fetching Data...</p>
                ) : (
                    <div className="top-actors-container" ref={scrollContainerRef}>
                        {topActors.map((actor) => (
                            <RatingBox
                                key={actor.actor_id}
                                name={actor.actor_name}
                                movie_count={actor.movie_count}
                                budget={actor.average_budget}
                                genre={actor.most_common_genre}
                                imdbRating={actor.average_imdb_rating}
                                popularity={actor.average_popularity}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ActorRanking;