from Config import KEY_VALUES_TO_AVG

class CityData:
    def __init__(self, name, similarity, latitude, longitude, df):
        self.name = name
        self.similarity = similarity
        self.latitude = latitude
        self.longitude = longitude
        for key in KEY_VALUES_TO_AVG: # add the keys above, pulling the values from the dataframe
            setattr(self, key, list(df[key]))

    def __str__(self):
        return ", ".join([self.name, str(self.similarity), str(self.latitude), str(self.longitude), str([str(getattr(self, key)) for key in KEY_VALUES_TO_AVG])])

    def to_dict(self):
        # Convert the object into a dictionary
        data = {
            "name": self.name,
            "similarity": self.similarity,
            "latitude": self.latitude,
            "longitude": self.longitude,
        }
        for key in KEY_VALUES_TO_AVG:
            data[key] = getattr(self, key)
        return data