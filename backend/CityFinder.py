import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from Config import USED_DISTANCES, KEY_VALUES_TO_COPY, KEY_VALUES_TO_AVG, MONTHS_IN_YEAR, MIN_YEAR, MAX_YEAR, MINIMUM_SAME_MONTHS_SAMPLE_SIZE, DATA_CSV
from CityData import CityData
import time
from SimilarCityCSVCreator import get_haversine_distance
from copy import deepcopy
from pprint import pprint


# check if the city is far enough from the other cities
# def is_far_enough(city, other_cities, min_distance=100):
#     """
#     Check if 'city' is at least 'min_distance' km away from all 'other_cities'.
#     """
#     for other_city in other_cities:
#         distance = get_haversine_distance(city.latitude, city.longitude, other_city.latitude, other_city.longitude)
#         if distance < min_distance:
#             return False
#     return True


# prepares response for what frontend expects
def prepare_city_weather_data(city_data):
    """ Prepare city weather data for frontend consumption, optionally shifting Southern Hemisphere data. """
    transformed_data = []

    for key, city in city_data.items():
        # Extract weather data columns into lists
        weather_df = city['weather_data']

        prcp = weather_df['PRCP'].tolist()
        tavg = weather_df['TAVG'].tolist()
        tmax = weather_df['TMAX'].tolist()
        tmin = weather_df['TMIN'].tolist()

        # Extract metadata
        metadata = city['metadata']
        name = metadata['NAME']
        latitude = metadata['LATITUDE']
        longitude = metadata['LONGITUDE']
        geo_id = metadata['GEO_ID']
        hemisphere = metadata['HEMISPHERE']


        # Extract similarity value from key if available
        similarity = float(key.split('_')[-1])

        # Append formatted city data
        city_info = {
            'PRCP': prcp,
            'TAVG': tavg,
            'TMAX': tmax,
            'TMIN': tmin,
            'latitude': latitude,
            'longitude': longitude,
            'name': name,
            'similarity': similarity,
            'geoname_id': geo_id,
            'hemisphere': hemisphere
        }
        transformed_data.append(city_info)

    return transformed_data

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
        # start_time = time.time()
        df1_copy = df1.copy(deep=True)
        df2_copy = df2.copy(deep=True)

        for column, weight in weights.items():
            if weight != 1:  # optimization
                if column in df1.columns and column in df2.columns:
                    df1_copy.loc[:, column] = df1_copy.loc[:, column] * weight
                    df2_copy.loc[:, column] = df2_copy.loc[:, column] * weight
        # print(f"2.1Time taken: {time.time() - start_time} seconds")

    else: # can just use original dataframes, we're not altering values
        df1_copy = df1
        df2_copy = df2

    # start_time = time.time()
    # Flatten the DataFrames into vectors
    vector1 = df1_copy.values.flatten()
    vector2 = df2_copy.values.flatten()
    # print(f"2.2Time taken: {time.time() - start_time} seconds")

    # start_time = time.time()
    # Calculate cosine similarity between the two vectors
    similarity = cosine_similarity([vector1], [vector2])
    # print(f"2.3Time taken: {time.time() - start_time} seconds")

    # Return the similarity as a single value.
    # this can be reduced to similarity[0][0] as this value (ranging -1 to 1, where 1 is identical)
    # is effectively a summary of similarity over the entirety of the matrix
    return similarity[0][0]

class CityFinder:
    def __init__(self):
        self.city_obj_dict = self.get_city_weather_data_from_csv(DATA_CSV)

    def get_city_weather_data_from_csv(self, csv_filepath):
        # Read the CSV data into a DataFrame
        df = pd.read_csv(csv_filepath)
        print(df.columns)
        # Initialize a dictionary to hold the DataFrames for each city, keyed by 'Geoname ID'
        city_data = {}

        # Loop over each row in the DataFrame to create a separate DataFrame for each city
        for index, row in df.iterrows():
            temp_columns = [f'meantemp_{i}' for i in range(1, 13)] + \
                           [f'maxtemp_{i}' for i in range(1, 13)] + \
                           [f'mintemp_{i}' for i in range(1, 13)] + \
                           [f'precipitation_{i}' for i in range(1, 13)]
            
            if row[temp_columns].isnull().any():
                continue

            weather_data = {
                'DATE': list(range(1, 13)),
                'TAVG': [row[f'meantemp_{i}'] for i in range(1, 13)],
                'TMAX': [row[f'maxtemp_{i}'] for i in range(1, 13)],
                'TMIN': [row[f'mintemp_{i}'] for i in range(1, 13)],
                'PRCP': [row[f'precipitation_{i}'] for i in range(1, 13)],
            }
            city_df = pd.DataFrame(weather_data)

            # Create a dictionary to hold similar and shifted similar cities organized by distance
            similar_cities = {dist: [] for dist in USED_DISTANCES}
            shifted_similar_cities = {dist: [] for dist in USED_DISTANCES}

            for col in df.columns:
                if any(col.endswith(f"{dist}") for dist in USED_DISTANCES):
                    distance_key = col.split('_')[-1]
                    if 'shifted' in col:
                        shifted_similar_cities[distance_key].append(row[col])
                    else:
                        similar_cities[distance_key].append(row[col])

            print(df.columns)
            geo_id = str(row['Geoname ID'])
            city_data[geo_id] = {
                'weather_data': city_df,
                'similar_cities': similar_cities,
                'shifted_similar_cities': shifted_similar_cities,
                'metadata': {
                    'NAME': f"{row['ASCII Name']}, {row['Country name EN']}",
                    'LATITUDE': float(row['Coordinates'].split(',')[0]),
                    'LONGITUDE': float(row['Coordinates'].split(',')[1]),
                    'HEMISPHERE': row['Hemisphere'],
                    'GEO_ID': geo_id
                }
            }
        return city_data

    def get_similar_cities(self, geoname_id, count, min_distance, shift_southern_hemisphere_climate=False):

        # Check if the city is in the dictionary
        if geoname_id in self.city_obj_dict:
            city_info = self.city_obj_dict[geoname_id]

            if shift_southern_hemisphere_climate:
                dataset_key = 'shifted_similar_cities'
                print("ok")
            else:
                dataset_key = 'similar_cities'
                print("ok2")
            # dataset_key = 'shifted_similar_cities' if shift_southern_hemisphere_climate == True else 'similar_cities'
            distance_key = f"{min_distance}km"

            print(dataset_key, shift_southern_hemisphere_climate)
            if distance_key in city_info[dataset_key]:
                # Retrieve similar city keys
                similar_city_keys = city_info[dataset_key][distance_key][:count]
                print(dataset_key, similar_city_keys)
                similar_cities_dict = {}

                for similar_city_key in similar_city_keys: # like 1856057_Nagoya_0.78
                    for city_k in self.city_obj_dict: # like 1856057
                        if city_k in similar_city_key: # if 1856057 in 1856057_Nagoya_0.78
                            similar_cities_dict[similar_city_key] = self.city_obj_dict[city_k]
                        elif (city_k == geoname_id): # if 1856057 is geoname_id
                            # set similarity to 1 for reference city to itself
                            similar_cities_dict[f"{geoname_id}_{city_info['metadata']['NAME']}_1"] = city_info

                # Fetch full city data for each key
                return prepare_city_weather_data(similar_cities_dict)
            else: # the below would only happen on bad request
                raise Exception(f"No similar cities found for the specified distance key '{distance_key}' \
                                 in city with geoname_id: '{geoname_id}'.")

        else:
            raise Exception(f"City with key '{geoname_id}' not found.")

    # def get_similar_cities(self, geoname_id, count, min_distance, shift_southern_hemisphere_climate=False):
    #     """ Retrieve similar cities, optionally shifting climate data for Southern Hemisphere comparisons. """
    #     if geoname_id in self.city_obj_dict:
    #         city_info = self.city_obj_dict[geoname_id]
    #         distance_key = f"{min_distance}km"
    #         if distance_key in city_info['similar_cities']:
    #             similar_city_keys = city_info['similar_cities'][distance_key][:count]
    #             similar_cities_dict = {}

    #             for similar_city_key in similar_city_keys:
    #                 city_key = similar_city_key.split('_')[0]  # Assuming city_key is the first part of the similar_city_key
    #                 if city_key in self.city_obj_dict:
    #                     similar_cities_dict[similar_city_key] = self.city_obj_dict[city_key]

    #             # Fetch full city data for each key with climate data adjustment if required
    #             return prepare_city_weather_data(similar_cities_dict, shift_climate=shift_southern_hemisphere_climate)
    #         else:
    #             raise Exception(f"No similar cities found for the specified distance key '{distance_key}' \
    #                             in city with geoname_id: '{geoname_id}'.")
    #     else:
    #         raise Exception(f"City with key '{geoname_id}' not found.")





    def get_city_list(self):
        return [{'label': city['metadata']['NAME'], 'value': key} for key, city in self.city_obj_dict.items()]

    def get_city_names_with_substring(self, query):
        return [
                {'label': city['metadata']['NAME'],
                 'value': key}
                for key, city in self.city_obj_dict.items() if query.lower() in city['metadata']['NAME'].lower()
            ]

# class CityFinder:
#     def __init__(self):
#         # self.city_dfs = self.get_valid_weather_dataframes()


#         csv_filepath = DATA_CSV

#         # Call the function with the CSV file path
#         # Replace the filepath with your actual file location when running this locally
#         self.city_dfs = self.get_city_weather_data_from_csv(csv_filepath)

#         # Example usage: Accessing the first city's DataFrame and its labels
#         first_city_df = self.city_dfs[0]
#         print(first_city_df)
#         print(first_city_df.labels)


#     def get_city_weather_data_from_csv(self, csv_filepath):
#         # Read the CSV data into a DataFrame
#         df = pd.read_csv(csv_filepath)
        
#         # Initialize a list to hold the DataFrames for each city
#         city_dfs = []

#         # Loop over each row in the DataFrame to create a separate DataFrame for each city
#         for index, row in df.iterrows():
#             # Extract temperature and precipitation data
#             temp_columns = [f'meantemp_{i}' for i in range(1, 13)] + \
#                            [f'maxtemp_{i}' for i in range(1, 13)] + \
#                            [f'mintemp_{i}' for i in range(1, 13)] + \
#                            [f'precipitation_{i}' for i in range(1, 13)]
#             if row[temp_columns].isnull().any():
#                 continue

#             temp_precip_data = {
#                 'DATE': list(range(1, 13)),
#                 'TAVG': [row[f'meantemp_{i}'] for i in range(1, 13)],
#                 'TMAX': [row[f'maxtemp_{i}'] for i in range(1, 13)],
#                 'TMIN': [row[f'mintemp_{i}'] for i in range(1, 13)],
#                 'PRCP': [row[f'precipitation_{i}'] for i in range(1, 13)]
#             }
#             city_df = pd.DataFrame(temp_precip_data)

#             # Organize similar cities by distance
#             similar_cities = {}
#             for col in df.columns:
#                 if 'similar_city_' in col:
#                     distance = col.split('_')[-1][:-2]  # Extract distance and remove 'km'
#                     if distance not in similar_cities:
#                         similar_cities[distance] = []
#                     similar_cities[distance].append(row[col])

#             # Add metadata and similar city data to the DataFrame
#             city_df.labels = {
#                 'NAME': f"{row['ASCII Name']}, {row['Country name EN']}",
#                 'LATITUDE': float(row['Coordinates'].split(',')[0]),
#                 'LONGITUDE': float(row['Coordinates'].split(',')[1].lstrip())
#             }
#             city_df.similar_cities = similar_cities

#             # Add the DataFrame to the list
#             city_dfs.append(city_df)
        
#         return city_dfs
    

#     def get_similar_cities(self, reference_city_name, count, min_distance=100):
#         # Find reference city's DataFrame by a name match
#         reference_city_df = None
#         for cdf in self.city_dfs:
#             # print(reference_city_name, cdf.labels['NAME'])
#             if cdf.labels['NAME'] == reference_city_name:
#                 reference_city_df = cdf
#                 break


#         # If the city is found
#         if reference_city_df is not None:
#             distance_key = f"{min_distance}"  # Construct the key for the desired distance
#             # Fetch the list of similar cities for the specified distance
#             print(distance_key, reference_city_df.similar_cities)
#             if distance_key in reference_city_df.similar_cities:
#                 # Limit the results to the specified count and return
#                 return reference_city_df.similar_cities[distance_key][:count]
#         else:
#             # If the reference city is not found, raise an exception
#             raise Exception(f"Couldn't find city '{reference_city_name}'.")


#    # get a list of available cities
#     def get_city_list(self):
#         return [cdf.labels["NAME"] for cdf in self.city_dfs]

#     # get citys that have a substring in their name (for autocomplete, etc)
#     def get_city_names_with_substring(self, query):
#         return [city_df.labels["NAME"] for city_df in self.city_dfs if query.lower() in city_df.labels["NAME"].lower()]






    # def get_valid_weather_dataframes(self):
    #     city_dfs = []
    #     source_dir = FILES_DIR

    #     processed_dir = f'accepted_files_from_{source_dir}'
    #     copying_files = False

    #     # we are also going to be copying useful files over to avoid reprocessing on restarts
    #     if not os.path.exists(processed_dir):
    #         os.makedirs(processed_dir)
    #         copying_files = True
    #     else: # if copied dir already exists, use that
    #         source_dir = processed_dir
    
    #     files_quantity = len(os.listdir(source_dir))
    #     i = 0
    #     #for file in directory
    #     for file in os.listdir(source_dir):

    #         #if it's fits the naming scheme of files we want
    #         if file.endswith('.csv'):

    #             cdf = pd.read_csv(os.path.join(source_dir, file))

    #             # if has correct columns
    #             if columns_exist(cdf, KEY_VALUES_TO_AVG):

    #                 # trim the dataframe to only be the years we care about.
    #                 cdf['DATE'] = pd.to_datetime(cdf['DATE'])
    #                 cdf = cdf[(cdf['DATE'].dt.year >= MIN_YEAR) & (cdf['DATE'].dt.year <= MAX_YEAR)]

    #                 # if there are values after trimming the years
    #                 if not cdf.empty and has_sufficient_values(cdf, KEY_VALUES_TO_AVG, MINIMUM_SAME_MONTHS_SAMPLE_SIZE):
    #                     monthly_avgs_df = cdf.groupby(cdf['DATE'].dt.month)[KEY_VALUES_TO_AVG].mean()

    #                     valid = True
    #                     for key in KEY_VALUES_TO_AVG:
    #                         # check if all months are included
    #                         if len(monthly_avgs_df[key]) != MONTHS_IN_YEAR: 
    #                             valid = False
    #                             break

    #                     if valid: # this file is good and has passed all checks
    #                         if copying_files: # copy for later to avoid reprocessing
    #                             source_file = source_dir + file
    #                             print(f'copying from {source_file} to {processed_dir}')
    #                             shutil.copy(source_file, processed_dir)

    #                         labels = {}
    #                         for k in KEY_VALUES_TO_COPY:
    #                             labels.update({k: cdf[k].iloc[0]}) # take first, assume all values the same
    #                         labels.update({'filename': file})

    #                         monthly_avgs_df.labels = labels

    #                         city_dfs.append(monthly_avgs_df)
    #         i += 1
    #         print(f'processed {file} {i}/{files_quantity}')
        
    #     print(f'kept {len(city_dfs)}/{files_quantity}')
    #     print(city_dfs[0:3])
    #     return city_dfs



    # # return cities that have weather data similar to the passed reference city
    # # count: count of cities to return
    # # weights: optional weights argument to change how important certain factors (ex: Precipitation) are
    # # min_ditance: minimum between cities returned
    # # returns: a list of similar cities
    # def get_similar_cities(self, reference_city_name, count, weights=None, min_distance=100):

    #     # find reference city's dataframe by a name match
    #     start_time = time.time()
    #     reference_city_df = None
    #     for cdf in self.city_dfs:
    #         if cdf.labels['NAME'] == reference_city_name:
    #             reference_city_df = cdf
    #             break
    #     print(f"1Time taken: {time.time() - start_time} seconds")

    #     # if we found the city
    #     if reference_city_df is not None:
    #         similarities_city_data = []
    #         # calculate the similarity to each other city
    #         start_time = time.time()
    #         for weather_df in self.city_dfs:
    #             # print(weather_df.labels["NAME"])
    #             avg_similarity = get_similarity_metric(reference_city_df[KEY_VALUES_TO_AVG], weather_df[KEY_VALUES_TO_AVG], weights=weights)
    #             similarities_city_data.append(CityData(weather_df.labels["NAME"], avg_similarity, weather_df.labels["LATITUDE"], weather_df.labels["LONGITUDE"], weather_df))
    #         print(f"2Time taken: {time.time() - start_time} seconds")

    #         sorted_data = sorted(similarities_city_data, key=lambda city:city.similarity, reverse=True)
    #         sorted_data_of_sufficient_distance = []

    #         # filter out cities not far enough away until we have "count" quantity of cities
    #         # keep original city as reference 
    #         start_time = time.time()
    #         for city in sorted_data:
    #             if is_far_enough(city, sorted_data_of_sufficient_distance, min_distance=min_distance) or \
    #                     city.name == reference_city_df.labels["NAME"]:
    #                 sorted_data_of_sufficient_distance.append(city)
                
    #             if len(sorted_data_of_sufficient_distance) == count: # we have enough cities
    #                 break
    #         print(f"3Time taken: {time.time() - start_time} seconds")

    #         # return the sorted data of a length up to "count" where the first(most similar) value should be the reference city
            
    #         return sorted_data_of_sufficient_distance

    #     else:
    #         raise Exception(f'couldn\'t find city {reference_city_name}')


 


if __name__ == '__main__':

    my_city_finder = CityFinder()

    for city in my_city_finder.get_similar_cities("BRIDGEPORT MUNICIPAL AIRPORT, TX US", 3):
        print(city)




















