import * as d3 from 'd3'
import colormap from 'colormap'


export default class Linechart{
    constructor(){
        this.div_width = window.innerWidth/2
        this.div_height = window.innerHeight/2
        this.margin = {top: 20, right: 20, bottom: 20, left: 20}
        this.width = this.div_width - this.margin.left - this.margin.right
        this.height = this.div_height - this.margin.top - this.margin.bottom
        this.max_radius = Math.min(this.width, this.height) / 2 - 5
        this.colors = colormap({
            colormap: 'magma',
            nshades: 10,
            format: 'hex',
            alpha: 1
        })

    }
    initScene(){
        this.renderScene()
    }
    renderScene(){
        const formatNumber = d3.format(',d')
        const partition = d3.partition()
        const x_scale = d3.scaleLinear()
            .range([0, 2*Math.PI])
            .clamp(true)
        const y_scale = d3.scaleSqrt()
            .range([this.max_radius*0.1, this.max_radius])

        const dark = ['#B08B12', '#BA5F06', '#8C3B00', '#6D191B', '#842854',
            '#5F7186', '#193556', '#137B80', '#144847', '#254E00']

        const mid = ['#E3BA22', '#E58429', '#BD2D28', '#D15A86', '#8E6C8A',
            '#6B99A1', '#42A5B3', '#0F8C79', '#6BBBA1', '#5C8100']

        const light = ['#F2DA57', '#F6B656', '#E25A42', '#DCBDCF', '#B396AD',
            '#B0CBDB', '#33B6D0', '#7ABFCC', '#C8D7A1', '#A0B700']

        const palettes = [light, mid, dark]
        const light_green_first_palette = palettes
            .map(d => d.reverse())
            .reduce((a, b) => a.concat(b))

        const color = d3.scaleOrdinal(light_green_first_palette)

        const arc = d3.arc()
            .startAngle(d => x_scale(d.x0))
            .endAngle(d => x_scale(d.x1))
            .innerRadius(d => Math.max(0, y_scale(d.y0)))
            .outerRadius(d => Math.max(0, y_scale(d.y1)))

        const middleArcLine = d => {
            const half_pi = Math.PI / 2
            const angles = [x_scale(d.x0)-half_pi, x_scale(d.x1)-half_pi]
            const r = Math.max(0, (y_scale(d.y0)+y_scale(d.y1))/2)

            const middle_angle = (angles[0]+angles[1])/2
            const invert_direction = middle_angle > 0 && middle_angle < Math.PI
            if(invert_direction) {
                angles.reverse()
            }
            const path = d3.path()
            path.arc(0, 0, r, angles[0], angles[1], invert_direction)
            return path.toString()
        }

        const textFits = d => {
            const CHAR_SPACE = 6
            const delta_angle = x_scale(d.x1) - x_scale(d.x0)
            const r = Math.max(0, (y_scale(d.y0)+y_scale(d.y1))/2)
            const perimeter = r * delta_angle
            return d.data.name.length * CHAR_SPACE < perimeter
        }

        const svg = d3.select(document.getElementById('sunburst')).append('svg')
            .style('width', '100vw')
            .style('height', '100vh')
            .attr('viewBox', `${-this.width / 2} ${-this.height / 2} ${this.width} ${this.height}`)
            .on('click', () => focusOn())

        d3.json('https://gist.githubusercontent.com/mbostock/4348373/raw/85f18ac90409caa5529b32156aa6e71cf985263f/flare.json',
            (error, root) => {
                if(error) throw error

                root = d3.hierarchy(root)
                root.sum(d => d.size)
                const slice = svg.selectAll('g.slice')
                    .data(partition(root).descendants())
                slice.exit().remove()
                const new_slice = slice
                    .enter()
                    .append('g')
                    .attr('class', 'slice')
                    .on('click', d => {
                        d3.event.stopPropagation()
                        focusOn(d)
                    })
                new_slice.append('title')
                    .text(d => d.data.name + '\n' + formatNumber(d.value))
                new_slice.append('path')
                    .attr('class', 'main-src')
                    .style('fill', d => color((d.children ? d : d.parent).data.name))
                    .attr('d', arc)
                new_slice.append('path')
                    .attr('class', 'hidden-arc')
                    .attr('id', (_, i) => `hiddenArc${i}`)
                    .attr('d', middleArcLine)

                const text = new_slice.append('text')
                    .attr('display', d => (textFits(d) ? null : 'none'))

                text.append('textPath')
                    .attr('startOffset', '50%')
                    .attr('xlink:href', (_, i) => `#hiddenArc${i}`)
                    .text(d => d.data.name)
                    .style('fill', 'none')
                    .style('stroke', '#E5E2E0')
                    .style('stroke-width', 12)
                    .style('stroke-linejoin', 'round')
                text.append('textPath')
                    .append('textPath')
                    .attr('startOffset', '50%')
                    .attr('xlink:href', (_, i) => `#hiddenArc${i}`)
                    .text(d => d.data.name)
            })

        function focusOn(d = { x0: 0, x1: 1, y0: 0, y1: 1 }) {
            const transition = svg.transition()
                .duration(750)
                .tween('scale', () => {
                    const xd = d3.interpolate(x_scale.domain(), [d.x0, d.x1]),
                        yd = d3.interpolate(y_scale.domain(), [d.y0, 1])
                    return t => {
                        x_scale.domain(xd(t))
                        y_scale.domain(yd(t))
                    }
                })
            transition.selectAll('path.main-arc').attrTween('d', d => () => arc(d))
            transition.selectAll('path.hidden-arc')
                .attrTween('d', d => () => middleArcLine(d))
            transition.selectAll('text')
                .attrTween('display', d => () => (textFits(d) ? null : 'none'))
            moveStackToFront(d)
        }

        function moveStackToFront(el_d) {
            svg.selectAll('.slice')
                .filter(d => d === el_d)
                .each(function(d) {
                    this.parentNode.appendChild(this)
                    if(d.parent) {
                        moveStackToFront(d.parent)
                    }
                })
        }
    }
}
