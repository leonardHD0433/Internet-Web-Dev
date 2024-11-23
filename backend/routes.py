from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from database import get_db
from urllib.parse import unquote
from database import get_db, test_db_connection
from models import (
    SessionLocal, Actor, Director, Genre, MovieGenre, Movie, MovieActor, Users
)

# Initialize router instead of app
router = APIRouter()

@router.get("/api/health")
def health_check():
    return {"status": "healthy"}

@router.get("/api/db-check")
def db_check():
    db_status = test_db_connection()
    return {
        "status": "connected" if db_status else "disconnected"
    }

@router.get("/login")
def login(user_id: int, password: str, db: Session = Depends(get_db)):
    user = db.query(Users).filter(Users.user_id == user_id).first()
    if user and user.password == password:
        return {"success": True, "user_id": user.user_id}
    raise HTTPException(status_code=401, detail="Invalid credentials")


@router.get("/actorRanking")
def actor_ranking(db: Session = Depends(get_db)):
    # Select the top 3 actors based on the average value of average popularity and average IMDb rating
    actor_popularity = db.query(
        Actor.actor_id,
        Actor.actor_name,
        func.avg(Movie.popularity).label('average_popularity'),
        func.avg(Movie.imdb_rating).label('average_imdb_rating'),
        (func.avg(Movie.popularity) + func.avg(Movie.imdb_rating)).label('combined_metric'),
        func.count(Movie.movie_id).label('movie_count')
    ).join(MovieActor, Actor.actor_id == MovieActor.actor_id
    ).join(Movie, MovieActor.movie_id == Movie.movie_id
    ).group_by(Actor.actor_id, Actor.actor_name
    ).having(func.count(Movie.movie_id) >= 10  # Filter out actors with less than 5 movies
    ).order_by(((func.avg(Movie.popularity) + func.avg(Movie.imdb_rating))).desc()
    ).limit(3).all()

    # Find the most common genre for the 3 actors
    actor_genres = {}
    for actor in actor_popularity:
        common_genre = db.query(
            Genre.genre_label,
            func.count(Genre.genre_label).label('genre_count')
        ).join(MovieGenre, Genre.genre_id == MovieGenre.genre_id
        ).join(Movie, MovieGenre.movie_id == Movie.movie_id
        ).join(MovieActor, Movie.movie_id == MovieActor.movie_id
        ).filter(MovieActor.actor_id == actor.actor_id
        ).group_by(Genre.genre_label
        ).order_by(func.count(Genre.genre_label).desc()
        ).first()
        
        if common_genre.genre_label != "Unknown":
            actor_genres[actor.actor_id] = common_genre.genre_label
        else:
            actor_genres[actor.actor_id] = "No Data"

    return {
        "actors": [
            {
                "actor_name": actor.actor_name,
                "average_popularity": actor.average_popularity,
                "average_imdb_rating": actor.average_imdb_rating,
                "combined_metric": actor.combined_metric,
                "most_common_genre": actor_genres[actor.actor_id],
                "movie_count": actor.movie_count
            } for actor in actor_popularity
        ]
    }