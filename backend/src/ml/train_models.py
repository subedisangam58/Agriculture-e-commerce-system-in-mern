import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

# Load the dataset
df = pd.read_csv("data_core.csv")

# Encode 'Soil Type' for crop model
le_soil = LabelEncoder()
df['Soil Type Encoded'] = le_soil.fit_transform(df['Soil Type'])

# Encode 'Crop Type' for both models
le_crop = LabelEncoder()
df['Crop Type Encoded'] = le_crop.fit_transform(df['Crop Type'])

# Encode 'Fertilizer Name' for fertilizer model
le_fert = LabelEncoder()
df['Fertilizer Name Encoded'] = le_fert.fit_transform(df['Fertilizer Name'])

# ------------------ CROP RECOMMENDER MODEL ------------------
X_crop = df[['Temparature', 'Humidity', 'Moisture', 'Soil Type Encoded', 'Nitrogen', 'Phosphorous', 'Potassium']]
y_crop = df['Crop Type Encoded']

Xc_train, Xc_test, yc_train, yc_test = train_test_split(X_crop, y_crop, test_size=0.2, random_state=42)
crop_model = RandomForestClassifier()
crop_model.fit(Xc_train, yc_train)
crop_preds = crop_model.predict(Xc_test)
print("Crop Recommender Accuracy:", accuracy_score(yc_test, crop_preds))

# Save crop model and soil encoder
joblib.dump(crop_model, "crop_model.pkl")
joblib.dump(le_soil, "le_soil.pkl")
joblib.dump(le_crop, "le_crop.pkl")

# ------------------ FERTILIZER RECOMMENDER MODEL ------------------
X_fert = df[['Crop Type Encoded', 'Nitrogen', 'Phosphorous', 'Potassium']]
y_fert = df['Fertilizer Name Encoded']

Xf_train, Xf_test, yf_train, yf_test = train_test_split(X_fert, y_fert, test_size=0.2, random_state=42)
fert_model = DecisionTreeClassifier()
fert_model.fit(Xf_train, yf_train)
fert_preds = fert_model.predict(Xf_test)
print("Fertilizer Recommender Accuracy:", accuracy_score(yf_test, fert_preds))

# Save fertilizer model and fertilizer encoder
joblib.dump(fert_model, "fert_model.pkl")
joblib.dump(le_fert, "le_fert.pkl")