import { useState, useEffect } from 'react'
//import CloseButton from '../../components/CloseButton'
import './styles.css'

function ActorRanking({ }) { 
    const [actors, setActors] = useState([]);

    useEffect(() => {
        const fetchActors = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/actorRanking`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setActors(data.actors); // Assuming the response has a structure like { actors: [...] }
            } catch (error) {
                console.error('Error fetching actors:', error);
            }
        };
        fetchActors();
    }, []);
    return (
        <div className="actor-ranking">
            <h1>Actor Ranking</h1>
            <ul>
                {actors.map(actor => (
                    <li key={actor.actor_id}>
                        <strong>{actor.actor_name}</strong><br />
                        Average Popularity: {actor.average_popularity.toFixed(2)}<br />
                        Most Common Genre: {actor.most_common_genre}<br />
                        Movie Count: {actor.movie_count}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ActorRanking;