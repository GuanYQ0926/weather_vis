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


<!-- import * as d3 from 'd3'
import colormap from 'colormap'
import { legendColor } from 'd3-svg-legend'


export default class Linechart{
    constructor(){
        this.div_width = window.innerWidth/2
        this.div_height = window.innerHeight/2
        this.margin = {top: 0.04*this.div_height, right: this.div_width/48, bottom: 0.25*this.div_height, left: this.div_width/24}
        this.sub_margin = {top: 0.86*this.div_height, right: this.div_width/48, bottom: 0.06*this.div_height, left: this.div_width/24}
        this.width = this.div_width - this.margin.left - this.margin.right - 80
        this.height = this.div_height - this.margin.top - this.margin.bottom
        this.sub_height = this.div_height-this.sub_margin.top - this.sub_margin.bottom
        this.linelist = []
        this.colors = colormap({
            colormap: 'magma',
            nshades: 10,
            format: 'hex',
            alpha: 1
        })
        this.cities = ['Kyoto', 'Oosaka', 'Nara', 'Kobe', 'Gifu', 'Nagoya', 'Yokohama', 'Tokyo', 'Chiba']
    }
    initScene(data){
        this.data = data[1]
        const parseTime = d3.timeParse('%Y/%-m/%-d')
        this.data.forEach(d => {
            d.date = parseTime(d.date)
        })
        this.renderScene()
    }
    renderScene(){
        const x_scale = d3.scaleTime()
            .domain(d3.extent(this.data, d => d.date))
            .range([0, this.width])
        const x_sub_scale = d3.scaleTime()
            .domain(x_scale.domain())
            .range([0, this.width])
        const y_scale = d3.scaleLinear()
            .domain([-2, 38])
            .range([this.height, 0])
        const y_sub_scale = d3.scaleLinear()
            .domain(y_scale.domain())
            .range([this.sub_height, 0])
        const x_axis = d3.axisBottom(x_scale),
            x_sub_axis = d3.axisBottom(x_sub_scale),
            y_axis = d3.axisLeft(y_scale)

        const svg = d3.select(document.getElementById('linechart')).append('svg')
            .attr('width', this.div_width)
            .attr('height', this.div_height)
        svg.append('defs').append('clipPath')
            .attr('id', 'clip')
            .append('rect')
            .attr('width',this.width)
            .attr('height', this.height)
        const focus = svg.append('g')
            .attr('class', 'focus')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
        focus.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0, ${this.height})`)
            .call(x_axis)
        focus.append('g')
            .attr('class', 'axis axis--y')
            .call(y_axis)
        const context = svg.append('g')
            .attr('class', 'context')
            .attr('transform', `translate(${this.sub_margin.left},${this.sub_margin.top})`)
        context.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0, ${this.sub_height})`)
            .call(x_sub_axis)
        //draw lines
        for(const i in this.cities){
            const city = this.cities[i]
            const line = d3.line()
                .x(d => x_scale(d.date))
                .y(d => y_scale(d[city]))
            const sub_line = d3.line()
                .x(d => x_sub_scale(d.date))
                .y(d => y_sub_scale(d[city]))
            focus.append('path')
                .datum(this.data)
                .attr('class', 'line')
                .attr('d', line)
                .style('stroke', this.colors[i])
            context.append('path')
                .datum(this.data)
                .attr('class', 'line')
                .attr('d', sub_line)
                .style('stroke', this.colors[i])
            this.linelist.push(line)
        }
        // brush and zoom
        const brush = d3.brushX()
            .extent([[0, 0], [this.width, this.sub_height]])
            .on('end', brushed)
        const zoom = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0, 0], [this.width, this.height]])
            .extent([[0, 0], [this.width, this.height]])
            .on('zoom', zoomed)

        context.append('g')
            .attr('class', 'brush')
            .call(brush)
            .call(brush.move, x_scale.range())
        svg.append('rect')
            .attr('class', 'zoom')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
            .call(zoom)

        // legend
        const ordinal = d3.scaleOrdinal()
            .domain(this.cities)
            .range(this.colors.slice(0, this.cities.length))
        const legend_svg = svg.append('svg')
        legend_svg.append('g')
            .attr('class', 'legendOrdinal')
            .attr('transform', `translate(${this.width+35}, 20)`)
        const legendOrdinal = legendColor()
            .shapeWidth(20)
            .scale(ordinal)
        legend_svg.select('.legendOrdinal')
            .call(legendOrdinal)

        function brushed() {
            if(d3.event.sourceEvent && d3.event.sourceEvent.type==='zoom') return
            const s = d3.event.selection || x_sub_scale.range()
            x_scale.domain(s.map(x_sub_scale.invert, x_sub_scale))
            for(const i in this.linelist){
                focus.select('.line').attr('d', this.linelist[i])
            }
            //focus.select('.line').attr('d', line)
            focus.select('.axis--x').call(x_axis)
            const transform = d3.zoomIdentity.translate(-s[0], 0).scale(this.width/(s[1]-s[0]))
            svg.select('.zoom').call(zoom.transform, transform)
        }
        function zoomed() {
            if(d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return
            const t = d3.event.transform
            x_scale.domain(t.rescaleX(x_sub_scale).domain())
            for(const i in this.linelist){
                focus.select('.line').attr('d', this.linelist[i])
            }
            //focus.select('.line').attr('d', line)
            focus.select('axis--x').call(x_axis)
            //console.log(x_scale.range().map(t.invertX, t));
            //context.select('.brush').call(brush.move, x_scale.range().map(t.invertX, t))
        }
    }
} -->
