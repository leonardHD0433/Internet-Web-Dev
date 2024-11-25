from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from database import get_db
from urllib.parse import unquote
from database import get_db, test_db_connection
from models import (
    SessionLocal, Actor,Watchlist, Director, Genre, MovieGenre, Movie, MovieActor, Users
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
    actor_list = db.query(
        Actor.actor_id,
        Actor.actor_name,
        func.avg(func.nullif(Movie.popularity, 0)).label('average_popularity'),
        func.avg(func.nullif(Movie.imdb_rating, -1)).label('average_imdb_rating'),
        func.count(Movie.movie_id).label('movie_count')
    ).join(MovieActor, Actor.actor_id == MovieActor.actor_id
    ).join(Movie, MovieActor.movie_id == Movie.movie_id
    ).group_by(Actor.actor_id, Actor.actor_name
    ).having(func.count(Movie.movie_id) >= 10  # Filter out actors with less than 10 movies
    ).order_by(((func.avg(func.nullif(Movie.popularity, 0)) + func.avg(func.nullif(Movie.imdb_rating, -1)))).desc()
    ).limit(3).all()

    # Query the top 3 most common actors in the watchlist
    watchlist_actors = db.query(
        Actor.actor_id,
        Actor.actor_name,
        func.avg(func.nullif(Movie.popularity, 0)).label('average_popularity'),
        func.avg(func.nullif(Movie.imdb_rating, -1)).label('average_imdb_rating'),
        func.count(Watchlist.movie_id).label('watchlist_count')
    ).join(MovieActor, Actor.actor_id == MovieActor.actor_id
    ).join(Watchlist, MovieActor.movie_id == Watchlist.movie_id
    ).join(Movie, MovieActor.movie_id == Movie.movie_id
    ).group_by(Actor.actor_id, Actor.actor_name
    ).order_by(func.count(Watchlist.movie_id).desc()
    ).limit(3).all()

    # Append the watchlist actors to the actor_popularity list
    for actor in watchlist_actors:
        actor_list.append(actor)

    # Find the most common genre for the 6 actors
    actor_genres = {}
    for actor in actor_list:
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

    # Create a list of dictionaries with the required data
    actors_data = []
    for actor in actor_list:
        actor_data = {
            "actor_name": actor.actor_name,
            "average_popularity": round(actor.average_popularity, 2) if actor.average_popularity else "No Data",
            "average_imdb_rating": round(actor.average_imdb_rating, 2) if actor.average_imdb_rating else "No Data",
            "most_common_genre": actor_genres[actor.actor_id],
            "movie_count": actor.movie_count if hasattr(actor, 'movie_count') else actor.watchlist_count
        }
        actors_data.append(actor_data)
            
    return {
        "actors": actors_data
    }



@router.get("/genres")
def get_genres(db: Session = Depends(get_db)):
    genres = db.query(Genre).all()
    return [{"genre_label": genre.genre_label} for genre in genres]

@router.get("/MostProlificActors")
def top_actors_genres(db: Session = Depends(get_db)):
    # Get the top 5 actors with the most number of movies, excluding "Unknown" actor
    top_actors = db.query(
        Actor.actor_id,
        Actor.actor_name,
        func.count(MovieActor.movie_id).label('movie_count')
    ).join(MovieActor, Actor.actor_id == MovieActor.actor_id
    ).filter(Actor.actor_id != 5
    ).group_by(Actor.actor_id, Actor.actor_name
    ).order_by(func.count(MovieActor.movie_id).desc()
    ).limit(5).all()

    all_genres = get_genres(db)
    genre_labels = [genre["genre_label"] for genre in all_genres]

    # Prepare the data in the required format
    data = []
    for actor in top_actors:
        subquery = db.query(
            MovieGenre.movie_id,
            Genre.genre_label,
            func.row_number().over(
                partition_by=MovieGenre.movie_id,
                order_by=Genre.genre_label
            ).label('row_num')
        ).join(Genre, Genre.genre_id == MovieGenre.genre_id
        ).join(MovieActor, MovieActor.movie_id == MovieGenre.movie_id
        ).filter(MovieActor.actor_id == actor.actor_id
        ).subquery()

        genres_count = db.query(
            subquery.c.genre_label,
            func.count(subquery.c.movie_id).label('count')
        ).filter(subquery.c.row_num == 1
        ).group_by(subquery.c.genre_label).all()

        actor_data = {"x": actor.actor_name}
        genre_count_dict = {genre.genre_label: genre.count for genre in genres_count}

        # Ensure all genres are included, assign 0 if the actor has no movies in that genre
        for genre_label in genre_labels:
            actor_data[genre_label] = genre_count_dict.get(genre_label, 0)

        data.append(actor_data)

    return data