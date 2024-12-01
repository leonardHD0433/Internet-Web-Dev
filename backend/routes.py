from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from database import get_db
from urllib.parse import unquote
from typing import List, Dict
from datetime import datetime
from database import get_db, test_db_connection
import re 
from models import (
    SessionLocal, Users, Actor, Movie, MovieActor, Watchlist, Genre, MovieGenre, MovieDirector, Director, Writer, MovieWriter
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
def top_prolific_actors(db: Session = Depends(get_db)):
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


@router.get("/TopActorByGenre")
def top_actors_genres(genre: str, year: str, db: Session = Depends(get_db)):
    # Get the top 15 actors with the most number of movies in the selected genre and year
    query = db.query(
        Actor.actor_id,
        Actor.actor_name,
        func.count(MovieActor.movie_id).label('movie_count'),
        func.avg(func.nullif(Movie.budget, 0)).label('average_budget'),
        func.avg(func.nullif(Movie.imdb_rating, -1)).label('average_imdb_rating'),
        func.avg(func.nullif(Movie.popularity, 0)).label('average_popularity')
    ).join(MovieActor, Actor.actor_id == MovieActor.actor_id
    ).join(MovieGenre, MovieActor.movie_id == MovieGenre.movie_id
    ).join(Genre, MovieGenre.genre_id == Genre.genre_id
    ).join(Movie, MovieActor.movie_id == Movie.movie_id
    ).filter(Actor.actor_id != 5)

    if genre != "All Genres":
        query = query.filter(Genre.genre_label == genre)
    if year != "All Years":
        query = query.filter(Movie.release_year == int(year))

    top_actors = query.group_by(Actor.actor_id, Actor.actor_name
    ).order_by(func.count(MovieActor.movie_id).desc()
    ).limit(15).all()

    # Find the most common genre for the actors
    actor_genres = {}
    for actor in top_actors:
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
        
        actor_genres[actor.actor_id] = common_genre.genre_label if common_genre and common_genre.genre_label != "Unknown" else "No Data"

    # Create a list of dictionaries with the required data
    actors_data = []
    for actor in top_actors:
        actor_data = {
            "actor_name": actor.actor_name,
            "movie_count": actor.movie_count,
            "average_budget": int(actor.average_budget) if actor.average_budget else "No Data",
            "most_common_genre": actor_genres[actor.actor_id],
            "average_imdb_rating": round(actor.average_imdb_rating, 2) if actor.average_imdb_rating else 0,
            "average_popularity": round(actor.average_popularity, 2) if actor.average_popularity else 0
        }
        actors_data.append(actor_data)
            
    return {
        "actors": actors_data
    }

@router.get("/ActorsByGenre")
def actors_per_genre(db: Session = Depends(get_db)):
    # Query to get the number of actors that have acted in each genre
    genre_actor_counts = db.query(
        Genre.genre_label,
        func.count(MovieActor.actor_id.distinct()).label('actor_count')
    ).join(MovieGenre, Genre.genre_id == MovieGenre.genre_id
    ).join(MovieActor, MovieGenre.movie_id == MovieActor.movie_id
    ).group_by(Genre.genre_label
    ).filter(Genre.genre_id != 1, MovieActor.actor_id != 5
    ).all()

    # Format the result in the required structure
    result = [{"category": genre.genre_label, "value": genre.actor_count} for genre in genre_actor_counts]

    return result

def get_good_movie_data(db: Session):
    movies = db.query(Movie).filter(
        Movie.adult == 0,
        Movie.status == 'Released',
        Movie.imdb_rating > 5,
        Movie.popularity > 5
    ).order_by(
        (Movie.imdb_rating + Movie.popularity).desc()
    ).all()
        
    return movies

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
        Movie.status == 'Released',
        Movie.imdb_rating > 5,
        Movie.popularity > 5
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
        released_date = movie.release_date.strftime("%d-%m-%Y")
        result.append({
            "title": movie.title,
            "director": [director.director_name for director in directors],
            "starring": [actor.actor_name for actor in actors],
            "genre": [genre.genre_label for genre in genres],
            "imdbRating": movie.imdb_rating,
            "popularity": movie.popularity,
            "date_released": released_date
        })
    #Debugging print(result)
    return result

@router.get("/common-genres")
def common_genres(db: Session = Depends(get_db)):
    # Query to get the count of each genre
    genre_counts = db.query(
        Genre.genre_label,
        func.count(MovieGenre.movie_id).label('count')
    ).join(MovieGenre, Genre.genre_id == MovieGenre.genre_id
    ).group_by(Genre.genre_label
    ).order_by(func.count(MovieGenre.movie_id).desc()
    ).all()

    # Format the data for the frontend
    result = [{"genre": genre_label, "count": count} for genre_label, count in genre_counts]
    return result

@router.get("/search", response_model=List[Dict[str, str]])
async def search(
    query: str = Query(..., min_length=2, max_length=100),
    db: Session = Depends(get_db)
):
    try:
        # Sanitize and validate query
        query = unquote(query).strip()
        if not query:
            return []

        # Split query into words for better matching
        query_words = re.findall(r'\w+', query.lower())
        
        # Calculate relevance score based on position of match
        def calculate_relevance(name: str) -> float:
            name_lower = name.lower()
            score = 0
            # Exact match gets highest score
            if name_lower == query.lower():
                return 100
            # Starting with query gets high score
            if name_lower.startswith(query.lower()):
                score += 75
            # Count matching words
            for word in query_words:
                if word in name_lower:
                    score += 25
            return score

        # Search all entities with relevance scoring
        results = []
        
        try:
            # Movies search
            movies = db.query(Movie).filter(
                or_(
                    Movie.title.ilike(f"%{query}%"),
                )
            ).limit(10).all()
            
            for movie in movies:
                if movie and movie.title:  # Check if movie and title exist
                    relevance = calculate_relevance(movie.title)
                    results.append({
                        "id": str(movie.movie_id),
                        "name": movie.title,
                        "type": "Movie",
                        "relevance": relevance,
                        "year": str(movie.release_year)
                    })
        except Exception as e:
            print(f"Error in movie search: {str(e)}")

        try:
            # Actors search 
            actors = db.query(Actor).filter(
                Actor.actor_name.ilike(f"%{query}%")
            ).limit(10).all()
            
            for actor in actors:
                if actor and actor.actor_name:  # Check if actor and name exist
                    relevance = calculate_relevance(actor.actor_name)
                    results.append({
                        "id": str(actor.actor_id),
                        "name": actor.actor_name,
                        "type": "Actor",
                        "relevance": relevance
                    })
        except Exception as e:
            print(f"Error in actor search: {str(e)}")

        try:
            # Directors search
            directors = db.query(Director).filter(
                Director.director_name.ilike(f"%{query}%")
            ).limit(10).all()
            
            for director in directors:
                if director and director.director_name:  # Check if director and name exist
                    relevance = calculate_relevance(director.director_name)
                    results.append({
                        "id": str(director.director_id),
                        "name": director.director_name,
                        "type": "Director",
                        "relevance": relevance
                    })
        except Exception as e:
            print(f"Error in director search: {str(e)}")

        try:
            # Writers search
            writers = db.query(Writer).filter(
                Writer.writer_name.ilike(f"%{query}%")
            ).limit(10).all()
            
            for writer in writers:
                if writer and writer.writer_name:  # Check if writer and name exist
                    relevance = calculate_relevance(writer.writer_name)
                    results.append({
                        "id": str(writer.writer_id),
                        "name": writer.writer_name,
                        "type": "Writer",
                        "relevance": relevance
                    })
        except Exception as e:
            print(f"Error in writer search: {str(e)}")

        # Return empty list if no results found
        if not results:
            return []

        # Sort by relevance and ensure diversity
        results.sort(key=lambda x: x["relevance"], reverse=True)
        
        # Ensure diversity in top results (at least one of each type if available)
        final_results = []
        seen_types = set()
        
        # First pass - add highest scoring of each type
        for result in results:
            if result["type"] not in seen_types and len(final_results) < 5:
                final_results.append(result)
                seen_types.add(result["type"])
                
        # Second pass - fill remaining slots with highest scoring results
        for result in results:
            if len(final_results) >= 5:
                break
            if result not in final_results:
                final_results.append(result)

        # Remove relevance score from final output
        for result in final_results:
            result.pop("relevance", None)
            
        return final_results

    except Exception as e:
        print(f"Search failed: {str(e)}")  # Add logging
        raise HTTPException(
            status_code=500,
            detail=f"Search failed: {str(e)}"
        )
    
@router.get("/search-movie", response_model=List[Dict[str, str]])
async def search_movie(
    query: str = Query(..., min_length=2, max_length=100),
    db: Session = Depends(get_db)
):
    try:
        # Sanitize query
        query = unquote(query).strip()
        if not query:
            return []

        # Split query for word matching
        query_words = re.findall(r'\w+', query.lower())
        
        def calculate_relevance(title: str) -> float:
            title_lower = title.lower()
            score = 0
            if title_lower == query.lower():
                return 100
            if title_lower.startswith(query.lower()):
                score += 75
            for word in query_words:
                if word in title_lower:
                    score += 25
            return score

        # Search movies
        movies = db.query(Movie).filter(
            Movie.title.ilike(f"%{query}%")
        ).limit(10).all()
        
        results = []
        for movie in movies:
            if movie and movie.title:
                relevance = calculate_relevance(movie.title)
                results.append({
                    "id": str(movie.movie_id),
                    "name": movie.title,
                    "type": "Movie",
                    "year": str(movie.release_year),
                    "relevance": relevance
                })

        # Sort by relevance
        results.sort(key=lambda x: x["relevance"], reverse=True)
        
        # Remove relevance scores
        for result in results:
            result.pop("relevance", None)
            
        return results

    except Exception as e:
        print(f"Movie search failed: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Movie search failed: {str(e)}"
        )

#Fetch full movie details using movie ID
@router.get("/search-movie/{movie_id}")
def search_movie_by_id(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.movie_id == movie_id).first()
    if not movie:
        raise HTTPException(
            status_code=404,
            detail="Movie not found"
        )

    # Get actors, directors, writers and genres for the movie
    actors = db.query(Actor).join(MovieActor).filter(MovieActor.movie_id == movie_id).all()
    directors = db.query(Director).join(MovieDirector).filter(MovieDirector.movie_id == movie_id).all()
    writers = db.query(Writer).join(MovieWriter).filter(MovieWriter.movie_id == movie_id).all()
    genres = db.query(Genre).join(MovieGenre).filter(MovieGenre.movie_id == movie_id).all()
    date_released = movie.release_date.strftime("%d-%m-%Y")

    return {
        "id": movie.movie_id,
        "title": movie.title,
        "overview": movie.overview,
        "release_date": movie.release_date,
        "popularity": movie.popularity,
        "imdb_rating": movie.imdb_rating,
        "actors": [actor.actor_name for actor in actors],
        "directors": [director.director_name for director in directors],
        "writers": [writer.writer_name for writer in writers],
        "genres": [genre.genre_label for genre in genres],
        "date_released": date_released
    }

@router.get("/search-movie-graph/{movie_id}")
def search_movie_graph(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.movie_id == movie_id).first()
    if not movie:
        raise HTTPException(
            status_code=404,
            detail="Movie not found"
        )

    # Get actors, directors, writers and genres for the movie
    actors = db.query(Actor).join(MovieActor).filter(MovieActor.movie_id == movie_id).all()
    directors = db.query(Director).join(MovieDirector).filter(MovieDirector.movie_id == movie_id).all()
    writers = db.query(Writer).join(MovieWriter).filter(MovieWriter.movie_id == movie_id).all()
    genres = db.query(Genre).join(MovieGenre).filter(MovieGenre.movie_id == movie_id).all()
    runtime = movie.runtime

    return {
        "id": movie.movie_id,
        "title": movie.title,
        "popularity": movie.popularity,
        "imdb_rating": movie.imdb_rating,
        "actors": [actor.actor_name for actor in actors],
        "directors": [director.director_name for director in directors],
        "writers": [writer.writer_name for writer in writers],
        "genres": [genre.genre_label for genre in genres],
        "runtime":  runtime
    }