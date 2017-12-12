import * as d3 from 'd3'
import colormap from 'colormap'
import $ from 'jquery'


export default class Linechart{
    constructor(){
        this.div_width = window.innerWidth/2
        this.div_height = window.innerHeight/2
        this.margin = {top: 0.04*this.div_height, right: this.div_width/25, bottom: 0.25*this.div_height, left: this.div_width/24}
        this.width = this.div_width - this.margin.left - this.margin.right
        this.height = this.div_height - this.margin.top - this.margin.bottom
        this.colors = colormap({
            colormap: 'magma',
            nshades: 10,
            format: 'hex',
            alpha: 1
        })
        this.cities = ['Kyoto', 'Oosaka', 'Nara', 'Kobe', 'Gifu', 'Nagoya', 'Yokohama', 'Tokyo', 'Chiba']
        this.src_range = {'min': 1000, 'max': -1000}
        this.dst_range = {'min': 1000, 'max': -1000}
        this.dst_num = -1
    }
    initScene(data){
        this.src = data[0]
        this.dst = data[1]
        const parseTime = d3.timeParse('%Y/%-m/%-d')
        for(const i in this.dst) {
            this.dst[i].date = parseTime(this.dst[i].date)
            this.src[i].date = this.dst[i].date
            this.cities.forEach(d => {
                if(this.dst[i][d] > this.dst_range.max) this.dst_range.max = this.dst[i][d]
                if(this.dst[i][d] < this.dst_range.min) this.dst_range.min = this.dst[i][d]
            })

            if(this.src[i].value > this.src_range.max) this.src_range.max = this.src[i].value
            if(this.src[i].value < this.src_range.min) this.src_range.min = this.src[i].value
        }
        this.renderScene()
    }
    renderScene(){
        const x_scale = d3.scaleTime()
            .domain(d3.extent(this.dst, d => d.date))
            .range([0, this.width])
        const y_scale = d3.scaleLinear()
            .domain([this.dst_range.min, this.dst_range.max])
            .range([this.height, 0])
        const y_scale2 = d3.scaleLinear()
            .domain([this.src_range.min, this.src_range.max])
            .range([this.height, 0])
        const x_axis = d3.axisBottom(x_scale),
            y_axis = d3.axisLeft(y_scale),
            y_axis2 = d3.axisRight(y_scale2)

        const svg = d3.select(document.getElementById('linechart')).append('svg')
            .attr('width', this.div_width)
            .attr('height', this.div_height)
        svg.append('defs').append('clipPath')
            .attr('id', 'clip')
            .append('rect')
            .attr('width',this.width)
            .attr('height', this.height)
        const group = svg.append('g')
            .attr('class', 'group')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
        group.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0, ${this.height})`)
            .call(x_axis)
        group.append('g')
            .attr('class', 'axis axis--y')
            .call(y_axis)
        group.append('g')
            .attr('transform', `translate(${this.width}, 0)`)
            .attr('class', 'axis axis--y')
            .attr('stroke', '#4682b4')
            .call(y_axis2)
        //draw lines
        //draw dst lines
        for(const i in this.cities){
            const city = this.cities[i]
            const line = d3.line()
                .x(d => x_scale(d.date))
                .y(d => y_scale(d[city]))
            group.append('path')
                .datum(this.dst)
                .attr('class', 'line')
                .attr('d', line)
                .style('stroke', this.colors[i])
        }
        //draw src line
        const line = d3.line()
            .x(d => x_scale(d.date))
            .y(d => y_scale2(d.value))
        group.append('path')
            .datum(this.src)
            .attr('class', 'line')
            .attr('d', line)
            .style('stroke-width', 2)
            .style('stroke', '#4682b4')
        // draw legend
        const legend = svg.append('svg')
        const g = legend.append('g')
            .attr('transform', `translate(20, ${this.height+35})`)
        for(const i in this.cities) {
            const cell = g.append('g')
                .attr('class', 'cell')
            cell.append('rect')
                .attr('class', 'legend')
                .attr('transform', `translate(${50*i}, 0)`)
                .attr('width', 35)
                .attr('height', 12)
                .attr('fill', this.colors[i])
                .on('click', () => {
                    if(this.dst_num != -1) {
                        this.dst_num = -1
                        const src_num = this.cities.length
                        d3.selectAll('.line').each(function(dd, ii) {
                            if(ii != src_num) {
                                d3.select(this).style('stroke-opacity', 1)
                                d3.select(this).style('stroke-width', 1)
                            }
                        })
                    }
                    else {
                        this.dst_num = i
                        const dst_num = this.dst_num,
                            src_num = this.cities.length
                        d3.selectAll('.line').each(function(dd, ii) {
                            if(ii != dst_num && ii != src_num) {
                                d3.select(this).style('stroke-opacity', 0)
                            }
                            else {
                                d3.select(this).style('stroke-width', 2)
                            }
                        })
                    }

                })
            cell.append('text')
                .attr('class', 'label')
                .attr('transform', `translate(${50*i}, 25)`)
                .text(this.cities[i])
        }
    }
}
