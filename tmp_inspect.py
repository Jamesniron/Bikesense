import pandas as pd
df = pd.read_csv("../Motor-Bike-Price-Prediction-In-Sri-Lanka/used-bikes.csv")
print("Columns:")
print(df.columns.tolist())
print("\nFirst 3 rows:")
print(df.head(3).to_dict(orient='records'))
print("\nUnique values counts for key columns:")
for col in ['Brand', 'Model', 'Bike Type', 'Seller']:
    if col in df.columns:
        print(f"{col}: {df[col].nunique()} unique values")
