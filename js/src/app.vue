<template>
    <div id="app">
        <v-map ref="basemap" :zoom="zoom" :center="center">
            <v-tilelayer :url="url"></v-tilelayer>
            <canvas id="ccm" ref="ccm"></canvas>
        </v-map>
        <el-form :inline="true" class="demo-form-inline" size="mini">
            <el-form-item label="市町村">
                <el-select v-model="city" filterable placeholder="岐阜" size="mini" no-match-text="No matching data">
                    <el-option
                        v-for="city in cities"
                        :key="city.value"
                        :label="city.label"
                        :value="city.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="気象データ">
                <el-select v-model="factor1" placeholder="temperature" size="mini">
                    <el-option
                        v-for="factor in factors"
                        :key="factor.value"
                        :label="factor.label"
                        :value="factor.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="市町村">
                <el-select v-model="allcities" disabled placeholder="他の観測所" size="mini"></el-select>
            </el-form-item>
            <el-form-item label="気象データ">
                <el-select v-model="factor2" placeholder="temperature" size="mini">
                    <el-option
                        v-for="factor in factors"
                        :key="factor.value"
                        :label="factor.label"
                        :value="factor.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button size="mini" plain @click='onClick'>確認</el-button>
            </el-form-item>
        </el-form>
        <linechart></linechart>
        <!-- <sunburst></sunburst> -->
    </div>
</template>

<script>
import axios from 'axios'
import $ from 'jquery'
import colormap from 'colormap'
import Chart from 'chart.js'
import Linechart from './components/linechartView.vue'
// import Sunburst from './components/sunburstView.vue'

export default {
    components: {
        linechart: Linechart,
        // sunburst: Sunburst,
    },
    data: () => ({
        zoom: 8,
        minZoom: 4,
        maxZoom: 14,
        center: [35, 136],
        //url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
        //'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
        url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
        width: window.innerWidth/2,
        height: window.innerHeight,
        ccm_data: [],
        factors: [
            {value: 'temperature', label: '日平均気温'},
            {value: 'rainfall', label: '降水量'},
            {value: 'windspeed', label: '日平均風速'},
            {value: 'vaporpressure', label: '日平均蒸気圧'},
            {value: 'cloud', label: '日平均雲量'},
            {value: 'sunlight', label: '日合計全天日射量'},
        ],
        factor1: 'temperature',
        factor2: 'rainfall',
        cities: [
            {value: 'Kobe', label: '神戸', lat: 34.69139, lon: 135.18306},
            {value: 'Kyoto', label: '京都', lat: 35.02139, lon: 135.75556},
            {value: 'Oosaka', label: '大阪', lat: 34.68639, lon: 135.52},
            {value: 'Wakayama', label: '和歌山', lat: 34.230411, lon: 135.17081},
            {value: 'Nara', label: '奈良', lat: 34.68528, lon: 135.83278},
            {value: 'Otsu', label: '大津', lat: 35.017754, lon: 135.85471},
            {value: 'Fukui', label: '福井', lat: 36.064189, lon: 136.219374},
            {value: 'Tsu', label: '津', lat: 34.718576, lon: 136.505511},
            {value: 'Gifu', label: '岐阜', lat: 35.39111,lon: 136.72222},
            {value: 'Nagoya', label: '名古屋', lat: 35.18028, lon: 136.90667},
        ],
        city: 'Gifu',
        allcities: '',
        colors: colormap({
            colormap: 'magma',
            nshades: 10,
            format: 'hex',
            alpha: 1
        }),
        polar_data: [],
        line_data1: [],
        line_data2: [],
        ccmChart: null,
    }),
    methods: {
        onClick(e) {
            //fetch data from server
            const params = new URLSearchParams()
            params.set('city', this.city)
            params.set('factor1', this.factor1)
            params.set('factor2', this.factor2)
            const url = `http://0.0.0.0:5000/data/${params.toString()}`
            this.requestToServer(url)
            //fetch local data
            // this.fetchData()
        },
        drawCcmmap(data) {
            const city_names = ['Kobe', 'Kyoto', 'Oosaka', 'Wakayama', 'Nara', 'Otsu', 'Fukui', 'Tsu', 'Gifu', 'Nagoya']
            let city_values = []
            let city_colors = []
            for(const i in city_names) {
                const name = city_names[i]
                city_values.push(data[name])
                city_colors.push(this.colors[i])
            }
            //setview
            for(const i in this.cities) {
                if(this.cities[i].value == this.city) {
                    const cen = [this.cities[i].lat, this.cities[i].lon]
                    this.$refs.basemap.mapObject.panTo(cen)
                    break
                }
            }

            const tmp_data = {
                labels: city_names,
                datasets: [{
                    label: 'CCM',
                    fill: true,
                    data: city_values,
                    borderColor: 'rgba(255,99,132,1)',
                    backgroundColor: 'rgba(255,99,132,0.2)',
                    pointBorderColor: '#fff',
                    pointBackgroundColor: 'rgba(255,99,132,1)',
                    pointHoverRadius: 6,
                }],
            }
            const tmp_options = {
                title: {
                    display: true,
                    text: ''
                }
            }
            //draw chart
            this.$refs.ccm.width = this.width
            this.$refs.ccm.height = this.height
            const ctx = this.$refs.ccm.getContext('2d')
            ctx.clearRect(0, 0, this.width, this.height)
            if(this.ccmChart!=null) this.ccmChart.destroy()
            this.ccmChart = new Chart(ctx, {
                type: 'radar',
                data: tmp_data,
                options: tmp_options,
            })
        },
        requestToServer(url) {  // from server
            $('#linechart').empty()
            axios.get(url)
            .then(res => {
                const data = res.data
                this.eventHub.$emit('initLinechartScene', data)
                this.drawCcmmap(data[2])
            })
        },
        fetchData() {  // local file
            //polar data
            this.polar_data = []
            fetch('../asset/ccm/ccm.json')
                .then(res => res.json())
                .then(data => {
                    this.polar_data = data[this.city][this.factor1][this.factor2]
                })
            this.drawCcmmap(this.polar_data)
            //line data
            $('#linechart').empty()
            this.line_data1 = []
            this.line_data2 = []
            fetch(`../asset/json/${this.factor1}.json`)
                .then(res => res.json())
                .then(data => {
                    for(const i in data) {
                        const d = data[i]
                        this.line_data1.push({'value': d[this.city], 'date': d.date})
                    }
                })
            fetch(`../asset/json/${this.factor2}.json`)
                .then(res => res.json())
                .then(data => {
                    this.line_data2 = data
                })
            Promise.all([this.line_data1, this.line_data2])
                .then(line_data => {
                    this.eventHub.$emit('initLinechartScene', line_data)
                })
        }
    },
    watch: {
    },
    mounted() {
        const params = new URLSearchParams()
        params.set('city', this.city)
        params.set('factor1', this.factor1)
        params.set('factor2', this.factor2)
        const url = `http://0.0.0.0:5000/data/${params.toString()}`
        this.requestToServer(url)
        // this.eventHub.$emit('initSunburstScene')
    }
}
</script>

<style>
    html, body, #app {
        height: 100%;
        margin: 0;
    }
    body {
        font-family: Sans-serif;
        font-size: 11px;
    }
    .vue2leaflet-map.leaflet-container{
        width: 50%;
        height: 100%;
        cursor: default;
        float: right;
    }
    #ccm {
        position: absolute;
        top: 0;
        left: 0;
        float: right;
        transition: 'opacity 0.2s';
        z-index: 1000;
    }
    #linechart {
        float: left;
    }
    .el-select {
        float: left;
    }
</style>
