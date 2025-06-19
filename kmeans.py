import pandas as pd
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from sklearn.cluster import KMeans

# Load original data
df = pd.read_csv('RandomLocations.csv')
df_copy = df.copy()

# Label encode non-numeric columns
categorical_columns = ['Lighting', 'Openness', 'Visibility', 'Public transport', 'Security', 'People']
for col in categorical_columns:
    le = LabelEncoder()
    df_copy[col] = le.fit_transform(df_copy[col].astype(str))

# Weights for weighted score
weights = {
    'Lighting': 0.25,
    'Visibility': 0.20,
    'Security': 0.20,
    'Public transport': 0.15,
    'Openness': 0.10,
    'People': 0.10
}

# Normalize using MinMaxScaler
scaler = MinMaxScaler()
scaled = scaler.fit_transform(df_copy[list(weights.keys())])
scaled_df = pd.DataFrame(scaled, columns=weights.keys())

# Calculate per-location weighted score
df_copy['Weighted Safety Score'] = sum(scaled_df[col] * w for col, w in weights.items())
df_copy['Weighted Safety Score'] = (df_copy['Weighted Safety Score'] * 10).round(2)  # Optional: scale 0–10

# Run clustering using per-location score
kmeans = KMeans(n_clusters=3, random_state=42)
df_copy['Cluster'] = kmeans.fit_predict(df_copy[['Weighted Safety Score']])

# Save only what we need for the map
df_output = df_copy[['Latitude', 'Longitude', 'Cluster', 'Weighted Safety Score']]
df_output.to_csv('new_women_safety_clustered_output.csv', index=False)

# Save per-cluster average scores
cluster_avg = df_copy.groupby('Cluster')['Weighted Safety Score'].mean().round(2).to_dict()

import json
with open('cluster_averages.json', 'w') as f:
    json.dump(cluster_avg, f)
