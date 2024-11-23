import { useState, useEffect } from 'react'
import SidePanel from '../../components/SidePanel';
import './styles.css'

function ActorRanking({ connectionStatus, handleStatusClick }) { 
    const [actors, setActors] = useState([]);
    const [isLoading, setIsLoading] = useState(true); 

    useEffect(() => {
        const fetchActors = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/actorRanking`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setActors(data.actors);
            } catch (error) {
                console.error('Error fetching actors:', error);
            }finally {
                setIsLoading(false); 
            }
        };
        fetchActors();
    }, []);
    return (
        <div className="actor-dashboard">
            <SidePanel connectionStatus={connectionStatus} handleStatusClick={handleStatusClick} />
            <div className="ovr-container">
                <h2>Overall Actor Ranking</h2>
                {isLoading ? (
                    <p>Fetching Data...</p>
                ) : (
                    <div className="place-containers">
                        {actors.length >= 3 && (
                            <>
                                <div className="place-box-wrapper">
                                    <div className="place-number-2">2</div>
                                    <div key={actors[1].actor_id} className="place-box place-box-2">
                                        <strong>{actors[1].actor_name}</strong><br /><br />
                                        <strong>Average Popularity:</strong><br /> {actors[1].average_popularity.toFixed(2)}<br />
                                        <strong>Most Common Genre:</strong><br /> {actors[1].most_common_genre}<br />
                                        <strong>Number of Movies:</strong><br /> {actors[1].movie_count}
                                    </div>
                                </div>
                                <div className="place-box-wrapper">
                                    <div className="place-number-1">1</div>
                                    <div key={actors[0].actor_id} className="place-box place-box-1">
                                        <strong>{actors[0].actor_name}</strong><br /><br />
                                        <strong>Average Popularity:</strong><br /> {actors[0].average_popularity.toFixed(2)}<br />
                                        <strong>Most Common Genre:</strong><br /> {actors[0].most_common_genre}<br />
                                        <strong>Number of Movies:</strong><br /> {actors[0].movie_count}
                                    </div>
                                </div>
                                <div className="place-box-wrapper">
                                    <div className="place-number-3">3</div>
                                    <div key={actors[2].actor_id} className="place-box place-box-3">
                                        <strong>{actors[2].actor_name}</strong><br /><br />
                                        <strong>Average Popularity:</strong><br /> {actors[2].average_popularity.toFixed(2)}<br />
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
    );
}



export default ActorRanking;