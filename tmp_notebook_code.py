import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
%matplotlib inline

# ==================== CELL ====================

import warnings
warnings.filterwarnings('ignore')

# ==================== CELL ====================

data = '/content/used-bikes.csv'

df = pd.read_csv(data)

# ==================== CELL ====================

print("### Missing Values Analysis ###")
missing_values = df.isnull().sum()
missing_values = missing_values[missing_values > 0]

if not missing_values.empty:
    print("\nMissing Value Counts:")
    print(missing_values)
    print("\nPercentage of Missing Values:")
    print((missing_values / len(df)) * 100)
else:
    print("No missing values found in the DataFrame.")

print("\n### DataFrame Columns ###")
print(df.columns)

print("\n### Data Cleaning for Numerical Features ###")
# Clean and convert 'Price' to numeric
df['Price_Cleaned'] = df['Price'].astype(str).str.replace('Rs ', '', regex=False).str.replace(',', '', regex=False).astype(float)

# Clean and convert 'Mileage' (assuming this is kmsDriven) to numeric
df['kmsDriven_Cleaned'] = df['Mileage'].astype(str).str.replace(' km', '', regex=False).str.replace(',', '', regex=False).astype(float)

# Clean and convert 'Capacity' to numeric (extract numbers before 'cc')
df['Capacity_Cleaned'] = df['Capacity'].astype(str).str.extract(r'(\d+)').astype(float)

# Convert 'Year' to numeric, coercing errors to NaN
df['Year_Cleaned'] = pd.to_numeric(df['Year'], errors='coerce')

print("Numerical columns cleaned: 'Price_Cleaned', 'kmsDriven_Cleaned', 'Capacity_Cleaned', 'Year_Cleaned'")


print("\n### Data Visualization (Charts) ###")
# Histograms for numerical data
numerical_cols = ['Price_Cleaned', 'kmsDriven_Cleaned', 'Year_Cleaned', 'Capacity_Cleaned']
plt.figure(figsize=(15, 10))
for i, col in enumerate(numerical_cols):
    plt.subplot(2, 2, i + 1)
    sns.histplot(df[col].dropna(), kde=True)
    plt.title(f'Distribution of {col}')
plt.tight_layout()
plt.show()

# Count plot for 'Brand' (using 'Brand' instead of 'Company')
print("\nTop 10 Bike Brands:")
if df['Brand'].nunique() > 20: # If too many unique values, show top N
    plt.figure(figsize=(12, 7))
    sns.countplot(data=df, y='Brand', order=df['Brand'].value_counts().head(10).index, palette='viridis')
    plt.title('Top 10 Bike Brands')
else:
    plt.figure(figsize=(12, 7))
    sns.countplot(data=df, y='Brand', order=df['Brand'].value_counts().index, palette='viridis')
    plt.title('Count of Bikes by Brand')
plt.show()


print("\n### Correlation Matrix ###")
# Correlation matrix for numerical columns
# Drop rows with NaNs in cleaned numerical columns before correlation calculation
corr_df = df[numerical_cols].dropna().corr()

if not corr_df.empty:
    plt.figure(figsize=(8, 6))
    sns.heatmap(corr_df, annot=True, cmap='coolwarm', fmt=".2f")
    plt.title('Correlation Matrix of Numerical Features')
    plt.show()
else:
    print("No numerical columns available for correlation analysis or all values are NaN.")

# ==================== CELL ====================

print("### Data Cleaning Process ###\n")

# 1. Profile and Inspect the Data
print("--- 1. Profiling and Inspecting Data ---")
print("\nDataFrame Head:")
print(df.head())
print("\nDataFrame Info:")
df.info()
print("\nDataFrame Description (Numerical):")
print(df.describe())
print("\n")

# 2. Remove Duplicates and Irrelevant Data
print("--- 2. Removing Duplicates and Irrelevant Data ---")
initial_rows = df.shape[0]
df.drop_duplicates(inplace=True)
duplicates_removed = initial_rows - df.shape[0]
print(f"Removed {duplicates_removed} duplicate rows.")

# Drop original columns that have been cleaned and are now redundant
# Also drop highly textual or unique identifier columns less relevant for direct modeling
columns_to_drop = ['Summary', 'url', 'Title', 'Post_Details', 'Price', 'Year', 'Mileage', 'Capacity']
df.drop(columns=columns_to_drop, errors='ignore', inplace=True)
print(f"Dropped columns: {', '.join(columns_to_drop)}")
print("\n")

# 3. Fix Structural Errors (Standardize Categorical Data)
print("--- 3. Fixing Structural Errors ---")
# Standardize casing for categorical columns
for col in ['Bike Type', 'Brand', 'Model', 'Trim/Edition', 'Seller']:
    if col in df.columns:
        df[col] = df[col].astype(str).str.lower().str.strip()
        print(f"Standardized '{col}' to lowercase.")

# Ensure cleaned numerical columns are numeric
for col in ['Price_Cleaned', 'kmsDriven_Cleaned', 'Capacity_Cleaned', 'Year_Cleaned']:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors='coerce')
        print(f"Ensured '{col}' is numeric.")
print("\n")

# 4. Handle Missing Values
print("--- 4. Handling Missing Values ---")
print("Missing values before imputation:")
print(df.isnull().sum()[df.isnull().sum() > 0])

# Impute categorical missing values with 'unknown'
for col in ['Trim/Edition', 'Seller']:
    if col in df.columns:
        df[col].fillna('unknown', inplace=True)
        print(f"Imputed missing values in '{col}' with 'unknown'.")

# Impute numerical missing values with the median
numerical_cleaned_cols = ['Price_Cleaned', 'kmsDriven_Cleaned', 'Capacity_Cleaned', 'Bike_Age'] # Changed from Year_Cleaned to Bike_Age
for col in numerical_cleaned_cols:
    if col in df.columns and df[col].isnull().any():
        median_val = df[col].median()
        df[col].fillna(median_val, inplace=True)
        print(f"Imputed missing values in '{col}' with median: {median_val}.")
print("\nMissing values after imputation:")
print(df.isnull().sum()[df.isnull().sum() > 0]) # Should be empty or minimal
print("\n")

# 5. Detect and Manage Outliers (Visualization for Detection)
print("--- 5. Detecting Outliers ---")
print("Visualizing outliers using box plots for cleaned numerical features:")
plt.figure(figsize=(15, 10))
for i, col in enumerate(numerical_cleaned_cols):
    plt.subplot(2, 2, i + 1)
    sns.boxplot(y=df[col])
    plt.title(f'Box plot of {col}')
plt.tight_layout()
plt.show()
print("Further action on outliers (e.g., capping, removal) can be decided based on domain knowledge.\n")

# 6. Outlier Management (Capping using IQR)
print("--- 6. Managing Outliers (Capping using IQR) ---")
for col in numerical_cleaned_cols:
    if col in df.columns:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR

        # Cap outliers
        df[col] = np.where(df[col] < lower_bound, lower_bound, df[col])
        df[col] = np.where(df[col] > upper_bound, upper_bound, df[col])
        print(f"Capped outliers in '{col}' using IQR method. Lower: {lower_bound:.2f}, Upper: {upper_bound:.2f}")
print("\n")

# 7. Validate Cleaned Data
print("--- 7. Validating Cleaned Data ---")
print("\nDataFrame Info after cleaning:")
df.info()
print("\nMissing values after cleaning (should be 0 for most):")
print(df.isnull().sum()[df.isnull().sum() > 0])
print("\nDataFrame Head after cleaning:")
print(df.head())
print("\nData Cleaning process complete.")

# ==================== CELL ====================

plt.figure(figsize=(10, 6))
sns.scatterplot(x='kmsDriven_Cleaned', y='Price_Cleaned', data=df, alpha=0.6)
plt.title('Scatter Plot of Price vs. Kilometers Driven')
plt.xlabel('Kilometers Driven (Cleaned)')
plt.ylabel('Price (Cleaned)')
plt.grid(True, linestyle='--', alpha=0.7)
plt.show()

# ==================== CELL ====================

correlation = corr_df.loc['Price_Cleaned', 'kmsDriven_Cleaned']
print(f"Correlation between Price_Cleaned and kmsDriven_Cleaned: {correlation:.4f}")

# ==================== CELL ====================

# The column 'Bike Type' no longer exists in the DataFrame because it was one-hot encoded and the original column was dropped.
# To fix this, we will reconstruct a temporary 'Bike Type' column for plotting purposes from the one-hot encoded columns.

# Create a temporary copy of the DataFrame for plotting to avoid modifying the original 'df'
df_plot_temp = df.copy()

# Identify the one-hot encoded 'Bike Type' columns
bike_type_prefix = 'Bike Type_'
ohe_bike_type_cols = [col for col in df_plot_temp.columns if col.startswith(bike_type_prefix)]

# Create a new column to store the reconstructed bike type.
# Initialize with a placeholder for the category that was dropped during one-hot encoding (if drop_first=True was used).
df_plot_temp['Reconstructed_Bike_Type'] = 'Other/Dropped Type'

# Iterate through the one-hot encoded columns and assign the corresponding bike type
for col in ohe_bike_type_cols:
    category_name = col.replace(bike_type_prefix, '')
    df_plot_temp.loc[df_plot_temp[col] == True, 'Reconstructed_Bike_Type'] = category_name

# Now, use the reconstructed column for plotting
plt.figure(figsize=(12, 7))
sns.boxplot(x='Reconstructed_Bike_Type', y='Price_Cleaned', data=df_plot_temp, palette='viridis')
plt.title('Price Distribution by Bike Type')
plt.xlabel('Bike Type')
plt.ylabel('Price (Cleaned)')
plt.xticks(rotation=45, ha='right')
plt.grid(axis='y', linestyle='--', alpha=0.7)
plt.tight_layout()
plt.show()

# ==================== CELL ====================

print("### Feature Engineering Process ###\n")

# 1. Feature Transformation
print("--- 1. Feature Transformation ---")

# Log Transformation for skewed numerical features
# Check skewness and apply log transformation if highly skewed
# (Using a small constant +1 to handle potential zero values)
cols_to_log_transform = ['Price_Cleaned', 'kmsDriven_Cleaned', 'Capacity_Cleaned']
for col in cols_to_log_transform:
    # Only apply log transformation if the original column exists AND its log-transformed version does not already exist
    if col in df.columns and f"{col}_log" not in df.columns:
        print(f"Original skewness of {col}: {df[col].skew():.2f}")
        df[col + '_log'] = np.log1p(df[col]) # log1p handles zero values gracefully
        print(f"Log-transformed skewness of {col}_log: {df[col + '_log'].skew():.2f}")
    elif f"{col}_log" in df.columns:
        print(f"Log-transformed column {col}_log already exists. Skipping transformation for {col}.")
    else:
        print(f"Original column {col} not found. Skipping log transformation.")

print("\nOne-Hot Encoding for Categorical Features:")
# Identify categorical columns for one-hot encoding
categorical_cols_for_ohe = [
    'Bike Type', 'Brand', 'Model', 'Trim/Edition', 'Seller'
]

# Filter out columns that are already one-hot encoded or don't exist
cols_to_apply_ohe = [col for col in categorical_cols_for_ohe if col in df.columns]

if cols_to_apply_ohe:
    df = pd.get_dummies(df, columns=cols_to_apply_ohe, drop_first=True)
    print(f"Applied one-hot encoding to: {', '.join(cols_to_apply_ohe)}")
    print(f"New DataFrame shape after OHE: {df.shape}")
else:
    print("All specified categorical columns are either already one-hot encoded or do not exist in the DataFrame. Skipping one-hot encoding.")
print("\n")

# 2. Feature Creation (Construction)
print("--- 2. Feature Creation (Construction) ---")

# Create 'Bike_Age' feature
if 'Year_Cleaned' in df.columns and 'Bike_Age' not in df.columns:
    current_year = pd.to_datetime('now').year
    df['Bike_Age'] = current_year - df['Year_Cleaned']
    print(f"Created 'Bike_Age' feature from 'Year_Cleaned'. (Current Year: {current_year})")
    print(f"Bike_Age descriptive statistics:\n{df['Bike_Age'].describe()}")
elif 'Bike_Age' in df.columns:
    print(f"'Bike_Age' feature already exists. Skipping creation.")
else:
    print(f"Original column 'Year_Cleaned' not found to create 'Bike_Age'. Skipping creation.")


# Remove original 'Year_Cleaned' if 'Bike_Age' is preferred and 'Year_Cleaned' still exists
if 'Year_Cleaned' in df.columns:
    df.drop(columns=['Year_Cleaned'], errors='ignore', inplace=True)
    print("Dropped 'Year_Cleaned' column.")
else:
    print("'Year_Cleaned' column not found or already dropped.")
print("\n")

# 3. Feature Extraction (e.g., PCA, not implemented here but noted)
print("--- 3. Feature Extraction ---")
print("Feature extraction techniques like PCA can be applied to reduce dimensionality, especially after one-hot encoding.")
print("This step is not implemented in this cell but can be added if needed.")
print("\n")

# 4. Feature Selection
print("--- 4. Feature Selection ---")
print("Feature selection techniques (e.g., RFE, SelectKBest, Lasso) are typically applied after feature engineering and before model training to identify the most relevant features and avoid overfitting.")
print("This step is not implemented in this cell but would be a logical next step.")
print("\n")

# 5. Feature Learning
print("--- 5. Feature Learning ---")
print("Feature learning typically involves using machine learning models (e.g., neural networks) to automatically discover and extract features from raw data. This is an advanced topic often used in deep learning.")
print("This step is beyond the scope of this current traditional feature engineering process.")
print("\nFeature Engineering process complete. Review the DataFrame's new columns and shape.")
print("\nDataFrame Head after Feature Engineering:")
print(df.head())

# ==================== CELL ====================

import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

print("### Training XGBoost Model ###\n")

# Define target and features
# Use the log-transformed price as the target
y = df['Price_Cleaned_log']

# Drop target related columns and original numerical columns if their log-transformed versions are features
# Also drop 'Bike_Age' if you only want to use 'Year_Cleaned_log'
# Current setup uses Bike_Age and log-transformed versions of kmsDriven and Capacity
features_to_drop = ['Price_Cleaned', 'Price_Cleaned_log', 'kmsDriven_Cleaned', 'Capacity_Cleaned']
X = df.drop(columns=features_to_drop, errors='ignore')

print(f"Features (X) shape: {X.shape}")
print(f"Target (y) shape: {y.shape}")
print(f"Features used for training: {X.columns.tolist()[:5]}... and {len(X.columns)-5} more")

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print(f"\nTraining set size: {X_train.shape[0]} samples")
print(f"Test set size: {X_test.shape[0]} samples")

# Initialize and train the XGBoost Regressor model
print("\nInitializing and training XGBoost Regressor...")
xgb_model = xgb.XGBRegressor(
    objective='reg:squarederror', # For regression tasks
    n_estimators=500,             # Number of boosting rounds
    learning_rate=0.05,           # Step size shrinkage to prevent overfitting
    max_depth=6,                  # Maximum depth of a tree
    subsample=0.8,                # Subsample ratio of the training instance
    colsample_bytree=0.8,         # Subsample ratio of columns when constructing each tree
    random_state=42,
    n_jobs=-1                     # Use all available CPU cores
)
xgb_model.fit(X_train, y_train)
print("XGBoost model training complete.")

# Make predictions on the test set
y_pred_log = xgb_model.predict(X_test)

# Evaluate the model on log-transformed values
mse_log = mean_squared_error(y_test, y_pred_log)
r2_log = r2_score(y_test, y_pred_log)

print(f"\nMean Squared Error (log-transformed): {mse_log:.4f}")
print(f"R-squared (log-transformed): {r2_log:.4f}")

# Convert predictions and actual values back to original price scale for more interpretable evaluation
y_test_original = np.expm1(y_test) # Inverse of np.log1p
y_pred_original = np.expm1(y_pred_log)

mse_original = mean_squared_error(y_test_original, y_pred_original)
rmse_original = np.sqrt(mse_original)
r2_original = r2_score(y_test_original, y_pred_original)

print(f"\nMean Squared Error (original scale): {mse_original:.2f}")
print(f"Root Mean Squared Error (original scale): {rmse_original:.2f}")
print(f"R-squared (original scale): {r2_original:.4f}")

print("\nXGBoost model training and evaluation complete.")

# ==================== CELL ====================

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np

print("### Training Random Forest Model ###\n")

# X_train, X_test, y_train, y_test are already defined from the previous step
print(f"Training set size: {X_train.shape[0]} samples")
print(f"Test set size: {X_test.shape[0]} samples")

# Initialize and train the Random Forest Regressor model
print("\nInitializing and training Random Forest Regressor...")
rf_model = RandomForestRegressor(
    n_estimators=100,  # Number of trees in the forest
    random_state=42,   # For reproducibility
    n_jobs=-1          # Use all available CPU cores
)
rf_model.fit(X_train, y_train)
print("Random Forest model training complete.")

# Make predictions on the test set
y_pred_rf_log = rf_model.predict(X_test)

# Evaluate the model on log-transformed values
mse_rf_log = mean_squared_error(y_test, y_pred_rf_log)
r2_rf_log = r2_score(y_test, y_pred_rf_log)

print(f"\nMean Squared Error (log-transformed): {mse_rf_log:.4f}")
print(f"R-squared (log-transformed): {r2_rf_log:.4f}")

# Convert predictions and actual values back to original price scale
y_test_original = np.expm1(y_test) # Inverse of np.log1p
y_pred_rf_original = np.expm1(y_pred_rf_log)

mse_rf_original = mean_squared_error(y_test_original, y_pred_rf_original)
rmse_rf_original = np.sqrt(mse_rf_original)
r2_rf_original = r2_score(y_test_original, y_pred_rf_original)

print(f"\nMean Squared Error (original scale): {mse_rf_original:.2f}")
print(f"Root Mean Squared Error (original scale): {rmse_rf_original:.2f}")
print(f"R-squared (original scale): {r2_rf_original:.4f}")

print("\nRandom Forest model training and evaluation complete.")

# ==================== CELL ====================

print("### Model Performance Summary ###")
print("\n--- XGBoost Regressor ---")
print(f"R-squared (original scale): {r2_original:.4f}")
print(f"Root Mean Squared Error (original scale): {rmse_original:.2f}")

print("\n--- Random Forest Regressor ---")
print(f"R-squared (original scale): {r2_rf_original:.4f}")
print(f"Root Mean Squared Error (original scale): {rmse_rf_original:.2f}")