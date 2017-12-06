import * as d3 from 'd3'
import colormap from 'colormap'

export default class Linechart{
    constructor(){
        this.div_width = window.innerWidth/2
        this.div_height = window.innerHeight/2
        this.margin = {top: 0.04*this.div_height, right: this.div_width/48, bottom: 0.25*this.div_height, left: this.div_width/24}
        this.sub_margin = {top: 0.86*this.div_height, right: this.div_width/48, bottom: 0.06*this.div_height, left: this.div_width/24}
        this.width = this.div_width - this.margin.left - this.margin.right
        this.height = this.div_height - this.margin.top - this.margin.bottom
        this.sub_height = this.div_height-this.sub_margin.top - this.sub_margin.bottom
        this.linelist = []
    }
    initScene(data){
        this.colors = colormap({
            colormap: 'jet',
            nshades: 10,
            format: 'hex',
            alpha: 1
        })
        this.cities = ['Kyoto', 'Oosaka', 'Nara', 'Kobe', 'Gifu', 'Nagoya', 'Yokohama', 'Saitama', 'Tokyo', 'Chiba']
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
}
