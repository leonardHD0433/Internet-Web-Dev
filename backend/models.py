from sqlalchemy import Column, Integer, String, Date, Text, Double, ForeignKey, create_engine, MetaData, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
import os

# Database connection URL for MySQL
DATABASE_URL = f"mysql+pymysql://{os.getenv('DATABASE_USER')}:{os.getenv('DATABASE_PASSWORD')}@{os.getenv('DATABASE_HOST')}:{os.getenv('DATABASE_PORT')}/{os.getenv('DATABASE_NAME')}"

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Reflect the existing database
metadata = MetaData()
metadata.reflect(bind=engine)

class Actor(Base):
    __tablename__ = "actor"

    actor_id = Column(Integer, primary_key=True, index=True)
    actor_name = Column(String(50), nullable=True)

class Director(Base):
    __tablename__ = "director"

    director_id = Column(Integer, primary_key=True, index=True)
    director_name = Column(String(50), nullable=True)

class Genre(Base):
    __tablename__ = "genre"

    genre_id = Column(Integer, primary_key=True, index=True)
    genre_label = Column(String(50), nullable=True)

class Movie(Base):
    __tablename__ = "movie"

    movie_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(50), nullable=True)
    status = Column(String(50), nullable=True)
    release_date = Column(Date, nullable=True)
    runtime = Column(Integer, nullable=True)
    adult = Column(Boolean, nullable=True)
    original_language = Column(String(20), nullable=True)
    budget = Column(Integer, nullable=True)
    overview = Column(Text, nullable=True)
    popularity = Column(Double, nullable=True)
    release_year = Column(Integer, nullable=True)
    imdb_rating = Column(Double, nullable=True)

class MovieActor(Base):
    __tablename__ = "movieactor"

    movie_id = Column(Integer, ForeignKey('movie.movie_id'), primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey('actor.actor_id'), primary_key=True, index=True)
    title = Column(String(50), nullable=True)
    actor_name = Column(String(50), nullable=True)

    movie = relationship("Movie", back_populates="actors")
    actor = relationship("Actor", back_populates="movies")

Movie.actors = relationship("MovieActor", back_populates="movie")
Actor.movies = relationship("MovieActor", back_populates="actor")

class MovieDirector(Base):
    __tablename__ = "moviedirector"

    movie_id = Column(Integer, ForeignKey('movie.movie_id'), primary_key=True, index=True)
    director_id = Column(Integer, ForeignKey('director.director_id'), primary_key=True, index=True)
    title = Column(String(50), nullable=True)
    director_name = Column(String(50), nullable=True)

    movie = relationship("Movie", back_populates="directors")
    director = relationship("Director", back_populates="movies")

Movie.directors = relationship("MovieDirector", back_populates="movie")
Director.movies = relationship("MovieDirector", back_populates="director")

class MovieGenre(Base):
    __tablename__ = "moviegenre"

    movie_id = Column(Integer, ForeignKey('movie.movie_id'), primary_key=True, index=True)
    genre_id = Column(Integer, ForeignKey('genre.genre_id'), primary_key=True, index=True)
    title = Column(String(50), nullable=True)
    genre_label = Column(String(50), nullable=True)

    movie = relationship("Movie", back_populates="genres")
    genre = relationship("Genre", back_populates="movies")

Movie.genres = relationship("MovieGenre", back_populates="movie")
Genre.movies = relationship("MovieGenre", back_populates="genre")

class Writer(Base):
    __tablename__ = "writer"

    writer_id = Column(Integer, primary_key=True, index=True)
    writer_name = Column(String(50), nullable=True)

class MovieWriter(Base):
    __tablename__ = "moviewriter"

    movie_id = Column(Integer, ForeignKey('movie.movie_id'), primary_key=True, index=True)
    writer_id = Column(Integer, ForeignKey('writer.writer_id'), primary_key=True, index=True)
    title = Column(String(50), nullable=True)
    writer_name = Column(String(50), nullable=True)

    movie = relationship("Movie", back_populates="writers")
    writer = relationship("Writer", back_populates="movies")

Movie.writers = relationship("MovieWriter", back_populates="movie")
Writer.movies = relationship("MovieWriter", back_populates="writer")

class Users(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    password = Column(String(20), nullable=False)
    user_name = Column(String(100), nullable=False)
    user_email = Column(String(50), nullable=False)
    date_joined = Column(Date, nullable=False, server_default=func.current_date())

class UserSearch(Base):
    __tablename__ = "usersearch"

    user_id = Column(Integer, ForeignKey('users.user_id'), primary_key=True, index=True)
    genre_id = Column(Integer, ForeignKey('genre.genre_id'), primary_key=True, index=True)
    genre_label = Column(String(50), nullable=True)
    search_count = Column(Integer, default=0, nullable=True)

    user = relationship("Users", back_populates="searches")
    genre = relationship("Genre", back_populates="user_searches")

Genre.user_searches = relationship("UserSearch", back_populates="genre")
Users.searches = relationship("UserSearch", back_populates="user")

class Watchlist(Base):
    __tablename__ = "watchlist"

    user_id = Column(Integer, ForeignKey('users.user_id'), primary_key=True, index=True)
    movie_id = Column(Integer, ForeignKey('movie.movie_id'), primary_key=True, index=True)

    user = relationship("Users", back_populates="watchlist")
    movie = relationship("Movie", back_populates="watchlist_users")

Users.watchlist = relationship("Watchlist", back_populates="user")
Movie.watchlist_users = relationship("Watchlist", back_populates="movie")

# Use the existing tables without creating new ones
Base.metadata = metadata