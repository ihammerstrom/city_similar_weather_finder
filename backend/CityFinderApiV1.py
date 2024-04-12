from flask import current_app, request, jsonify, abort, Blueprint
from Config import KEY_VALUES_TO_AVG
from datetime import datetime

api_v1 = Blueprint('api_v1', __name__)

# get similar cities
@api_v1.route('/get_similar_cities')
def get_similar_cities(methods=['GET']):
    # Get the 'name' query parameter from the request
    city_name = request.args.get('city_name')
    print(f'{str(datetime.now())} hit query api with {city_name}')


    weights = {}
    for key in KEY_VALUES_TO_AVG:
        weights.update({key: float(request.args.get(key, 1))})
    
    min_distance = int(request.args.get('min_distance', 100))

    if city_name:
        city_finder = current_app.config.get('city_finder')
        similar_cities = city_finder.get_similar_cities(city_name, 20, weights=weights, min_distance=min_distance)
        print(f'{str(datetime.now())} done with {city_name}')
        return jsonify({
            'cities': [city.to_dict() for city in similar_cities]
        })
    else:
        abort(400, description="Missing required field: city_name")


# get the list of available cities
@api_v1.route('/get_city_list', methods=['GET'])
def get_city_list():
    city_finder = current_app.config.get('city_finder')
    return city_finder.get_city_list()


# get names which contain the city_name_substring
@api_v1.route('/autocomplete_city_name', methods=['GET'])
def autocomplete_city_name():
    city_name_substring = request.args.get('city_name_substring')
    print(f'{str(datetime.now())} hit autocomplete api with {city_name_substring}')

    if city_name_substring is None:
        abort(400, description="Missing required field: city_name_substring")

    return jsonify({
        "suggestions":
            current_app.config.get('city_finder')
                    .get_city_names_with_substring(city_name_substring)
        })
