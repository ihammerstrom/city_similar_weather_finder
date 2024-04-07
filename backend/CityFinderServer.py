from flask import Flask, current_app, request, jsonify
from CityFinder import CityFinder
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/')
def hello():
    return 'Hello, World! What city would you like to compare?'


@app.route('/get_similar_cities')
def get_similar_cities(methods=['GET']):
    # Get the 'name' query parameter from the request
    name = request.args.get('city_name')
    assert(name != None)

    if name:
        city_finder = current_app.config.get('city_finder')
        return jsonify({
            'cities': [city.to_dict() for city in city_finder.get_similar_cities(name, 20)]
        })
    else:
        return 'Hello, what\'s your name?'


@app.route('/get_city_list', methods=['GET'])
def get_city_list():
    city_finder = current_app.config.get('city_finder')
    return city_finder.get_city_list()


@app.route('/autocomplete_city_name', methods=['GET'])
def autocomplete_city_name():
    city_name_substring = request.args.get('city_name_substring')
    assert(city_name_substring != None)

    return jsonify({
        "suggestions":
            current_app.config.get('city_finder')
                    .get_city_names_with_substring(city_name_substring)
        })


if __name__ == '__main__':
    # Initialize the variable when the application starts
    with app.app_context():
        current_app.config['city_finder'] = CityFinder()

    app.run(debug=True)
