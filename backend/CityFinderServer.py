from flask import Flask, current_app, request
from CityFinder import CityFinder

app = Flask(__name__)


@app.route('/')
def hello():
    return 'Hello, World! What city would you like to compare?'


@app.route('/get_city')
def query_example(methods=['GET']):
    # Get the 'name' query parameter from the request
    name = request.args.get('city_name')

    print("ok")
    if name:
        city_finder = current_app.config.get('city_finder')
        print("ok2")
        return city_finder.get_similar_cities(name, 3)
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

    return current_app.config.get('city_finder').get_city_names_with_substring(city_name_substring)



if __name__ == '__main__':
    # Initialize the variable when the application starts
    with app.app_context():
        current_app.config['city_finder'] = CityFinder("test_data/")

    app.run(debug=True)
