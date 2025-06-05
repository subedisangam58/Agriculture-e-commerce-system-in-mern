import sys
import json
import joblib
import numpy as np
import os

# Set base directory to current script folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load data from Node.js request
data = json.loads(sys.argv[1])

# Load models and encoders with full path
model = joblib.load(os.path.join(BASE_DIR, "fert_model.pkl"))
le_crop = joblib.load(os.path.join(BASE_DIR, "le_crop.pkl"))
le_fert = joblib.load(os.path.join(BASE_DIR, "le_fert.pkl"))

# Prepare input
crop_encoded = le_crop.transform([data["crop_type"]])[0]
features = np.array([[crop_encoded, data["nitrogen"], data["phosphorous"], data["potassium"]]])

# Predict
prediction = model.predict(features)
fertilizer = le_fert.inverse_transform(prediction)[0]

# Return result
print(json.dumps({ "recommended_fertilizer": fertilizer }))