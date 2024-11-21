import pandas as pd
import ast
import re
import sqlalchemy
from sqlalchemy import create_engine, text
base_df = pd.read_csv("IMDb_Dataset_Edited.csv")

# function for adding new index col for actor, director, genre, writer, reordering id col to left
def new_index(base, id_col):
    base[id_col] = range(1, len(base) + 1)  # Add unique ID column
    return base.iloc[:,[1,0]]

# function for matching the ids between two tables for the composite key
def match_ids(movie_df, compound_df, other_df, other_id, other_name):
        movie_df = movie_df.iloc[:,[0,1,2]]
        compound_df = compound_df.iloc[:,[0,1]]

        # merge on (old) id, id found in the compound df
        first_merge = pd.merge(movie_df, compound_df, left_on=movie_df.columns[0], right_on=compound_df.columns[0], how='left')

        # merge on the name of subject in other_df, and name in the firstmerge
        second_merge = pd.merge(first_merge, other_df, left_on=first_merge.columns[3], right_on=other_df.columns[1], how='left')

        # reordering and renaming cols
        second_merge = second_merge.iloc[:,[1,4,2,3]]
        second_merge.columns = ["movie_id", other_id, "title", other_name]
        return second_merge

def remove_non_ascii(text):
    if isinstance(text, str):
        return re.sub(r'[^\x00-\x7F]', ' ', text)
    else:
        return text

def preprocessing(base):
    # Converting dates in dataset to standard date format, highly important to ensure dates are properly imported into SQL
    base.release_date = pd.to_datetime(base.release_date)

    # Dropping all columns with significant (>50%) amount of null values (with the exception of IMDB rating)
    base.drop(columns=["imdb_id","tagline","production_companies","production_countries","spoken_languages","AverageRating","Poster_Link","Certificate","Meta_score","Star1","Star2","Star3","Star4","Director_of_Photography","Producers","Music_Composer"], inplace=True)

    base.fillna({"IMDB_Rating":-1}, inplace=True) # fill missing rating values with 0
    base.fillna("Missing",inplace=True) # Filling all remaining null values with "Missing"

    base.drop_duplicates(inplace=True) # dropping duplicates while considering all columns
    base.drop(columns=["vote_average","vote_count","revenue","budget", "keywords","overview_sentiment", "original_title", "all_combined_keywords"], inplace=True) # dropping numerical columns with significant amount of 0 values + keywords, overview_sentiment, original_title because it is unnecessary for this assignment

    # Convert string to list with , delimiter
    base['Director'] = base['Director'].apply(lambda x: x.split(', '))
    base['Writer'] = base['Writer'].apply(lambda x: x.split(', '))

    # Convert string representation of lists to actual lists
    base['genres_list'] = base['genres_list'].apply(lambda x: ast.literal_eval(x))
    base['Cast_list'] = base['Cast_list'].apply(lambda x: ast.literal_eval(x))

    # seperating unique genres, actors, directors, writers

    director = pd.DataFrame(base['Director'].explode().unique(), columns=["Director"])
    writer = pd.DataFrame(base['Writer'].explode().unique(), columns=["Writer"])
    genres = pd.DataFrame(base['genres_list'].explode().unique(), columns=["Genre"])
    actors = pd.DataFrame(base['Cast_list'].explode().unique(), columns=["Actor Name"])

    # explode the columns with lists, for easier time when converting to SQL database later

    MovieDirector = base[["id","Director"]].explode("Director")
    MovieWriter = base[["id","Writer"]].explode("Writer")
    MovieGenre = base[["id","genres_list"]].explode("genres_list")
    MovieActor = base[["id","Cast_list"]].explode("Cast_list")

    actors = new_index(actors, 'actor_id')
    director = new_index(director, 'director_id')
    genres = new_index(genres, 'genre_id')
    writer = new_index(writer, 'writer_id')

    # making new id one, reordering cols
    # base.drop(columns=["id"], inplace=True)
    base["movie_id"] = range(1, len(base) + 1)
    base = base.iloc[:,[0,15,1,2,3,4,5,6,7,8,9]]

    actors.columns = ["actor_id","actor_name"]
    director.columns = ["director_id","director_name"]
    genres.columns = ["genre_id","genre_label"]
    writer.columns = ["writer_id","writer_name"]

    MovieActor = match_ids(base, MovieActor, actors, actors.columns[0], actors.columns[1])
    MovieDirector = match_ids(base, MovieDirector, director, director.columns[0], director.columns[1])
    MovieGenre = match_ids(base, MovieGenre, genres, genres.columns[0], genres.columns[1])
    MovieWriter = match_ids(base, MovieWriter, writer, writer.columns[0], writer.columns[1])

    base = base.iloc[:,[1,2,3,4,5,6,7,8,9,10]] # reordering to remove old id col

    # removing non-ascii chars
    base = base.map(remove_non_ascii)
    actors = actors.map(remove_non_ascii)
    director = director.map(remove_non_ascii)
    writer = writer.map(remove_non_ascii)
    genres = genres.map(remove_non_ascii)

    MovieActor = MovieActor.map(remove_non_ascii)
    MovieDirector = MovieDirector.map(remove_non_ascii)
    MovieWriter = MovieWriter.map(remove_non_ascii)
    MovieGenre = MovieGenre.map(remove_non_ascii)

    # dropping stubborn dupes from these tables
    MovieActor.drop_duplicates(inplace=True)
    MovieDirector.drop_duplicates(inplace=True)
    MovieWriter.drop_duplicates(inplace=True)
    MovieGenre.drop_duplicates(inplace=True)

    return base, actors, director, genres, writer, MovieActor, MovieDirector, MovieGenre, MovieWriter

Movie, Actor, Director, Genre, Writer, MovieActor, MovieDirector, MovieGenre, MovieWriter = preprocessing(base_df)

# exporting to csv, feel free to comment if you want
Movie.to_csv("Movie.csv", index=False)
Director.to_csv("Director.csv", index=False)
Writer.to_csv("Writer.csv", index=False)
Genre.to_csv("Genre.csv", index=False)
Actor.to_csv("Actor.csv", index=False)

MovieDirector.to_csv("MovieDirector.csv", index=False)
MovieWriter.to_csv("MovieWriter.csv", index=False)
MovieGenre.to_csv("MovieGenre.csv", index=False)
MovieActor.to_csv("MovieActor.csv", index=False)

# MySQL connection credentials
username = 'root'
password = ''
host = 'localhost'
database = 'IMDB_MovieDB'

# Create a MySQL connection engine using SQLAlchemy
# NOTES: MUST INCREASE MAX_PACKET_SIZE to 50M in bin config
engine = create_engine(f"mysql+mysqlconnector://{username}:{password}@{host}/{database}")

# create tables and set PKs, SKs
with engine.connect() as sql_con:
    # Independent tables
    print("Creating movie table...")
    sql_con.execute(text("""
                        CREATE TABLE `movie` (
                        `movie_id` int(20) NOT NULL,
                        `title` varchar(50) DEFAULT NULL,
                        `status` varchar(50) DEFAULT NULL,
                        `release_date` date DEFAULT NULL,
                        `runtime` int(20) DEFAULT NULL,
                        `adult` bool DEFAULT NULL,
                        `original_language` varchar(20) DEFAULT NULL,
                        `overview` text DEFAULT NULL,
                        `popularity` double DEFAULT NULL,
                        `release_year` year DEFAULT NULL,
                        PRIMARY KEY (`movie_id`)
                        ) ENGINE=InnoDB DEFAULT CHARSET=ascii COLLATE=ascii_bin"""))
    
    print("Creating actor table...")
    sql_con.execute(text("""
                        CREATE TABLE `actor` (
                        `actor_id` int(10) NOT NULL,
                        `actor_name` varchar(50) DEFAULT NULL,
                        PRIMARY KEY (`actor_id`)
                        ) 
                        ENGINE=InnoDB DEFAULT CHARSET=ascii COLLATE=ascii_bin
                        """))
    
    print("Creating director table...")
    sql_con.execute(text("""
                        CREATE TABLE `director` (
                        `director_id` int(10) NOT NULL,
                        `director_name` varchar(50) DEFAULT NULL,
                        PRIMARY KEY (`director_id`)
                        ) 
                        ENGINE=InnoDB DEFAULT CHARSET=ascii COLLATE=ascii_bin
                        """))
    
    print("Creating genre table...")
    sql_con.execute(text("""
                        CREATE TABLE `genre` (
                        `genre_id` int(20) NOT NULL,
                        `genre_label` varchar(50) DEFAULT NULL,
                        PRIMARY KEY (`genre_id`)
                        ) 
                        ENGINE=InnoDB DEFAULT CHARSET=ascii COLLATE=ascii_bin
                        """))
    
    print("Creating writer table...")
    sql_con.execute(text("""
                        CREATE TABLE `writer` (
                        `writer_id` int(20) NOT NULL,
                        `writer_name` varchar(50) DEFAULT NULL,
                        PRIMARY KEY (`writer_id`)
                        ) 
                        ENGINE=InnoDB DEFAULT CHARSET=ascii COLLATE=ascii_bin
                        """))

    # Dependent tables
    print("Creating movieactor table...")
    sql_con.execute(text("""
                        CREATE TABLE `movieactor` (
                        `movie_id` int(20) NOT NULL,
                        `actor_id` int(20) NOT NULL,
                        `title` varchar(50) DEFAULT NULL,
                        `actor_name` varchar(50) DEFAULT NULL,
                        PRIMARY KEY (`movie_id`, `actor_id`),
                        FOREIGN KEY (`movie_id`) REFERENCES movie(`movie_id`),
                        FOREIGN KEY (`actor_id`) REFERENCES actor(`actor_id`)
                        ) ENGINE=InnoDB DEFAULT CHARSET=ascii COLLATE=ascii_bin
                        """))
    
    print("Creating moviedirector table...")
    sql_con.execute(text("""
                        CREATE TABLE `moviedirector` (
                        `movie_id` int(20) NOT NULL,
                        `director_id` int(20) NOT NULL,
                        `title` varchar(50) DEFAULT NULL,
                        `director_name` varchar(50) DEFAULT NULL,
                        PRIMARY KEY (`movie_id`, `director_id`),
                        FOREIGN KEY (`movie_id`) REFERENCES movie(`movie_id`),
                        FOREIGN KEY (`director_id`) REFERENCES director(`director_id`)
                        ) ENGINE=InnoDB DEFAULT CHARSET=ascii COLLATE=ascii_bin
                        """))
    
    print("Creating moviegenre table...")
    sql_con.execute(text("""
                        CREATE TABLE `moviegenre` (
                        `movie_id` int(20) NOT NULL,
                        `genre_id` int(20) NOT NULL,
                        `title` varchar(50) DEFAULT NULL,
                        `genre_label` varchar(50) DEFAULT NULL,
                        PRIMARY KEY (`movie_id`, `genre_id`),
                        FOREIGN KEY (`movie_id`) REFERENCES movie(`movie_id`),
                        FOREIGN KEY (`genre_id`) REFERENCES genre(`genre_id`)
                        ) ENGINE=InnoDB DEFAULT CHARSET=ascii COLLATE=ascii_bin
                        """))
    
    print("Creating moviewriter table...")
    sql_con.execute(text("""
                        CREATE TABLE `moviewriter` (
                        `movie_id` int(20) NOT NULL,
                        `writer_id` int(20) NOT NULL,
                        `title` varchar(50) DEFAULT NULL,
                        `writer_name` varchar(50) DEFAULT NULL,
                        PRIMARY KEY (`movie_id`, `writer_id`),
                        FOREIGN KEY (`movie_id`) REFERENCES movie(`movie_id`),
                        FOREIGN KEY (`writer_id`) REFERENCES writer(`writer_id`)
                        ) ENGINE=InnoDB DEFAULT CHARSET=ascii COLLATE=ascii_bin
                        """))
    
# import dfs into SQL tables
print("Importing into movie...")
Movie.to_sql('movie', con=engine, if_exists='append', index=False)
print("Importing into actor...")
Actor.to_sql('actor', con=engine, if_exists='append', index=False)
print("Importing into director...")
Director.to_sql('director', con=engine, if_exists='append', index=False)
print("Importing into genre...")
Genre.to_sql('genre', con=engine, if_exists='append', index=False)
print("Importing into writer...")
Writer.to_sql('writer', con=engine, if_exists='append', index=False)

print("Importing into movieactor...")
MovieActor.to_sql('movieactor', con=engine, if_exists='append', index=False)
print("Importing into moviedirector...")
MovieDirector.to_sql('moviedirector', con=engine, if_exists='append', index=False)
print("Importing into moviegenre...")
MovieGenre.to_sql('moviegenre', con=engine, if_exists='append', index=False)
print("Importing into moviewriter...")
MovieWriter.to_sql('moviewriter', con=engine, if_exists='append', index=False)
print(f"Database {database} has been initialized!")




