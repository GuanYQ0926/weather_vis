<template>
    <div id="app">
        <el-select v-model="city" filterable placeholder="東京" size="mini" no-match-text="No matching data">
            <el-option
                v-for="city in cities"
                :key="city.value"
                :label="city.label"
                :value="city.value">
            </el-option>
        </el-select>
        <el-select v-model="factor1" placeholder="temperature" size="mini">
            <el-option
                v-for="factor in factors"
                :key="factor.value"
                :label="factor.label"
                :value="factor.value">
            </el-option>
        </el-select>
        <el-button size="mini" plain @click='onClick'><i class="el-icon-check"></i></el-button>
        <el-select v-model="allcities" disabled placeholder="all cities" size="mini"></el-select>
        <el-select v-model="factor2" placeholder="temperature" size="mini">
            <el-option
                v-for="factor in factors"
                :key="factor.value"
                :label="factor.label"
                :value="factor.value">
            </el-option>
        </el-select>
        <v-map ref="basemap" :zoom="zoom" :center="center">
            <v-tilelayer :url="url"></v-tilelayer>
            <canvas id="ccm" ref="ccm"></canvas>
        </v-map>
        <linechart></linechart>
    </div>
</template>

<script>
import axios from 'axios'
import $ from 'jquery'
import colormap from 'colormap'
import Chart from 'chart.js'
import Linechart from './components/linechartView.vue'

export default{
    components: {
        linechart: Linechart,
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
        height: window.innerHeight*0.45,
        ccm_data: [],
        factors: [
            {value: 'temperature', label: 'temperature'},
            {value: 'rainfall', label: 'rianfall'},
            {value: 'windspeed', label: 'wind-speed'},
            {value: 'vaporpressure', label: 'vapor-pressure'},
            {value: 'cloud', label: 'cloud'}
        ],
        factor1: 'temperature',
        factor2: 'rainfall',
        cities: [
            {value: 'Kyoto', label: '京都', lat: 35.02139, lon: 135.75556},
            {value: 'Oosaka', label: '大阪', lat: 34.68639, lon: 135.52},
            {value: 'Nara', label: '奈良', lat: 34.68528, lon: 135.83278},
            {value: 'Kobe', label: '神戸', lat: 34.69139, lon: 135.18306},
            {value: 'Gifu', label: '岐阜', lat: 35.39111,lon: 136.72222},
            {value: 'Nagoya', label: '名古屋', lat: 35.18028, lon: 136.90667},
            {value: 'Yokohama', label: '横浜', lat: 35.44778, lon: 139.6425},
            {value: 'Tokyo', label: '東京', lat: 35.68944, lon: 139.69167},
            {value: 'Chiba', label: '千葉', lat: 35.60472, lon: 140.12333},
        ],
        city: 'Tokyo',
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
            const city_names = ['Kyoto', 'Oosaka', 'Nara', 'Kobe', 'Gifu', 'Nagoya', 'Yokohama', 'Tokyo', 'Chiba']
            let city_values = []
            let city_colors = []
            for(const i in city_names) {
                const name = city_names[i]
                city_values.push(data[name])
                city_colors.push(this.colors[i])
            }
            city_colors = city_colors.map(d => (d+'BF'))
            const tmp_data = {
                labels: city_names,
                datasets: [{
                    data: city_values,
                    backgroundColor: city_colors
                }]
            }
            //setview
            for(const i in this.cities) {
                if(this.cities[i].value == this.city) {
                    const cen = [this.cities[i].lat, this.cities[i].lon]
                    this.$refs.basemap.mapObject.panTo(cen)
                    break
                }
            }
            //draw chart
            this.$refs.ccm.width = this.width
            this.$refs.ccm.height = this.height
            const ctx = this.$refs.ccm.getContext('2d')
            ctx.clearRect(0, 0, this.width, this.height)
            if(this.ccmChart!=null) this.ccmChart.destroy()
            this.ccmChart = new Chart(ctx, {
                data: tmp_data,
                type: 'polarArea',
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
    }
}
</script>

<style>
    html, body, #app {
        height: 100%;
        margin: 0;
    }
    .vue2leaflet-map.leaflet-container{
        width: 50%;
        height: 45%;
        cursor: default;
        float: left;
    }
    #ccm {
        position: absolute;
        top: 0;
        left: 0;
        float: left;
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
