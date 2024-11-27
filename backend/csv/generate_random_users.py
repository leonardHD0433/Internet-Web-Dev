import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_users(num_users=100):
    # Set random seed for reproducibility
    np.random.seed(42)
    
    # Generate random dates between 2021-2024
    start_date = datetime(2021, 1, 1)
    end_date = datetime(2024, 11, 20)
    
    dates = []
    for _ in range(num_users):
        days_between = (end_date - start_date).days
        random_days = random.randint(0, days_between)
        random_date = start_date + timedelta(days=random_days)
        dates.append(random_date)
    
    # Generate unique emails
    domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
    emails = []
    used_names = set()
    
    for i in range(num_users):
        while True:
            name = f"user{i+1}"
            if name not in used_names:
                used_names.add(name)
                domain = random.choice(domains)
                email = f"{name}@{domain}"
                emails.append(email)
                break
    
    # Create DataFrame
    df = pd.DataFrame({
        'password': [f'password{i+1}' for i in range(num_users)],
        'user_name': [f'User {i+1}' for i in range(num_users)],
        'user_email': emails,
        'date_joined': dates
    })
    
    return df

# Generate users and save to CSV
users_df = generate_users(300)
users_df.to_csv('backend/csv/Users_Dummy_Data.csv', index=False)