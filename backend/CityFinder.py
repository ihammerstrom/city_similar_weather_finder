#using Formula
import numpy as np
import os
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import datetime

files_dir = "test_data/"

KEY_VALUES_TO_COPY = ['NAME', 'LATITUDE', 'LONGITUDE']
KEY_VALUES_TO_AVG = ['TAVG', 'TMAX', 'TMIN', 'PRCP', 'SNOW']
MONTHS_IN_YEAR = 12
MIN_YEAR = 2008
MAX_YEAR = 2023
MINIMUM_SAME_MONTHS_SAMPLE_SIZE = 3
# MAX_YEAR = datetime.datetime.now().year - 1 # up until last year to increase likelihood of only dealing with full years


# check if list of columns exist
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


class CityFinder:
    def __init__(self, directory):
        self.city_dfs = self.get_valid_weather_dataframes(files_dir)

    def get_valid_weather_dataframes(self, directory):
        city_dfs = []

        #for file in directory
        for file in os.listdir(directory):

            #if it's fits the naming scheme of files we want
            if file.endswith('.csv') and file.startswith('US'):

                cdf = pd.read_csv(os.path.join(directory, file))

                # if has correct columns
                if columns_exist(cdf, KEY_VALUES_TO_AVG):

                    # trim the dataframe to only be the years we care about.
                    cdf['DATE'] = pd.to_datetime(cdf['DATE'])
                    cdf = cdf[(cdf['DATE'].dt.year >= MIN_YEAR) & (cdf['DATE'].dt.year <= MAX_YEAR)]

                    # if there are values after trimming the years
                    if not cdf.empty and has_sufficient_values(cdf, KEY_VALUES_TO_AVG, MINIMUM_SAME_MONTHS_SAMPLE_SIZE):

                        monthly_avgs_df = cdf.groupby(cdf['DATE'].dt.month)[KEY_VALUES_TO_AVG].mean()

                        labels = {}
                        for k in KEY_VALUES_TO_COPY:
                            labels.update({k: cdf[k].iloc[0]}) # take first, assume all values the same
                        labels.update({'filename': file})

                        monthly_avgs_df.labels = labels

                        city_dfs.append(monthly_avgs_df)

        return city_dfs



    def get_similar_cities(self, reference_city_name, count):

        reference_city_df = None
        for cdf in self.city_dfs:
            # print(cdf.labels['NAME'])
            if cdf.labels['NAME'] == reference_city_name:
                reference_city_df = cdf
                break

        if reference_city_df is not None:

            similarities = []
            for weather_df in self.city_dfs:

                if weather_df.labels["NAME"] != reference_city_df.labels["NAME"]:

                    similarity_matrix = cosine_similarity(reference_city_df, weather_df.values)
                    avg_similarity = np.mean(similarity_matrix)

                    similarities.append({
                        'name':weather_df.labels["NAME"],
                        'similarity':avg_similarity
                        })

            return sorted(similarities, key=lambda city:city['similarity'])[-count:] #assume count is not higher than length

        else:
            raise Exception(f'couldn\'t find city {reference_city_name}')

    def get_city_list(self):
        return [cdf.labels["NAME"] for cdf in self.city_dfs]


if __name__ == '__main__':
    my_city_finder = CityFinder(files_dir)

    print(my_city_finder.get_similar_cities("BRIDGEPORT MUNICIPAL AIRPORT, TX US", 3))




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






































