import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN
import matplotlib.pyplot as plt
import folium
from folium.plugins import MarkerCluster

# -----------------------
# 1. Load the CSV
# -----------------------
data = pd.read_csv('path_to_your_downloaded_file.csv')

# -----------------------
# 2. Select Features for Clustering
# -----------------------
# We will select the relevant features for DBSCAN clustering
# Assuming 'Light', 'Population', 'Distance to Transport', 'CCTV Score', and 'Crime Score' are the columns
X = data[['light', 'population', 'dist_to_transport', 'cctv_score', 'crime_score']]

# -----------------------
# 3. Normalize the Data
# -----------------------
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# -----------------------
# 4. Apply DBSCAN
# -----------------------
dbscan = DBSCAN(eps=0.3, min_samples=10)  # You can tune eps and min_samples
data['cluster'] = dbscan.fit_predict(X_scaled)

# -----------------------
# 5. Visualize Clusters (Matplotlib)
# -----------------------
plt.figure(figsize=(10, 6))
plt.scatter(data['longitude'], data['latitude'], c=data['cluster'], cmap='viridis', s=10)
plt.title('DBSCAN Clustering of Mumbai + Thane Areas (Women\'s Safety)')
plt.xlabel('Longitude')
plt.ylabel('Latitude')
plt.colorbar(label='Cluster Label')
plt.show()

# -----------------------
# 6. Visualize on Map (Folium)
# -----------------------
# Center map around Mumbai + Thane
mumbai_map = folium.Map(location=[19.0760, 72.8777], zoom_start=12)

# Add marker clusters
marker_cluster = MarkerCluster().add_to(mumbai_map)

# Add points to the map with cluster colors
for i, row in data.iterrows():
    folium.CircleMarker(
        location=[row['latitude'], row['longitude']],
        radius=5,
        color=plt.cm.viridis((row['cluster'] + 1) / max(data['cluster']) if row['cluster'] != -1 else 0),  # Different color for each cluster
        fill=True,
        fill_opacity=0.6
    ).add_to(marker_cluster)

# Save map to HTML
mumbai_map.save("dbscan_clusters_mumbai_thane.html")
