<template>
    <div id="app">
        <v-map ref="basemap" :zoom="zoom" :minZoom="minZoom" :maxZoom="maxZoom" :center="center" @l-click="onClick"
               @l-zoomstart="onZoomstart" @l-zoomend="onZoomend" @l-movestart="onMovestart" @l-moveend="onMoveend">
            <v-tilelayer :url="url"></v-tilelayer>
            <v-tilelayer :url="boundary"></v-tilelayer>
            <canvas id="heat" ref="heat"></canvas>
            <canvas id="rect" ref="rect"></canvas>
        </v-map>
        <el-select v-model="value1" placeholder="select">
            <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
        </el-select>
        <el-select v-model="value2" placeholder="select">
            <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
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
        markerlatlng:  L.latLng(0, 0),
        width: window.innerWidth/2,
        height: window.innerHeight/2,
        lat_lon: '',
        heat_data: [],
        options: [
            {value: 'temp', label: 'temperature'},
            {value: 'rain', label: 'rianfall'},
            {value: 'air', label: 'air-pressure'},
        ],
        value1: '',
        value2: '',
    }),
    methods: {
        onClick(e) {
            const params = new URLSearchParams()
            params.set('lat', Math.round(e.latlng.lat*5)/5)
            params.set('lon', Math.round(e.latlng.lng*5)/5)
            params.set('value1', this.value1)
            params.set('value2', this.value2)
            this.click_pos = e.latlng
            const url = `http://0.0.0.0:5000/data/${params.toString()}`
            console.log(url)
            //this.requestToServer(url)
        },
        onZoomstart() {
            this.$refs.heat.style.opacity = 0
            this.$refs.rect.getContext('2d').clearRect(0, 0, this.width, this.height)
            console.log('zoom start')
        },
        onZoomend() {
            this.drawHeatmap(this.heat_data)
            this.$refs.heat.style.opacity = 1
            console.log('zoom end')
        },
        onMovestart() {
            this.$refs.heat.style.opacity = 0
            this.$refs.rect.getContext('2d').clearRect(0, 0, this.width, this.height)
            console.log('move start')
        },
        onMoveend() {
            this.drawHeatmap(this.heat_data)
            this.$refs.heat.style.opacity = 1
            console.log('move end');
        },
        drawHeatmap(heat_data) {
            this.$refs.heat.width = this.width
            this.$refs.heat.height = this.height
            this.$refs.heat.getContext('2d').clearRect(0, 0, this.width, this.height)
            heat_data.forEach(d => {
                const latlon = d[0].split('_')
                const nw = this.$refs.basemap.mapObject.latLngToContainerPoint([+latlon[0]-0.1, +latlon[1]+0.1])
                const se = this.$refs.basemap.mapObject.latLngToContainerPoint([+latlon[0]+0.1, +latlon[1]-0.1])
                this.$refs.heat.getContext('2d').fillStyle = `hsla(${(1-d[1])*150}, 50%, 80%, ${d[1] / 2 + 0.3})`
                this.$refs.heat.getContext('2d').fillRect(nw.x, nw.y, se.x-nw.x, se.y-nw.y)
            })
            const marker = new Image()
            marker.src = '../asset/marker.png'
            const xy = this.$refs.basemap.mapObject.latLngToContainerPoint(this.click_pos)
            const marker_width = this.$refs.basemap.mapObject.getZoom()/0.41
            const marker_height = this.$refs.basemap.mapObject.getZoom()/0.25
            marker.onload = () => {
                this.$refs.heat.getContext('2d').drawImage(marker, xy.x-marker_width/2, xy.y-marker_height, marker_width, marker_height);
            }
            console.log('draw done');
        },
        requestToServer(url) {
            axios.get(url)
            .then(res => {
                const data = res.data
                this.heat_data = data['heat_corr_data']
                this.drawHeatmap(this.heat_data)
            })
        },
        drawLinechart() {
            //const data = fetch('').then(res => res.json())
            const data = []
            this.eventHub.$emit('initLinechartScene', data)
        }
    },
    watch: {
        lat_lon(val) {
            console.log('lat, lon changed', this.lat_lon)
            this.drawLinechart()
        }
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
        height: 50%;
        cursor: crosshair;
        float: left;
    }
    #heat, #rect {
        pointer-events: none;
        position: absolute;
        top: 0;
        left: 0;
        float: left;
        transition: 'opacity 0.2s';
    }
    #marker {
        z-index: 1001;
    }
    #heat {
        z-index: 1000;
    }
    #rect {
        z-index: 2;
    }
    #linechart {
        float: left;
    }
</style>
