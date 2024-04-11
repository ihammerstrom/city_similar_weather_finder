from flask import Flask, current_app
from CityFinderApiV1 import api_v1
from CityFinder import CityFinder
from flask_cors import CORS


def create_app():
    app = Flask(__name__)
    app.register_blueprint(api_v1, url_prefix='/api/v1')
    CORS(app, origins=["http://localhost:3000", "https://cityfinder.org"], headers=['Content-Type'],
        expose_headers=['Access-Control-Allow-Origin'], supports_credentials=True)
    with app.app_context():
        current_app.config['city_finder'] = CityFinder()
    return app

if __name__ == '__main__':
    create_app = create_app()
    create_app.run()
else:
    gunicorn_app = create_app()
