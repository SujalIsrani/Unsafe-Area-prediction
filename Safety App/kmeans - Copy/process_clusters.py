import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

# Load the data from the CSV file
df_numeric = pd.read_csv('RandomLocations.csv')

# Create a copy of the DataFrame to ensure the original stays intact
df_copy = df_numeric.copy()

# Extract the relevant features
features = df_copy[['Lighting', 'Openness', 'Visibility', 'Public transport', 
                    'Security', 'People', 'Safety Score']]

# Encode categorical features using basic mapping
mapping_lighting = {'None': 0, 'Few': 1}
mapping_openness = {'Not open': 0, 'Partially open': 1, 'Mostly open': 2}
mapping_visibility = {'No eyes': 0, 'Few eyes': 1}
mapping_transport = {'Unavailable': 0, 'Nearby': 1}
mapping_security = {'Minimal': 0, 'Moderate': 1}
mapping_people = {'Deserted': 0, 'Few people': 1, 'Some crowd': 2}

# Apply the mappings to the features
df_copy['Lighting'] = df_copy['Lighting'].map(mapping_lighting)
df_copy['Openness'] = df_copy['Openness'].map(mapping_openness)
df_copy['Visibility'] = df_copy['Visibility'].map(mapping_visibility)
df_copy['Public transport'] = df_copy['Public transport'].map(mapping_transport)
df_copy['Security'] = df_copy['Security'].map(mapping_security)
df_copy['People'] = df_copy['People'].map(mapping_people)

# Drop rows with NaN values after mapping
df_copy = df_copy.dropna(subset=['Lighting', 'Openness', 'Visibility', 
                                 'Public transport', 'Security', 'People', 'Safety Score'])

# Extract coordinates
coordinates = df_copy[['latitude', 'longitude']].astype(float)

# Step 1: Normalize the data for K-means
scaler = StandardScaler()
features_scaled = scaler.fit_transform(df_copy[['Lighting', 'Openness', 'Visibility', 
                                                'Public transport', 'Security', 
                                                'People', 'Safety Score']])

# Step 2: Apply K-means clustering (with 3 clusters as an example)
kmeans = KMeans(n_clusters=3, random_state=42)
df_copy['Cluster'] = kmeans.fit_predict(features_scaled)

# Step 3: Save the data with cluster labels (without modifying the original CSV)
df_output = df_copy[['latitude', 'longitude', 'Cluster']]
file_path_clustered = r'C:\Users\Acer\OneDrive\Desktop\kmeans - Copy\women_safety_clustered_output.csv'
df_output.to_csv(file_path_clustered, index=False)

print(f"Clustered data saved at: {file_path_clustered}")
