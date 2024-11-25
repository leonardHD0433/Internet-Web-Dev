import { useState, useEffect } from 'react';
import SidePanel from '../../components/SidePanel';
import { StackedBarplot } from '../../components/StackedBarPlot/';
import './styles.css';

function ActorRanking({ connectionStatus, handleStatusClick }) { 
    const [actors, setActors] = useState([]);
    const [isLoadingRank, setIsLoadingRank] = useState(true);
    const [isLoadingProlific, setIsLoadingProlific] = useState(true);
    const [barplotData, setBarplotData] = useState([]);
    const [genres, setGenres] = useState([]);

    useEffect(() => {
        const fetchActors = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/actorRanking`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const actorData = await response.json();
                setActors(actorData.actors);
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
                <div className="density-box">

                </div>
                <div className="actor-rank-box">
                    <div className="ovr-container scale-content">
                        <h3>Overall Actor Ranking</h3>
                        {isLoadingRank ? (
                            <p>Fetching Data...</p>
                        ) : (
                            <div className="place-containers">
                                {actors.length >= 3 && (
                                    <>
                                        <div className="place-box-wrapper">
                                            <div className="place-number-2">2</div>
                                            <div key={actors[1].actor_id} className="place-box place-box-2">
                                                <h3><strong>{actors[1].actor_name}</strong></h3>
                                                <strong>Average Popularity:</strong><br /> {actors[1].average_popularity}<br />
                                                <strong>Average Critic Score:</strong><br /> {actors[1].average_imdb_rating}<br />
                                                <strong>Most Common Genre:</strong><br /> {actors[1].most_common_genre}<br />
                                                <strong>Number of Movies:</strong><br /> {actors[1].movie_count}
                                            </div>
                                        </div>
                                        <div className="place-box-wrapper">
                                            <div className="place-number-1">1</div>
                                            <div key={actors[0].actor_id} className="place-box place-box-1">
                                                <h3><strong>{actors[0].actor_name}</strong></h3>
                                                <strong>Average Popularity:</strong><br /> {actors[0].average_popularity}<br />
                                                <strong>Average Critic Score:</strong><br /> {actors[0].average_imdb_rating}<br />
                                                <strong>Most Common Genre:</strong><br /> {actors[0].most_common_genre}<br />
                                                <strong>Number of Movies:</strong><br /> {actors[0].movie_count}
                                            </div>
                                        </div>
                                        <div className="place-box-wrapper">
                                            <div className="place-number-3">3</div>
                                            <div key={actors[2].actor_id} className="place-box place-box-3">
                                                <h3><strong>{actors[2].actor_name}</strong></h3>
                                                <strong>Average Popularity:</strong><br /> {actors[2].average_popularity}<br />
                                                <strong>Average Critic Score:</strong><br /> {actors[2].average_imdb_rating}<br />
                                                <strong>Most Common Genre:</strong><br /> {actors[2].most_common_genre}<br />
                                                <strong>Number of Movies:</strong><br /> {actors[2].movie_count}
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
                                {actors.length === 6 && (
                                    <>
                                        <div className="place-box-wrapper">
                                            <div className="place-number-2">2</div>
                                            <div key={actors[4].actor_id} className="place-box place-box-2">
                                                <h3><strong>{actors[4].actor_name}</strong></h3>
                                                <strong>Average Popularity:</strong><br /> {actors[4].average_popularity}<br />
                                                <strong>Average Critic Score:</strong><br /> {actors[4].average_imdb_rating}<br />
                                                <strong>Most Common Genre:</strong><br /> {actors[4].most_common_genre}<br />
                                                <strong>Watchlist adds:</strong><br /> {actors[4].movie_count}
                                            </div>
                                        </div>
                                        <div className="place-box-wrapper">
                                            <div className="place-number-1">1</div>
                                            <div key={actors[3].actor_id} className="place-box place-box-1">
                                                <h3><strong>{actors[3].actor_name}</strong></h3>
                                                <strong>Average Popularity:</strong><br /> {actors[3].average_popularity}<br />
                                                <strong>Average Critic Score:</strong><br /> {actors[3].average_imdb_rating}<br />
                                                <strong>Most Common Genre:</strong><br /> {actors[3].most_common_genre}<br />
                                                <strong>Watchlist adds:</strong><br /> {actors[3].movie_count}
                                            </div>
                                        </div>
                                        <div className="place-box-wrapper">
                                            <div className="place-number-3">3</div>
                                            <div key={actors[5].actor_id} className="place-box place-box-3">
                                                <h3><strong>{actors[5].actor_name}</strong></h3>
                                                <strong>Average Popularity:</strong><br /> {actors[5].average_popularity}<br />
                                                <strong>Average Critic Score:</strong><br /> {actors[5].average_imdb_rating}<br />
                                                <strong>Most Common Genre:</strong><br /> {actors[5].most_common_genre}<br />
                                                <strong>Watchlist adds:</strong><br /> {actors[5].movie_count}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ActorRanking;