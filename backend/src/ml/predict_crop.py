import sys
import json
import joblib
import numpy as np
import os

data = json.loads(sys.argv[1])

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, "crop_model.pkl"))
le_soil = joblib.load(os.path.join(BASE_DIR, "le_soil.pkl"))
le_crop = joblib.load(os.path.join(BASE_DIR, "le_crop.pkl"))

soil = le_soil.transform([data["soil_type"]])[0]
features = np.array([[
    data["temperature"],
    data["humidity"],
    data["moisture"],
    soil,
    data["nitrogen"],
    data["phosphorous"],
    data["potassium"]
]])

prediction = model.predict(features)
crop = le_crop.inverse_transform(prediction)[0]

print(json.dumps({ "recommended_crop": crop }))