import pandas as pd
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

def load_csv_cleansed(filename, header_row):
    with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
    # Skip preamble and read from header_row
    import io
    # lines indices are 0-based, so line 23 is index 22
    content = "".join(lines[header_row-1:])
    return pd.read_csv(io.StringIO(content))

# Load dataset
df1 = load_csv_cleansed("ml dataset.csv", 23)
df2 = load_csv_cleansed("ml dataset1.csv", 21)

# Rename columns to match the script's expectations
column_mapping = {
    'Complaint Type': 'complaint_type',
    'Additional_Details': 'description'
}
df1.rename(columns=column_mapping, inplace=True)
df2.rename(columns=column_mapping, inplace=True)

# Combine
df = pd.concat([df1, df2], ignore_index=True)

# Select correct columns
df = df[['complaint_type', 'description']]

# Remove empty rows
df.dropna(inplace=True)

X = df['description']
y = df['complaint_type']

# Text vectorization
vectorizer = TfidfVectorizer()
X_vec = vectorizer.fit_transform(X)

# Train model
model = LogisticRegression(max_iter=1000)
model.fit(X_vec, y)

# Save files
pickle.dump(model, open("model.pkl", "wb"))
pickle.dump(vectorizer, open("vectorizer.pkl", "wb"))

print("Model trained successfully!")
print(df.columns)
exit()