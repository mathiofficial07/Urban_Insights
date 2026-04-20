import pandas as pd
import os

def check_file(filename, skiprows):
    print(f"Checking {filename}...")
    if not os.path.exists(filename):
        print(f"File {filename} not found!")
        return
    try:
        # Try reading with python engine and skipping rows
        df = pd.read_csv(filename, skiprows=skiprows, nrows=5, engine='python')
        print(f"Successfully read first 5 rows of {filename}")
        print("Columns:", df.columns.tolist())
        print(df.head())
    except Exception as e:
        print(f"Error reading {filename}: {e}")

check_file("ml dataset.csv", 22)
check_file("ml dataset1.csv", 20)
