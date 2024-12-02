import os
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import text
from models import Users, engine
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Path to the CSV file
csv_file_path = 'backend/ini/Users_Dummy_Data.csv'

# Read the CSV file into a DataFrame
users_df = pd.read_csv(csv_file_path)

# Create a new session
session = Session(bind=engine)

# Insert users into the database
for index, row in users_df.iterrows():
    user = Users(
        user_name=row['user_name'],
        user_email=row['user_email'],
        password=row['password'],
        date_joined=row['date_joined']
    )
    session.add(user)

session.commit()

# Execute the given SQL statements
session.execute(text("""
    INSERT INTO users (password, user_name, user_email, date_joined) 
    VALUES ("password", "Johnathan", "Joh@gmail.com", "2021-01-01");
"""))

session.execute(text("""
    INSERT INTO watchlist (user_id, movie_id) 
    VALUES (1, 3692), (1, 8910), (1, 16498), (1, 37014), (1, 71679), (1, 24561), (1, 16718), (1, 20043);
"""))

session.commit()

# Close the session
session.close()

print("CSV data and additional SQL statements executed successfully.")