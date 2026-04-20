import pandas as pd
try:
    print("Loading df1...")
    df1 = pd.read_csv("ml dataset.csv", skiprows=22)
    print("df1 columns:", df1.columns.tolist())
    
    print("Loading df2...")
    df2 = pd.read_csv("ml dataset1.csv", skiprows=20)
    print("df2 columns:", df2.columns.tolist())
    
    column_mapping = {
        'Complaint Type': 'complaint_type',
        'Additional_Details': 'description'
    }
    df1.rename(columns=column_mapping, inplace=True)
    df2.rename(columns=column_mapping, inplace=True)
    
    df = pd.concat([df1, df2], ignore_index=True)
    print("Combined df columns:", df.columns.tolist())
    print("Head of 'complaint_type':")
    print(df['complaint_type'].head())
    print("Head of 'description':")
    print(df['description'].head())
    print("Total rows:", len(df))
    
except Exception as e:
    print("Error:", e)
