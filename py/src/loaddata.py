import csv
import json
import collections


def csvToJson(src_file, dst_file):
    with open(src_file, 'r') as f:
        lines = csv.reader(f)
        data = []
        for line in lines:
            data.append(line)
    jsonfile = collections.defaultdict(list)
    col_num = 1
    while col_num < len(data[2]):
        row_num = 5
        while row_num < len(data):
            # data[2][col_num]
            jsonfile[col_num].append(float(data[row_num][col_num]))
            row_num += 1
        col_num += 3
    print(col_num, row_num)
    with open(dst_file, 'w') as f:
        json.dump(jsonfile, f)


if __name__ == '__main__':
    csvToJson('../data/temperature.csv', '../data/temperature.json')
