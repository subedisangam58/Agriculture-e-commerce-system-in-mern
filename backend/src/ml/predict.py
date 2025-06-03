import sys
import json
import joblib
import numpy as np

# Load models and encoders
try:
    crop_model = joblib.load('src/ml/crop_model.pkl')
    fertilizer_model = joblib.load('src/ml/fertilizer_model.pkl')
    encoders = joblib.load('src/ml/label_encoders.pkl')
except Exception as e:
    print(json.dumps({ "error": f"Model loading error: {str(e)}" }))
    sys.exit()

# Read JSON input
try:
    data = json.loads(sys.argv[1])
except Exception as e:
    print(json.dumps({ "error": f"Invalid input format: {str(e)}" }))
    sys.exit()

try:
    # Validate and encode Soil Type
    if data['SoilType'] not in encoders['Soil Type'].classes_:
        raise ValueError(f"Soil Type '{data['SoilType']}' not recognized.")

    soil_encoded = encoders['Soil Type'].transform([data['SoilType']])[0]

    # Prepare input data for prediction
    input_data = [
        float(data['Temparature']),
        float(data['Humidity']),
        float(data['Moisture']),
        soil_encoded,
        int(data['Nitrogen']),
        int(data['Potassium']),
        int(data['Phosphorous']),
    ]

    # Predict crop and fertilizer
    crop_pred = crop_model.predict([input_data])[0]
    fert_pred = fertilizer_model.predict([input_data])[0]

    # Decode predictions to labels
    crop_label = encoders['Crop Type'].inverse_transform([crop_pred])[0]
    fert_label = encoders['Fertilizer Name'].inverse_transform([fert_pred])[0]

    # Return result
    print(json.dumps({
        "recommended_crop": crop_label,
        "recommended_fertilizer": fert_label
    }))

except Exception as e:
    print(json.dumps({ "error": str(e) }))
    sys.exit()