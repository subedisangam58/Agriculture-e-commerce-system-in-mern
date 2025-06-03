import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import joblib

# Load dataset
df = pd.read_csv('src/ml/data_core.csv')

# Encode categorical columns
label_encoders = {}
for col in ['Soil Type', 'Crop Type', 'Fertilizer Name']:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    label_encoders[col] = le

# Select input features (remove Crop Type from input)
features = ['Temparature', 'Humidity', 'Moisture', 'Soil Type', 'Nitrogen', 'Potassium', 'Phosphorous']
X = df[features]
X['Soil Type'] = df['Soil Type']  # encoded already

# Targets
y_crop = df['Crop Type']
y_fertilizer = df['Fertilizer Name']

# Train/test split
X_train, _, y_crop_train, _ = train_test_split(X, y_crop, test_size=0.2, random_state=42)
_, _, y_fertilizer_train, _ = train_test_split(X, y_fertilizer, test_size=0.2, random_state=42)

# Train models
crop_model = RandomForestClassifier()
crop_model.fit(X_train, y_crop_train)

fertilizer_model = RandomForestClassifier()
fertilizer_model.fit(X_train, y_fertilizer_train)

# Save everything
joblib.dump(crop_model, 'src/ml/crop_model.pkl')
joblib.dump(fertilizer_model, 'src/ml/fertilizer_model.pkl')
joblib.dump(label_encoders, 'src/ml/label_encoders.pkl')

print("Models and encoders saved")