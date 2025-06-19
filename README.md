# 🚨 Predicting Potential Unsafe Areas for Women using ML and Geospatial Data

A data-driven project aimed at identifying and visualizing unsafe zones for women in urban areas using unsupervised machine learning and geospatial intelligence. The system integrates clustering algorithms (K-Means and DBSCAN), real and synthetic safety data, and a Progressive Web App (PWA) to provide real-time safety alerts and emergency support.

---

## 📌 Features

- Weighted scoring of urban safety factors (lighting, visibility, security, transport, etc.)
- Clustering using **K-Means** and **DBSCAN** to classify areas as safe, moderate, or unsafe
- Geospatial data extraction using **Google Earth Engine (GEE)**
- Visualization of clusters and heatmaps using **Leaflet.js**
- Real-time Progressive Web App (PWA) with:
  - Location tracking
  - 2km unsafe zone alert system
  - Emergency service overlays (hospitals, police stations)
  - SOS alert feature

---

## 📊 Data Sources

- **Real Data**:
  - Nighttime lights (GEE)
  - Population density (GEE)
  - Road networks and transport hubs (CSV)
  
- **Synthetic Data**:
  - Crime rate
  - CCTV presence
  - Gender ratio
  - Commercial activity
  - Proximity to police stations

---

## 🧠 ML Techniques Used

- **Weighted Average Scoring**: Safety index computed using weighted feature scores.
- **K-Means Clustering**: Categorizes locations into 3 zones (Safe, Moderate, Unsafe).
- **DBSCAN Clustering**: Detects arbitrary-shaped unsafe clusters and outliers effectively.

---

## 🌍 Tech Stack

- **Python**, **Scikit-learn** – ML Model Development  
- **Google Earth Engine (GEE)** – Geospatial Data Collection  
- **Leaflet.js** – Interactive Map Visualization  
- **HTML/CSS/JavaScript** – Web Frontend  

---

