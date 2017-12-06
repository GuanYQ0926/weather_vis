import os
import json
from flask import Flask
from flask_restful import abort, Api, Resource
from functools import wraps


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


class DataResource(Resource):

    def get(self, parameters):
        try:
            params = parameters.split('&')
            params = [p.split('=')[1] for p in params]
            with open('../data/json/' + params[1] + '.json', 'r') as f:
                data1 = json.load(f)
            with open('../data/json/' + params[2] + '.json', 'r') as f:
                data2 = json.load(f)
            return [data1, data2]
        except:
            abort(404, message="data doesn't exist")


api.add_resource(DataResource, '/data/<parameters>')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
