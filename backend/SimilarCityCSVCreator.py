import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
import time
from datetime import timedelta
import sys

def get_haversine_distance(lat1, lon1, lat2, lon2):
    # Radius of the Earth in kilometers
    R = 6371.0
    # Convert coordinates from degrees to radians
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
    # Difference in coordinates
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    # Haversine formula
    a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    distance = R * c
    return distance

def add_similar_cities_to_csv(csv_filepath, output_csv_filepath, distances):
    start_time = time.time()
    df = pd.read_csv(csv_filepath)
    df.set_index('Geoname ID', inplace=True)

    weather_columns = [col for col in df.columns if 'temp_' in col or 'precipitation_' in col]
    city_vectors = df[weather_columns].fillna(0).to_numpy()
    scaler = StandardScaler()
    city_vectors_scaled = scaler.fit_transform(city_vectors)
    similarity_matrix = cosine_similarity(city_vectors_scaled)

    sim_df = pd.DataFrame(similarity_matrix, index=df.index, columns=df.index)

    # Initialize the dictionary to manage used cities for each reference city and distance
    used_cities_by_reference = {}

    total_operations = len(df) * len(distances) * 19  # 19 columns per distance
    operations_done = 0
    update_interval = 100  # Update progress every 100 operations

    # Iterate over each row (each city) in the DataFrame to calculate similar cities
    for index, row in df.iterrows():
        for distance in distances:
            # Retrieve similar cities ensuring they are at least 'distance' km apart
            similar_cities = get_similar_cities(index, sim_df.loc[index], df, used_cities_by_reference, distance)
            
            # Set similar city data for each distance
            for i, city_data in enumerate(similar_cities, start=1):
                column_name = f'similar_city_{i}_{distance}km'
                df.at[index, column_name] = city_data
                operations_done += 1

                if operations_done % update_interval == 0:
                    # Time estimation and progress update
                    current_time = time.time()
                    elapsed_time = current_time - start_time
                    estimated_total_time = elapsed_time / operations_done * total_operations
                    remaining_time = estimated_total_time - elapsed_time
                    print(f"Progress: {operations_done}/{total_operations} operations done. "
                          f"Estimated time remaining: {timedelta(seconds=remaining_time)}", end='\r')

    df.reset_index(inplace=True)
    df.to_csv(output_csv_filepath, index=False)
    print(f"\nDataFrame with similar cities saved to: {output_csv_filepath}")
    print(f"Total time elapsed: {timedelta(seconds=time.time() - start_time)}")


def get_similar_cities(geoname_id, similarities, full_df, used_cities_by_reference, distance):
    current_city = full_df.loc[geoname_id]
    lat1, lon1 = map(float, current_city['Coordinates'].split(","))
    selected_cities = []
    
    # Ensure the reference city has an entry in the dictionary for tracking used cities
    if geoname_id not in used_cities_by_reference:
        used_cities_by_reference[geoname_id] = {d: set() for d in distances}

    for gid, similarity in similarities.drop(geoname_id).sort_values(ascending=False).items():
        lat2, lon2 = map(float, full_df.loc[gid, 'Coordinates'].split(","))
        candidate_distance = get_haversine_distance(lat1, lon1, lat2, lon2)

        if candidate_distance < distance:
            continue

        # Check the candidate city against all previously selected cities
        too_close = any(get_haversine_distance(lat2, lon2, float(full_df.loc[other_gid, 'Coordinates'].split(",")[0]),
                                               float(full_df.loc[other_gid, 'Coordinates'].split(",")[1])) < distance
                        for other_gid in selected_cities)
        if not too_close:
            selected_cities.append(gid)
            used_cities_by_reference[geoname_id][distance].add(gid)
            if len(selected_cities) >= 19:  # Assuming we want no more than 19 similar cities
                break

    return [f"{gid}_{full_df.loc[gid, 'ASCII Name']}_{similarities[gid]:.2f}" for gid in selected_cities]



if __name__ == '__main__':
    csv_input_path = sys.argv[1] 
    csv_output_path = csv_input_path.split('.')[0] + "_with_distances.csv"
    distances = [100, 200, 500, 1000]  # Distances in kilometers

    add_similar_cities_to_csv(csv_input_path, csv_output_path, distances)