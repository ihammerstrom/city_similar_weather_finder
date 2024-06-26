import sys

KEY_VALUES_TO_COPY = ['NAME', 'LATITUDE', 'LONGITUDE']
KEY_VALUES_TO_AVG = ['TAVG', 'TMAX', 'TMIN', 'PRCP']
USED_DISTANCES = ['100km', '200km', '500km', '1000km']
MONTHS_IN_YEAR = 12
MIN_YEAR = 2008
MAX_YEAR = 2023
MINIMUM_SAME_MONTHS_SAMPLE_SIZE = 1 # minimum month samples of data per each column to include the file
# FILES_DIR = "gsom-latest/"
# FILES_DIR = "test_data/"
# FILES_DIR = "global-gsom-latest-2/"
DATA_CSV = "interpolated_weather_data3_with_distances.csv"
