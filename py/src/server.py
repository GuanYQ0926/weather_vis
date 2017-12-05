import os
import json
import numpy as np
from flask import Flask
from flask_restful import abort, Api, Resource
from functools import wraps
from ccm import CCM


app = Flask(__name__)
api = Api(app)
datasetpart = {}
datasetparthourly = {}


def cors(func, allow_origin=None, allow_headers=None, max_age=None):
    if not allow_origin:
        allow_origin = "*"
    if not allow_headers:
        allow_headers = "content-type, accept"
    if not max_age:
        max_age = 60

    @wraps(func)
    def wrapper(*args, **kwargs):
        response = func(*args, **kwargs)
        cors_headers = {
            "Access-Control-Allow-Origin": allow_origin,
            "Access-Control-Allow-Methods": func.__name__.upper(),
            "Access-Control-Allow-Headers": allow_headers,
            "Access-Control-Max-Age": max_age,
        }
        if isinstance(response, tuple):
            if len(response) == 3:
                headers = response[-1]
            else:
                headers = {}
            headers.update(cors_headers)
            return (response[0], response[1], headers)
        else:
            return response, 200, cors_headers
    return wrapper


def abortIfNotExist(fileName):
    filepath = '../data/json/' + fileName
    if not os.path.exists(filepath):
        abort(404, message="{} doesn't exist".format(fileName))


class Resource(Resource):
    method_decorators = [cors]


def calculateCCM(dataset, data):
    pass


class DataResource(Resource):

    def get(self, parameters):
        lat_lon = parameters.split('_')
        lat = round(float(lat_lon[0]) * 5) / 5
        lon = round(float(lat_lon[1]) * 5) / 5
        lat_lon = str(lat) + '_' + str(lon)
        try:
            data = datasetpart[lat_lon]
            return calculateCCM(datasetpart, data)
        except:
            abort(404, message="data in {} doesn't exist".format(lat_lon))


api.add_resource(DataResource, '/data/<parameters>')

if __name__ == '__main__':
    jsonDataPath = '../data/json/datasetpart.json'
    with open(jsonDataPath, 'r') as f:
        datasetpart = json.load(f)
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
