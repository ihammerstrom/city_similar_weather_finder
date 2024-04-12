import numpy as np
import os
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from Config import FILES_DIR, KEY_VALUES_TO_COPY, KEY_VALUES_TO_AVG, MONTHS_IN_YEAR, MIN_YEAR, MAX_YEAR, MINIMUM_SAME_MONTHS_SAMPLE_SIZE
from CityData import CityData
import shutil
import math
import time


# get distance between two points using the Haversine formula
def get_distance(lat1, lon1, lat2, lon2):
    # Radius of the Earth in kilometers
    R = 6371.0
    
    # Convert latitude and longitude from degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Differences in coordinates
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    # Haversine formula
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    
    return distance


# check if the city is far enough from the other cities
def is_far_enough(city, other_cities, min_distance=100):
    """
    Check if 'city' is at least 'min_distance' km away from all 'other_cities'.
    """
    for other_city in other_cities:
        distance = get_distance(city.latitude, city.longitude, other_city.latitude, other_city.longitude)
        if distance < min_distance:
            return False
    return True


# check if list of columns exist in the dataframe
def columns_exist(df, columns_to_check):
    return all(col in df.columns for col in columns_to_check)


# check if there are a minimum count of values under each relevant column for each month
def has_sufficient_values(cdf, key_values_to_avg, min_values):
    # 1) group the data by the month on each date
    # 2) reduce the dataframe to the the columns (key_values_to_avg) that we care about
    # 3) change to get the datapoint count/quantity within each month-column mix
    # 4) reduce to the minimum within each column across all months
    # 5) reduce to get the minimum datapoint count across all columns across all months
    return cdf.groupby(cdf['DATE'].dt.month)[key_values_to_avg].count().min().min() > min_values


# get a similarity metric by calculating the cosine_similarity between the dataframe weather
def get_similarity_metric(df1, df2, weights=None):
    # Define default weights if none provided
    if weights is not None:
        # Apply weights to each column
        start_time = time.time()
        for column, weight in weights.items():
            if weight != 1:  # optimization
                if column in df1.columns and column in df2.columns:
                    df1[column] *= weight
                    df2[column] *= weight
        print(f"2.1Time taken: {time.time() - start_time} seconds")

    start_time = time.time()
    # Flatten the DataFrames into vectors
    vector1 = df1.values.flatten()
    vector2 = df2.values.flatten()
    print(f"2.2Time taken: {time.time() - start_time} seconds")

    start_time = time.time()
    # Calculate cosine similarity between the two vectors
    similarity = cosine_similarity([vector1], [vector2])
    print(f"2.3Time taken: {time.time() - start_time} seconds")

    # Return the similarity as a single value.
    # this can be reduced to similarity[0][0] as this value (ranging -1 to 1, where 1 is identical)
    # is effectively a summary of similarity over the entirety of the matrix
    return similarity[0][0]


class CityFinder:
    def __init__(self):
        self.city_dfs = self.get_valid_weather_dataframes()

    def get_valid_weather_dataframes(self):
        city_dfs = []
        source_dir = FILES_DIR

        processed_dir = f'accepted_files_from_{source_dir}'
        copying_files = False

        # we are also going to be copying useful files over to avoid reprocessing on restarts
        if not os.path.exists(processed_dir):
            os.makedirs(processed_dir)
            copying_files = True
        else: # if copied dir already exists, use that
            source_dir = processed_dir
    
        files_quantity = len(os.listdir(source_dir))
        i = 0
        #for file in directory
        for file in os.listdir(source_dir):

            #if it's fits the naming scheme of files we want
            if file.endswith('.csv'):

                cdf = pd.read_csv(os.path.join(source_dir, file))

                # if has correct columns
                if columns_exist(cdf, KEY_VALUES_TO_AVG):

                    # trim the dataframe to only be the years we care about.
                    cdf['DATE'] = pd.to_datetime(cdf['DATE'])
                    cdf = cdf[(cdf['DATE'].dt.year >= MIN_YEAR) & (cdf['DATE'].dt.year <= MAX_YEAR)]

                    # if there are values after trimming the years
                    if not cdf.empty and has_sufficient_values(cdf, KEY_VALUES_TO_AVG, MINIMUM_SAME_MONTHS_SAMPLE_SIZE):
                        monthly_avgs_df = cdf.groupby(cdf['DATE'].dt.month)[KEY_VALUES_TO_AVG].mean()

                        valid = True
                        for key in KEY_VALUES_TO_AVG:
                            # check if all months are included
                            if len(monthly_avgs_df[key]) != MONTHS_IN_YEAR: 
                                valid = False
                                break

                        if valid: # this file is good and has passed all checks
                            if copying_files: # copy for later to avoid reprocessing
                                source_file = source_dir + file
                                print(f'copying from {source_file} to {processed_dir}')
                                shutil.copy(source_file, processed_dir)

                            labels = {}
                            for k in KEY_VALUES_TO_COPY:
                                labels.update({k: cdf[k].iloc[0]}) # take first, assume all values the same
                            labels.update({'filename': file})

                            monthly_avgs_df.labels = labels

                            city_dfs.append(monthly_avgs_df)
            i += 1
            print(f'processed {file} {i}/{files_quantity}')
        
        print(f'kept {len(city_dfs)}/{files_quantity}')
        return city_dfs

    # return cities that have weather data similar to the passed reference city
    # count: count of cities to return
    # weights: optional weights argument to change how important certain factors (ex: Precipitation) are
    # min_ditance: minimum between cities returned
    # returns: a list of similar cities
    def get_similar_cities(self, reference_city_name, count, weights=None, min_distance=100):

        # find reference city's dataframe by a name match
        start_time = time.time()
        reference_city_df = None
        for cdf in self.city_dfs:
            if cdf.labels['NAME'] == reference_city_name:
                reference_city_df = cdf
                break
        print(f"1Time taken: {time.time() - start_time} seconds")

        # if we found the city
        if reference_city_df is not None:
            similarities_city_data = []
            # calculate the similarity to each other city
            start_time = time.time()
            for weather_df in self.city_dfs:
                avg_similarity = get_similarity_metric(reference_city_df[KEY_VALUES_TO_AVG], weather_df[KEY_VALUES_TO_AVG], weights=weights)
                similarities_city_data.append(CityData(weather_df.labels["NAME"], avg_similarity, weather_df.labels["LATITUDE"], weather_df.labels["LONGITUDE"], weather_df))
            print(f"2Time taken: {time.time() - start_time} seconds")

            sorted_data = sorted(similarities_city_data, key=lambda city:city.similarity, reverse=True)
            sorted_data_of_sufficient_distance = []

            # filter out cities not far enough away until we have "count" quantity of cities
            # keep original city as reference 
            start_time = time.time()
            for city in sorted_data:
                if is_far_enough(city, sorted_data_of_sufficient_distance, min_distance=min_distance) or \
                        city.name == reference_city_df.labels["NAME"]:
                    sorted_data_of_sufficient_distance.append(city)
                
                if len(sorted_data_of_sufficient_distance) == count: # we have enough cities
                    break
            print(f"3Time taken: {time.time() - start_time} seconds")

            # return the sorted data of a length up to "count" where the first(most similar) value should be the reference city
            
            return sorted_data_of_sufficient_distance

        else:
            raise Exception(f'couldn\'t find city {reference_city_name}')


    # get a list of available cities
    def get_city_list(self):
        return [cdf.labels["NAME"] for cdf in self.city_dfs]

    # get citys that have a substring in their name (for autocomplete, etc)
    def get_city_names_with_substring(self, query):
        return [city_df.labels["NAME"] for city_df in self.city_dfs if query.lower() in city_df.labels["NAME"].lower()]


if __name__ == '__main__':
    my_city_finder = CityFinder()

    for city in my_city_finder.get_similar_cities("BRIDGEPORT MUNICIPAL AIRPORT, TX US", 3):
        print(city)




# # print(len(city_dfs))

# # Convert reference dataframe to array
# reference_city = city_dfs[0]






# most_similar_index = np.argmax(similarities)







# print(similarities)
# print(type(similarities))
# print(max(similarities))


# print("Cosine Similarity Matrix:")
# print(most_similar_index)





# # initializing points in numpy arrays

# P1 = np.array((9, 16, 25))
# P2 = np.array((1, 4, 9))

# # subtracting both the vectors

# temp = P1 - P2

# # Using Formula

# euclid_dist = np.sqrt(np.dot(temp.T, temp))

# # printing Euclidean distance
# print(euclid_dist)






































