import csv
import json
import collections
import numpy as np
import skccm as ccm
from skccm.utilities import train_test_split


def csvToCMMJson():
    city_list = ['Kobe', 'Kyoto', 'Oosaka', 'Wakayama', 'Nara', 'Otsu',
                 'Fukui', 'Tsu', 'Gifu', 'Nagoya']
    factor_list = ['cloud', 'rainfall',  # 4
                   'temperature', 'vaporpressure', 'windspeed']
    # sequence of city_list and factor_list should be fixed
    dataset = collections.defaultdict(list)
    for factor in factor_list:
        src_file = '../data/raw/' + factor + '.csv'
        print(factor)
        with open(src_file, 'r', encoding='ISO-8859-1') as f:
            lines = csv.reader(f)
            data = []
            for line in lines:
                data.append(line)
        tmp_data = collections.defaultdict(list)
        col_num = 1
        ci = 0
        col_offset = 4 if factor == 'rainfall' else 3
        while col_num < len(data[2]):
            row_num = 5
            while row_num < len(data):
                # data[2][col_num]
                if data[row_num][col_num] != '':
                    tmp_data[city_list[ci]].append(
                        float(data[row_num][col_num]))
                row_num += 1
            ci += 1
            col_num += col_offset  # change with the csv data
        dataset[factor] = tmp_data  # {rainfall: {kyoto:[], Oosaka:[]}}
    results = {}  # {Nagoya: {rainfall: {temperature: [kyoto: 1, nagoya: 1]} }}
    for city1 in city_list:
        dictionary1 = {}
        for factor1 in factor_list:
            dictionary2 = {}
            for factor2 in factor_list:
                array = {}
                for city2 in city_list:
                    if city1 == city2 and factor1 == factor2:
                        continue
                    data1 = np.array(dataset[factor1][city1])
                    data2 = np.array(dataset[factor2][city2])
                    if len(data1) == 0 or len(data2) == 0:
                        sc1 = [0] * 12
                    else:
                        sc1, _ = calculateCCM(data1, data2)  # sc1 type: list
                    array[city2] = sc1
                dictionary2[factor2] = array
            dictionary1[factor1] = dictionary2
        results[city1] = dictionary1
    with open('../data/ccm/ccm.json', 'w') as f:
        json.dump(results, f)


def calculateCCM(data1, data2):
    lag = 1
    embed = 2
    lib_lens = np.cumsum([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31])
    # lib_lens = [len(data1)]
    e1 = ccm.Embed(np.array(data1))
    e2 = ccm.Embed(np.array(data2))
    X1 = e1.embed_vectors_1d(lag, embed)
    X2 = e2.embed_vectors_1d(lag, embed)
    x1tr, x1te, x2tr, x2te = train_test_split(X1, X2, percent=.75)
    c = ccm.CCM()
    c.fit(x1tr, x2tr)
    x1p, x2p = c.predict(x1te, x2te, lib_lengths=lib_lens)
    sc1, sc2 = c.score()
    return sc1, sc2


def csvToD3Json():
    city_list = ['Kobe', 'Kyoto', 'Oosaka', 'Wakayama', 'Nara', 'Otsu',
                 'Fukui', 'Tsu', 'Gifu', 'Nagoya']
    factor_list = ['cloud', 'rainfall',  # 4
                   'temperature', 'vaporpressure', 'windspeed']
    for factor in factor_list:
        src_file = '../data/raw/' + factor + '.csv'
        dst_file = '../data/json/' + factor + '.json'
        col_offset = 4 if factor == 'rainfall' else 3
        print(factor)
        with open(src_file, 'r', encoding='ISO-8859-1') as f:
            lines = csv.reader(f)
            data = []
            for line in lines:
                data.append(line)
        jsonfile = []
        row_num = 5
        while row_num < len(data):
            col_num = 1
            ci = 0
            dictionary = {'date': data[row_num][0]}
            while col_num < len(data[2]):
                city = city_list[ci]
                if data[row_num][col_num] != '':
                    dictionary[city] = float(data[row_num][col_num])
                else:
                    dictionary[city] = -1
                ci += 1
                col_num += col_offset  # change with csv data
            jsonfile.append(dictionary)
            row_num += 1
        with open(dst_file, 'w') as f:
            json.dump(jsonfile, f)


if __name__ == '__main__':
    csvToD3Json()
    # csvToCMMJson()
