from flask import current_app, request, jsonify, abort, Blueprint
from Config import KEY_VALUES_TO_AVG
from datetime import datetime

def get_boolean_query_param(param_name):
    """Converts query parameter to boolean.
    
    Returns True if the parameter exists and is one of 'true', '1', 't', 'y', 'yes'.
    Returns False otherwise.
    """
    param_value = request.args.get(param_name, 'false').lower()
    return param_value in ['true', '1', 't', 'y', 'yes']

api_v1 = Blueprint('api_v1', __name__)

# get similar cities
@api_v1.route('/get_similar_cities')
def get_similar_cities(methods=['GET']):
    # Get the 'name' query parameter from the request
    geoname_id = request.args.get('geoname_id')
    print(f'{str(datetime.now())} hit query api with geoname_id: {geoname_id}')

    shift_southern_hemisphere_climate = request.args.get('shift_southern_hemisphere_climate') == 'true'

    print(shift_southern_hemisphere_climate)

    weights = {}
    for key in KEY_VALUES_TO_AVG:
        weights.update({key: float(request.args.get(key, 1))})

    min_distance = int(request.args.get('min_distance', 100))

    if geoname_id:
        city_finder = current_app.config.get('city_finder')
        similar_cities = city_finder.get_similar_cities(geoname_id, 20, min_distance, shift_southern_hemisphere_climate=shift_southern_hemisphere_climate)
        print(f'{str(datetime.now())} done with {geoname_id}')
        return jsonify({
            'cities': similar_cities
        })
    else:
        abort(400, description="Missing required field: geoname_id")


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

    return jsonify(
            current_app.config.get('city_finder')
                    .get_city_names_with_substring(city_name_substring)
        )
