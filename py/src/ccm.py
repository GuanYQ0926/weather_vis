import numpy as np
from scipy.stats.stats import pearsonr
import matplotlib.pyplot as plt
import skccm.data as data


class CCM(object):

    def __init__(self, data1, data2, lib_Sizes=0, dimension_E=2, delta_T=1):
        self.data1 = data1
        self.data2 = data2
        self.dimension_E = dimension_E
        self.delta_T = delta_T
        self.lib_Sizes = lib_Sizes
        self.manifold = []  # np.array()
        self.first = delta_T * (dimension_E - 1) + 1  # index of first data
        self.last = len(data1)  # index of last data (1-indexed)
        self.manifold_len = self.last - self.first + 1
        # if selected = data1, select all data
        self.selected = []  # indice of randomly selected data
        self.indices = []
        self.distances = [[0 for x in range(self.manifold_len)]
                          for y in range(self.manifold_len)]
        self.weights = []
        self.estimate_y = []
        self.correlation = 0

    def shadowManifold(self):
        for i in range(self.first - 1, self.last):
            vector = []
            for e in range(self.dimension_E):
                vector.append(self.data1[i - e * self.delta_T])
            self.manifold.append(vector)
        self.manifold = np.array(self.manifold)

    def nearestNeighbors(self):
        for i in range(self.manifold_len):
            for j in range(self.manifold_len):
                dist = sum((self.manifold[i] - self.manifold[j])**2.0)**0.5
                self.distances[i][j] = dist
                self.distances[j][i] = dist

    def weightsEstimateY(self):
        for dists in self.distances:
            indice = sorted(range(len(dists)), key=lambda k: dists[k])
            indice = indice[1: self.dimension_E + 2]
            self.indices.append(indice)
            ordered_dist = [dists[i] for i in indice]
            d1 = ordered_dist[0]
            if float(d1) == 0.0:
                uis = []
                for d in ordered_dist:
                    if float(d) == 0.0:
                        uis.append(np.exp(-1))
                    else:
                        uis.append(0.0)
                N = float(sum(uis))
                weight = [ui / N for ui in uis]
                self.weights.append(weight)
            else:
                uis = [np.exp(-di / d1) for di in ordered_dist]
                N = float(sum(uis))
                weight = [ui / N for ui in uis]
                self.weights.append(weight)
            pred_y = 0
            for i, w in zip(indice, weight):
                pred_y += self.data2[i] * w
            self.estimate_y.append(pred_y)

    def computeCorrelation(self):
        p, _ = pearsonr(np.array(self.data2[self.first - 1:self.last]),
                        np.array(self.estimate_y))
        self.correlation = p ** 2

    def selectManifold(self, lib_size):
        # randomly select vectors to calculate distances
        self.selected = range(self.last - self.first + 1)
        np.random.shuffle(self.selected)
        self.selected = self.selected[:lib_size]

    def calculate(self):
        self.shadowManifold()
        self.nearestNeighbors()
        self.weightsEstimateY()
        self.computeCorrelation()


if __name__ == '__main__':
    rx1 = 3.72  # determines chaotic behavior of the x1 series
    rx2 = 3.72  # determines chaotic behavior of the x2 series
    b12 = 0.2  # Influence of x1 on x2
    b21 = 0.01  # Influence of x2 on x1
    ts_length = 1000
    x1, x2 = data.coupled_logistic(rx1, rx2, b12, b21, ts_length)
    len_tr = 749
    lib_lens = np.arange(10, len_tr, len_tr / 20, dtype='int')
    res1 = []
    res2 = []
    for i in lib_lens:
        d1 = x1[:i]
        d2 = x2[:i]
        ccm1 = CCM(d1, d2)
        ccm1.calculate()
        res1.append(ccm1.correlation)
        ccm2 = CCM(d2, d1)
        ccm2.calculate()
        res2.append(ccm2.correlation)
    xs = range(len(lib_lens))
    plt.plot(xs, res1, 'r', xs, res2, 'g', lw=1)
    plt.show()
