import csv
import json
import collections
from ccm import CCM


def csvToCMMJson(src_file, dst_file):
    city_list = ['Kyoto', 'Oosaka', 'Nara', 'Kobe', 'Gifu',
                 'Nagoya', 'Yokohama', 'Tokyo', 'Chiba']
    with open(src_file, 'r') as f:
        lines = csv.reader(f)
        data = []
        for line in lines:
            data.append(line)
    jsonfile = collections.defaultdict(list)
    col_num = 1
    ci = 0
    while col_num < len(data[2]):
        row_num = 5
        while row_num < len(data):
            # data[2][col_num]
            if data[row_num][col_num] != '':
                jsonfile[city_list[ci]].append(float(data[row_num][col_num]))
            row_num += 1
        ci += 1
        col_num += 4  # change with the csv data
    results = []
    for i in jsonfile:
        for j in jsonfile:
            if i == j:
                continue
            data1 = jsonfile[i]
            data2 = jsonfile[j]
            ccm = CCM(data1, data2)
            ccm.calculate()
            results.append(dict(src=j, dst=i, coef=ccm.correlation))
    with open(dst_file, 'w') as f:
        json.dump(results, f)


def csvToD3Json(src_file, dst_file):
    city_list = ['Kyoto', 'Oosaka', 'Nara', 'Kobe', 'Gifu',
                 'Nagoya', 'Yokohama', 'Tokyo', 'Chiba']
    with open(src_file, 'r') as f:
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
            col_num += 3  # change with csv data
        jsonfile.append(dictionary)
        row_num += 1
    with open(dst_file, 'w') as f:
        json.dump(jsonfile, f)


if __name__ == '__main__':
    # csvToD3Json('../data/raw/cloud.csv',
    #             '../data/json/cloud.json')
    csvToCMMJson('../data/raw/rainfall.csv',
                 '../data/ccm/rainfall_ccm.json')
