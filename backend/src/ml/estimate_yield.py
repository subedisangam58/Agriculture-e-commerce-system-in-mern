import sys
import json
import pandas as pd
import os

# Base path = location of this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load input
data = json.loads(sys.argv[1])
crop = data["crop"]
district = data["district"]
area = float(data["land_area"])

# Correct CSV path
csv_path = os.path.join(BASE_DIR, "area-production-and-yield-of-cereal-crops-in-districts-2014-2015.csv")
df = pd.read_csv(csv_path)

# Filter to yield rows
df_yield = df[df['Production Area Yield'] == 'Yield']

# Find the matching crop row
crop_yield_row = df_yield[df_yield['Crop Type'].str.lower() == crop.lower()]

# Validation
if crop_yield_row.empty:
    print(json.dumps({ "error": "Invalid crop type" }))
    sys.exit(1)

if district not in crop_yield_row.columns:
    print(json.dumps({ "error": "Invalid district name" }))
    sys.exit(1)

# Fetch average yield per hectare
avg_yield = float(crop_yield_row[district].values[0])

# Calculate total yield
estimated_yield = avg_yield * area

# Return result
print(json.dumps({
    "average_yield_per_ha": avg_yield,
    "estimated_total_yield": estimated_yield
}))