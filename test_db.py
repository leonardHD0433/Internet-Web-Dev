import os
from dotenv import load_dotenv
import mysql.connector

# Load environment variables from .env file
load_dotenv(dotenv_path='./database/.env')

# Get environment variables
root_password = os.getenv('ROOT_PASSWORD')
database = os.getenv('DATABASE')
user = os.getenv('USER')
password = os.getenv('PASSWORD')
host = os.getenv('HOST')
port = os.getenv('PORT')

# Create a connection string
connection_config = {
    'user': user,
    'password': password,
    'host': host,
    'port': port,
    'database': database,
    'auth_plugin': 'mysql_native_password'
}

# Connect to the database
connection = None
try:
    connection = mysql.connector.connect(**connection_config)
    if connection.is_connected():
        print("Connection successful")
        cursor = connection.cursor()
        cursor.execute("SELECT DATABASE();")
        record = cursor.fetchone()
        print("You're connected to database: ", record)
except mysql.connector.Error as err:
    print(f"Error: {err}")
finally:
    if connection and connection.is_connected():
        cursor.close()
        connection.close()
        print("Connection closed")