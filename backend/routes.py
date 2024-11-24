from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from urllib.parse import unquote
from database import get_db, test_db_connection
from datetime import datetime
from models import (
    SessionLocal, Users, Actor, Movie, MovieActor, Watchlist, Genre, MovieGenre, MovieDirector, Director
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
def login(email: str, password: str, db: Session = Depends(get_db)):
    print(f"Login attempt - email: {email}, password: {password}")
    user = db.query(Users).filter(Users.user_email == email).first()

    # Check if user exists and verify password
    if not user or user.password != password:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )
        
    return {
        "success": True,
        "user_id": user.user_id,
        "user_name": user.user_name,
        "email": user.user_email
    }

@router.get("/register")
def register(name: str, email: str, username: str, password: str, db: Session = Depends(get_db)):
    print(f"Registration attempt - name: {name}, email: {email}, username: {username}, password: {password}")
    user = db.query(Users).filter(Users.user_email == email).first()
    if user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    current_date = datetime.now()
    
    new_user = Users(
        user_name=username,
        user_email=email,
        password=password,
        date_joined=current_date
    )
    
    # Add and commit to database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"success": True}

@router.get("/actorRanking")
def actor_ranking(db: Session = Depends(get_db)):
    # Select the top 3 actors based on the average value of average popularity and average IMDb rating
    actor_popularity = db.query(
        Actor.actor_id,
        Actor.actor_name,
        func.avg(Movie.popularity).label('average_popularity'),
        func.avg(Movie.imdb_rating).label('average_imdb_rating'),
        func.count(Movie.movie_id).label('movie_count')
    ).join(MovieActor, Actor.actor_id == MovieActor.actor_id
    ).join(Movie, MovieActor.movie_id == Movie.movie_id
    ).group_by(Actor.actor_id, Actor.actor_name
    ).having(func.count(Movie.movie_id) >= 10  # Filter out actors with less than 5 movies
    ).order_by(((func.avg(Movie.popularity) + func.avg(Movie.imdb_rating))).desc()
    ).limit(3).all()

    # Query the top 3 most common actors in the watchlist
    watchlist_actors = db.query(
        Actor.actor_id,
        Actor.actor_name,
        func.avg(Movie.popularity).label('average_popularity'),
        func.avg(Movie.imdb_rating).label('average_imdb_rating'),
        func.count(Watchlist.movie_id).label('watchlist_count')
    ).join(MovieActor, Actor.actor_id == MovieActor.actor_id
    ).join(Watchlist, MovieActor.movie_id == Watchlist.movie_id
    ).join(Movie, MovieActor.movie_id == Movie.movie_id
    ).group_by(Actor.actor_id, Actor.actor_name
    ).order_by(func.count(Watchlist.movie_id).desc()
    ).limit(3).all()

    # Append the watchlist actors to the actor_popularity list
    for actor in watchlist_actors:
        actor_popularity.append(actor)

    # Find the most common genre for the 6 actors
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
                "most_common_genre": actor_genres[actor.actor_id],
                "movie_count": actor.movie_count if hasattr(actor, 'movie_count') else actor.watchlist_count
            } for actor in actor_popularity
        ]
    }

@router.get("/multiline")
def movie_stats(filterType: str, db: Session = Depends(get_db)):
    if filterType == "Language":
        # First get top 3 languages overall
        top_languages = db.query(
            Movie.original_language,
            func.count(Movie.movie_id).label('total_count')
        ).group_by(
            Movie.original_language
        ).order_by(
            func.count(Movie.movie_id).desc()
        ).limit(3).all()

        # Format data for frontend
        result = []
        for lang in top_languages:
            # Get yearly data for each top language
            yearly_data = db.query(
                Movie.release_year,
                func.count(Movie.movie_id).label('count')
            ).filter(
                Movie.original_language == lang.original_language
            ).group_by(
                Movie.release_year
            ).order_by(
                Movie.release_year
            ).all()

            result.append({
                "name": lang.original_language,
                "values": [
                    {"x": year, "y": count}
                    for year, count in yearly_data
                ]
            })

    else:  # Year
        # Query for movie counts by month for last 3 years
        years = db.query(
            Movie.release_year
        ).distinct().order_by(
            Movie.release_year.desc()
        ).limit(3)

        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                 "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        
        result = []
        for year in years:
            # Get movie counts for each month in this year
            month_counts = dict(db.query(
                func.date_format(Movie.release_date, '%b'),
                func.count(Movie.movie_id)
            ).filter(
                Movie.release_year == year.release_year
            ).group_by(
                func.date_format(Movie.release_date, '%b')
            ).all())
            
            # Create values list with all months, using 0 for months with no movies
            values = [
                {"x": month, "y": month_counts.get(month, 0)}
                for month in months
            ]
            
            result.append({
                "name": str(year.release_year),
                "values": values
            })
    return result


@router.get("/no-users")
def no_users(db: Session = Depends(get_db)):
    user_counts = db.query(
        func.extract('year', Users.date_joined).label('year'),
        func.count(Users.user_id).label('count')
    ).distinct(
        func.extract('year', Users.date_joined)
    ).group_by(
        func.extract('year', Users.date_joined)
    ).order_by(
        func.extract('year', Users.date_joined)
    ).all()
    
    result = [{"year": int(year), "count": count} for year, count in user_counts]
    return result

@router.get("/ratingMeters")
def rating_meters(db: Session = Depends(get_db)):
    movies = db.query(Movie).filter(
        Movie.adult == 0,
        Movie.status == 'Released'
    ).order_by(Movie.release_date.desc()).limit(9).all()

    #Debugging print(movies)

    # Set default values for missing data
    for movie in movies:
        if movie.imdb_rating is None:
            movie.imdb_rating = -1
        if movie.popularity is None:
            movie.popularity = -1

    print("Movies after setting default values:", movies)

    #sort movies by popularity and imdb rating
    movies.sort(key=lambda x: x.imdb_rating, reverse=True)
    movies.sort(key=lambda x: x.popularity, reverse=True)  

    #Debugging print("Movies after sorting:", movies)

    # Format data for frontend
    result = []
    for movie in movies:
        actors = db.query(Actor).join(MovieActor).filter(MovieActor.movie_id == movie.movie_id).all()
        directors = db.query(Director).join(MovieDirector).filter(MovieDirector.movie_id == movie.movie_id).all()
        genres = db.query(Genre).join(MovieGenre).filter(MovieGenre.movie_id == movie.movie_id).all()
        result.append({
            "title": movie.title,
            "director": [director.director_name for director in directors],
            "starring": [actor.actor_name for actor in actors],
            "genre": [genre.genre_label for genre in genres],
            "imdbRating": movie.imdb_rating,
            "popularity": movie.popularity
        })
    #Debugging print(result)
    return result