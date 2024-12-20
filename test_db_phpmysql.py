from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection URL for MySQL
DATABASE_URL = f"mysql+pymysql://{os.getenv('USER')}:{os.getenv('PASSWORD')}@{os.getenv('HOST')}:{os.getenv('PORT')}/{os.getenv('DATABASE')}"


def test_db_connection():
    try:
        # Create the SQLAlchemy engine
        engine = create_engine(DATABASE_URL)
        # Create a configured "Session" class
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        # Create a session
        session = SessionLocal()
        # Execute a simple query to test the connection
        result = session.execute(text("SELECT DATABASE();"))
        record = result.fetchone()
        print("You're connected to database: ", record)
        session.close()
    except Exception as e:
        print(f"Database connection failed: {e}")

if __name__ == "__main__":
    test_db_connection()