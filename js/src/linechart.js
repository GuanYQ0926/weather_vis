import * as d3 from 'd3'

export default class Linechart{
    constructor(){
        this.div_width = window.innerWidth/2
        this.div_height = window.innerHeight/2
        this.margin = {top: 0.04*this.div_height, right: this.div_width/48, bottom: 0.2*this.div_height, left: this.div_width/24}
        this.sub_margin = {top: 0.86*this.div_height, right: this.div_width/48, bottom: 0.06*this.div_height, left: this.div_width/24}
        this.width = this.div_width - this.margin.left - this.margin.right
        this.height = this.div_height - this.margin.top - this.margin.bottom
        this.sub_height = this.div_height-this.sub_margin.top - this.sub_margin.bottom
    }
    initScene(data){
        this.data = data
        this.data = [
            {date: new Date(2007, 3, 24), value: 3.24},
            {date: new Date(2007, 3, 25), value: 85.35},
            {date: new Date(2007, 3, 26), value: 78.84},
            {date: new Date(2007, 3, 27), value: 99.92},
            {date: new Date(2007, 3, 30), value: 29.80},
            {date: new Date(2007, 4,  1), value: 69.47},
        ]
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
            .domain([0, d3.max(this.data, d => d.value)])
            .range([this.height, 0])
        const y_sub_scale = d3.scaleLinear()
            .domain(y_scale.domain())
            .range([this.sub_height, 0])
        const x_axis = d3.axisBottom(x_scale),
            x_sub_axis = d3.axisBottom(x_sub_scale),
            y_axis = d3.axisLeft(y_scale)

        const brush = d3.brushX()
            .extent([[0, 0], [this.width, this.sub_height]])
            .on('brush end', brushed)
        const zoom = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0, 0], [this.width, this.height]])
            .extent([[0, 0], [this.width, this.height]])
            .on('zoom', zoomed)
        const line = d3.line()
            .x(d => x_scale(d.date))
            .y(d => y_scale(d.value))
        const sub_line = d3.line()
            .x(d => x_sub_scale(d.date))
            .y(d => y_sub_scale(d.value))

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
        focus.append('path')
            .datum(this.data)
            .attr('class', 'line')
            .attr('d', line)
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
        context.append('path')
            .datum(this.data)
            .attr('class', 'line')
            .attr('d', sub_line)
            // .attr('class', 'area')
            // .attr('d', sub_area)
        context.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0, ${this.sub_height})`)
            .call(x_sub_axis)
        context.append('g')
            .attr('class', 'brush')
            .call(brush)
            .call(brush.move, x_scale.bandwidth)
        svg.append('rect')
            .attr('class', 'zoom')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
            .call(zoom)

        function brushed() {
            if(d3.event.sourceEvent && d3.event.sourceEvent.type==='zoom') return
            const s = d3.event.selection || x_sub_scale.bandwidth
            x_scale.domain(s.map(x_sub_scale.invert, x_sub_scale))
            focus.select('.line').attr('d', line)
            focus.select('.axis--x').call(x_axis)
            svg.select('.zoom').call(zoom.transform, d3.zoomIdentity
                .scale(this.width/(s[1]-s[0]))
                .translate(-s[0], 0))
        }
        function zoomed() {
            if(d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return
            const t = d3.event.transform
            x_scale.domain(t.rescaleX(x_sub_scale).domain())
            focus.select('.line').attr('d', line)
            focus.select('axis--x').call(x_axis)
            context.select('.brush').call(brush.move, x_scale.bandwidth.map(t.invertX, t))
        }
    }
}
