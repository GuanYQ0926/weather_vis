<template>
    <div id="app">
        <v-map ref="basemap" :zoom="zoom" :minZoom="minZoom" :maxZoom="maxZoom" :center="center" @l-click="onClick"
               @l-zoomstart="onZoomstart" @l-zoomend="onZoomend" @l-movestart="onMovestart" @l-moveend="onMoveend">
            <v-tilelayer :url="url"></v-tilelayer>
            <v-tilelayer :url="boundary"></v-tilelayer>
            <canvas id="ccm" ref="ccm"></canvas>
        </v-map>
        <el-select v-model="city" filterable placeholder="東京">
            <el-option
                v-for="city in cities"
                :key="city.value"
                :label="city.label"
                :value="city.value">
            </el-option>
        </el-select>
        <el-select v-model="factor1" placeholder="temperature">
            <el-option
                v-for="factor in factors"
                :key="factor.value"
                :label="factor.label"
                :value="factor.value">
            </el-option>
        </el-select>
        <el-select v-model="factor2" placeholder="temperature">
            <el-option
                v-for="factor in factors"
                :key="factor.value"
                :label="factor.label"
                :value="factor.value">
            </el-option>
        </el-select>
        <linechart></linechart>
    </div>
</template>

<script>
import axios from 'axios'
import Linechart from './components/linechartView.vue'

export default{
    components: {
        linechart: Linechart,
    },
    data: () => ({
        zoom: 6,
        minZoom: 4,
        maxZoom: 12,
        center: [35, 136],
        //url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
        url: 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
        boundary: 'https://korona.geog.uni-heidelberg.de/tiles/adminb/x={x}&y={y}&z={z}',
        width: window.innerWidth/2,
        height: window.innerHeight,
        ccm_data: [],
        factors: [
            {value: 'temperature', label: 'temperature'},
            {value: 'rainfall', label: 'rianfall'},
            {value: 'windspeed', label: 'wind-speed'},
            {value: 'vaporpressure', label: 'vapor-pressure'},
            {value: 'cloud', label: 'cloud'}
        ],
        factor1: 'temperature',
        factor2: 'temperature',
        cities: [
            {value: 'Tokyo', label: '東京', lat: 35.68944, lon: 139.69167},
            {value: 'Yokohama', label: '横浜', lat: 35.44778, lon: 139.6425},
            {value: 'Chiba', label: '千葉', lat: 35.60472, lon: 140.12333},
            {value: 'Gifu', label: '岐阜', lat: 35.39111,lon: 136.72222},
            {value: 'Kyoto', label: '京都', lat: 35.02139, lon: 135.75556},
            {value: 'Oosaka', label: '大阪', lat: 34.68639, lon: 135.52},
            {value: 'Kobe', label: '神戸', lat: 34.69139, lon: 135.18306},
            {value: 'Nara', label: '奈良', lat: 34.68528, lon: 135.83278},
            {value: 'Nagoya', label: '名古屋', lat: 35.18028, lon: 136.90667}
        ],
        city: 'Tokyo',
    }),
    methods: {
        onClick(e) {
            this.drawCcmmap()
            const params = new URLSearchParams()
            params.set('city', this.city)
            params.set('factor1', this.factor1)
            params.set('factor2', this.factor2)
            const url = `http://0.0.0.0:5000/data/${params.toString()}`
            console.log(url)
            this.requestToServer(url)
        },
        onZoomstart() {
            this.$refs.ccm.style.opacity = 0
            console.log('zoom start')
        },
        onZoomend() {
            this.drawCcmmap()
            this.$refs.ccm.style.opacity = 1
            console.log('zoom end')
        },
        onMovestart() {
            this.$refs.ccm.style.opacity = 0
            console.log('move start')
        },
        onMoveend() {
            this.drawCcmmap()
            this.$refs.ccm.style.opacity = 1
            console.log('move end');
        },
        drawCcmmap() {
            this.$refs.ccm.width = this.width
            this.$refs.ccm.height = this.height
            this.$refs.ccm.getContext('2d').clearRect(0, 0, this.width, this.height)
            this.cities.forEach(c => {
                const point = this.$refs.basemap.mapObject.latLngToContainerPoint([c.lat, c.lon])
                this.$refs.ccm.getContext('2d').fillStyle = `hsla(600, 50%, 80%, 1)`
                this.$refs.ccm.getContext('2d').fillRect(point.x, point.y, 10, 10)
            })
        },
        requestToServer(url) {
            axios.get(url)
            .then(res => {
                const data = res.data
                this.eventHub.$emit('initLinechartScene', data)
            })
        }
    },
    watch: {
    },
    mounted() {
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
        height: 100%;
        cursor: crosshair;
        float: right;
    }
    #ccm {
        pointer-events: none;
        position: absolute;
        top: 0;
        left: 0;
        float: right;
        transition: 'opacity 0.2s';
    }
    #ccm {
        z-index: 1000;
    }
    #linechart {
        float: left;
    }
</style>
