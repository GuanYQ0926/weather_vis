import * as d3 from 'd3'


export default class Sunburst{
    constructor(){
        this.div_width = window.innerWidth*0.4
        this.div_height = window.innerHeight/2
        //this.margin = {top: 20, right: 20, bottom: 20, left: 20}
        this.width = this.div_width// - this.margin.left - this.margin.right
        this.height = this.div_height// - this.margin.top - this.margin.bottom
        this.max_radius = Math.min(this.width, this.height) / 2
    }
    // initScene(){
    //     this.renderScene()
    // }
    // renderScene(){
    //     const x_scale = d3.scaleLinear()
    //         .range([0, 2*Math.PI])
    //         .clamp(true)
    //     const y_scale = d3.scaleSqrt()
    //         .range([this.max_radius*0.1, this.max_radius])
    //
    //     const dark = ['#B08B12', '#BA5F06', '#8C3B00', '#6D191B', '#842854',
    //         '#5F7186', '#193556', '#137B80', '#144847', '#254E00']
    //     const mid = ['#E3BA22', '#E58429', '#BD2D28', '#D15A86', '#8E6C8A',
    //         '#6B99A1', '#42A5B3', '#0F8C79', '#6BBBA1', '#5C8100']
    //     const light = ['#F2DA57', '#F6B656', '#E25A42', '#DCBDCF', '#B396AD',
    //         '#B0CBDB', '#33B6D0', '#7ABFCC', '#C8D7A1', '#A0B700']
    //     const palettes = [light, mid, dark]
    //     const light_green_first_palette = palettes
    //         .map(d => d.reverse())
    //         .reduce((a, b) => a.concat(b))
    //     const color = d3.scaleOrdinal(light_green_first_palette)
    //
    //     const formatNumber = d3.format(',d')
    //     const partition = d3.partition()
    //
    //     const arc = d3.arc()
    //         .startAngle(d => x_scale(d.x0))
    //         .endAngle(d => x_scale(d.x1))
    //         .innerRadius(d => Math.max(0, y_scale(d.y0)))
    //         .outerRadius(d => Math.max(0, y_scale(d.y1)))
    //
    //     const middleArcLine = d => {
    //         const half_pi = Math.PI / 2
    //         const angles = [x_scale(d.x0)-half_pi, x_scale(d.x1)-half_pi]
    //         const r = Math.max(0, (y_scale(d.y0)+y_scale(d.y1))/2)
    //
    //         const middle_angle = (angles[0]+angles[1])/2
    //         const invert_direction = middle_angle > 0 && middle_angle < Math.PI
    //         if(invert_direction) {
    //             angles.reverse()
    //         }
    //         const path = d3.path()
    //         path.arc(0, 0, r, angles[0], angles[1], invert_direction)
    //         return path.toString()
    //     }
    //
    //     const textFits = d => {
    //         const CHAR_SPACE = 6
    //         const delta_angle = x_scale(d.x1)-x_scale(d.x0)
    //         const r = Math.max(0, (y_scale(d.y0)+y_scale(d.y1))/2)
    //         const perimeter = r * delta_angle
    //         return d.data.name.length * CHAR_SPACE < perimeter
    //     }
    //
    //     const svg = d3.select(document.getElementById('sunburst')).append('svg')
    //         .style('width', '100vw')
    //         .style('height', '100vh')
    //         .attr('viewBox', `${-this.width / 2} ${-this.height / 2} ${this.width} ${this.height}`)
    //         .on('click', () => focusOn())
    //
    //     d3.json('https://gist.githubusercontent.com/mbostock/4348373/raw/85f18ac90409caa5529b32156aa6e71cf985263f/flare.json',
    //         (error, root) => {
    //             if(error) throw error
    //
    //             root = d3.hierarchy(root)
    //             root.sum(d => d.size)
    //             const slice = svg.selectAll('g.slice')
    //                 .data(partition(root).descendants())
    //             slice.exit().remove()
    //             const new_slice = slice
    //                 .enter()
    //                 .append('g')
    //                 .attr('class', 'slice')
    //                 .on('click', d => {
    //                     d3.event.stopPropagation()
    //                     focusOn(d)
    //                 })
    //             new_slice.append('title')
    //                 .text(d => d.data.name + '\n' + formatNumber(d.value))
    //             new_slice.append('path')
    //                 .attr('class', 'main-src')
    //                 .style('fill', d => color((d.children ? d : d.parent).data.name))
    //                 .attr('d', arc)
    //             new_slice.append('path')
    //                 .attr('class', 'hidden-arc')
    //                 .attr('id', (_, i) => `hiddenArc${i}`)
    //                 .attr('d', middleArcLine)
    //
    //             const text = new_slice.append('text')
    //                 .attr('display', d => (textFits(d) ? null : 'none'))
    //
    //             text.append('textPath')
    //                 .attr('startOffset', '50%')
    //                 .attr('xlink:href', (_, i) => `#hiddenArc${i}`)
    //                 .text(d => d.data.name)
    //                 .style('fill', 'none')
    //                 .style('stroke', '#E5E2E0')
    //                 .style('stroke-width', 12)
    //                 .style('stroke-linejoin', 'round')
    //             text.append('textPath')
    //                 .attr('startOffset', '50%')
    //                 .attr('xlink:href', (_, i) => `#hiddenArc${i}`)
    //                 .text(d => d.data.name)
    //         })
    //
    //     function focusOn(d={x0: 0, x1: 1, y0: 0, y1: 1}) {
    //         const transition = svg.transition()
    //             .duration(750)
    //             .tween('scale', () => {
    //                 const xd = d3.interpolate(x_scale.domain(), [d.x0, d.x1])
    //                 const yd = d3.interpolate(y_scale.domain(), [d.y0, 1])
    //                 return t => {
    //                     x_scale.domain(xd(t))
    //                     y_scale.domain(yd(t))
    //                 }
    //             })
    //         transition.selectAll('path.main-arc')
    //             .attrTween('d', d => () => arc(d))
    //         transition.selectAll('path.hidden-arc')
    //             .attrTween('d', d => () => middleArcLine(d))
    //         transition.selectAll('text')
    //             .attrTween('display', d => () => (textFits(d) ? null : 'none'))
    //         moveStackToFront(d)
    //
    //         function moveStackToFront(el_d) {
    //             svg.selectAll('.slice')
    //                 .filter(d => d === el_d)
    //                 .each(function(d) {
    //                     this.parentNode.appendChild(this)
    //                     if(d.parent) {
    //                         moveStackToFront(d.parent)
    //                     }
    //                 })
    //         }
    //     }
    // }
    initScene(data) {
        this.data = data
        this.renderScene()
    }
    renderScene() {
        const radius = this.max_radius
        const width = this.width
        const height = this.height
        const b = {w: 75, h: 30, s: 3, t: 10}
        // Mapping of step names to colors.
        //['#E3BA22', '#E58429', '#BD2D28', '#D15A86', '#8E6C8A',
        // '#6B99A1', '#42A5B3', '#0F8C79', '#6BBBA1', '#5C8100']
        //['#EE6D62', '#F7C652', '#65CB57', '#00BFA5', '#607D8B']
        const colors = {
            'Kobe': '#bbbbbb',
            'Kyoto': '#bbbbbb',
            'Oosaka': '#bbbbbb',
            'Wakayama': '#bbbbbb',
            'Nara': '#bbbbbb',
            'Otsu': '#bbbbbb',
            'Fukui': '#bbbbbb',
            'Tsu': '#bbbbbb',
            'Gifu': '#bbbbbb',
            'Nagoya': '#bbbbbb',
            'temperature': '#EE6D62',
            'rainfall': '#F7C652',
            'windspeed': '#65CB57',
            'vaporpressure': '#00BFA5',
            'cloud': '#607D8B',
            'sunlight': '#FAEBD7',
        }
        const legend_colors = {
            'temperature': '#EE6D62',
            'rainfall': '#F7C652',
            'windspeed': '#65CB57',
            'vaporpressure': '#00BFA5',
            'cloud': '#607D8B',
            'sunlight': '#FAEBD7',
            'city': '#bbbbbb',
        }
        const div = document.getElementById('chart')
        div.innerHTML = '<div id="explanation" style="visibility: hidden;"><span id="percentage"></span><br/></div>'
        // Total size of all segments  we set this later, after loading the data.
        let totalSize = 0
        const vis = d3.select('#chart').append('svg:svg')
            .attr('width', width)
            .attr('height', height)
            .append('svg:g')
            .attr('id', 'container')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')

        const partition = d3.partition()
            .size([2 * Math.PI, radius * radius])

        const arc = d3.arc()
            .startAngle(function(d) { return d.x0  })
            .endAngle(function(d) { return d.x1  })
            .innerRadius(function(d) { return Math.sqrt(d.y0)  })
            .outerRadius(function(d) { return Math.sqrt(d.y1)  })

        // Use d3.text and d3.csvParseRows so that we do not need to have a header
        // row, and can receive the csv as an array of arrays.
        // d3.text('../asset/test.csv', function(text) {
        //     const csv = d3.csvParseRows(text)
        //     const json = buildHierarchy(csv)
        //     createVisualization(json)
        // })

        const json = buildHierarchy(this.data)
        createVisualization(json)

        // Main function to draw and set up the visualization, once we have the data.
        function createVisualization(json) {
        // Basic setup of page elements.
            initializeBreadcrumbTrail()
            drawLegend()
            d3.select('#togglelegend').on('click', toggleLegend)
            // Bounding circle underneath the sunburst, to make it easier to detect
            // when the mouse leaves the parent g.
            vis.append('svg:circle')
                .attr('r', radius)
                .style('opacity', 0)

            // Turn the data into a d3 hierarchy and calculate the sums.
            const root = d3.hierarchy(json)
                .sum(function(d) { return d.size  })
                .sort(function(a, b) { return b.value - a.value  })

            // For efficiency, filter nodes to keep only those large enough to see.
            const nodes = partition(root).descendants()
                .filter(function(d) {
                    return (d.x1 - d.x0 > 0.005)  // 0.005 radians = 0.29 degrees
                })

            const path = vis.data([json]).selectAll('path')
                .data(nodes)
                .enter().append('svg:path')
                .attr('display', function(d) { return d.depth ? null : 'none'  })
                .attr('d', arc)
                .attr('fill-rule', 'evenodd')
                .style('fill', function(d) { return colors[d.data.name]  })
                .style('opacity', 1)
                .on('mouseover', mouseover)

            // Add the mouseleave handler to the bounding circle.
            d3.select('#container').on('mouseleave', mouseleave)
            // Get total size of the tree = value of root node from partition.
            totalSize = path.node().__data__.value
        }

        // Fade all but the current sequence, and show it in the breadcrumb trail.
        function mouseover(d) {
            const percentage = (100 * d.value / totalSize).toPrecision(3)
            let percentageString = percentage + '%'
            if (percentage < 0.1) {
                percentageString = '< 0.1%'
            }

            d3.select('#percentage')
                .text(percentageString)

            d3.select('#explanation')
                .style('visibility', '')

            const sequenceArray = d.ancestors().reverse()
            sequenceArray.shift()  // remove root node from the array
            updateBreadcrumbs(sequenceArray, percentageString)

            // Fade all the segments.
            d3.selectAll('path')
                .style('opacity', 0.3)

            // Then highlight only those that are an ancestor of the current segment.
            vis.selectAll('path')
                .filter(function(node) {
                    return (sequenceArray.indexOf(node) >= 0)})
                .style('opacity', 1)
        }

        // Restore everything to full opacity when moving off the visualization.
        function mouseleave() {
            // Hide the breadcrumb trail
            d3.select('#trail')
                .style('visibility', 'hidden')
            // Deactivate all segments during transition.
            d3.selectAll('path').on('mouseover', null)

            // Transition each segment to full opacity and then reactivate it.
            d3.selectAll('path')
                .transition()
                .duration(1000)
                .style('opacity', 1)
                .on('end', function() {
                    d3.select(this).on('mouseover', mouseover)
                })
            d3.select('#explanation')
                .style('visibility', 'hidden')
        }

        function initializeBreadcrumbTrail() {
            // Add the svg area.
            const trail = d3.select('#sequence').append('svg:svg')
                .attr('width', width)
                .attr('height', 50)
                .attr('id', 'trail')
                // Add the label at the end, for the percentage.
            trail.append('svg:text')
                .attr('id', 'endlabel')
                .style('fill', '#000')
        }

        // Generate a string that describes the points of a breadcrumb polygon.
        function breadcrumbPoints(d, i) {
            const points = []
            points.push('0,0')
            points.push(b.w + ',0')
            points.push(b.w + b.t + ',' + (b.h / 2))
            points.push(b.w + ',' + b.h)
            points.push('0,' + b.h)
            if (i > 0) { // Leftmost breadcrumb  don't include 6th vertex.
                points.push(b.t + ',' + (b.h / 2))
            }
            return points.join(' ')
        }

        // Update the breadcrumb trail to show the current sequence and percentage.
        function updateBreadcrumbs(nodeArray, percentageString) {
            // Data join  key function combines name and depth (= position in sequence).
            const trail = d3.select('#trail')
                .selectAll('g')
                .data(nodeArray, function(d) { return d.data.name + d.depth  })
            // Remove exiting nodes.
            trail.exit().remove()
            // Add breadcrumb and label for entering nodes.
            const entering = trail.enter().append('svg:g')

            entering.append('svg:polygon')
                .attr('points', breadcrumbPoints)
                .style('fill', function(d) { return colors[d.data.name]  })
            entering.append('svg:text')
                .attr('x', (b.w + b.t) / 2)
                .attr('y', b.h / 2)
                .attr('dy', '0.35em')
                .attr('text-anchor', 'middle')
                .text(function(d) { return d.data.name })

                // Merge enter and update selections  set position for all nodes.
            entering.merge(trail).attr('transform', function(d, i) {
                return 'translate(' + i * (b.w + b.s) + ', 0)'
            })

            // Now move and update the percentage at the end.
            d3.select('#trail').select('#endlabel')
                .attr('x', (nodeArray.length + 0.5) * (b.w + b.s))
                .attr('y', b.h / 2)
                .attr('dy', '0.35em')
                .attr('text-anchor', 'middle')
                .text(percentageString)
            // Make the breadcrumb trail visible, if it's hidden.
            d3.select('#trail')
                .style('visibility', '')
        }

        function drawLegend() {
            // Dimensions of legend item: width, height, spacing, radius of rounded rect.
            const li = {
                w: 75, h: 30, s: 3, r: 3
            }
            const legend = d3.select('#legend').append('svg:svg')
                .attr('width', li.w)
                .attr('height', d3.keys(legend_colors).length * (li.h + li.s))

            const g = legend.selectAll('g')
                .data(d3.entries(legend_colors))
                .enter().append('svg:g')
                .attr('transform', function(d, i) {
                    return 'translate(0,' + i * (li.h + li.s) + ')'
                })

            g.append('svg:rect')
                .attr('rx', li.r)
                .attr('ry', li.r)
                .attr('width', li.w)
                .attr('height', li.h)
                .style('fill', function(d) { return d.value })

            g.append('svg:text')
                .attr('x', li.w / 2)
                .attr('y', li.h / 2)
                .attr('dy', '0.35em')
                .attr('text-anchor', 'middle')
                .text(function(d) {return d.key})
        }

        function toggleLegend() {
            const legend = d3.select('#legend')
            if (legend.style('visibility') == 'hidden') {
                legend.style('visibility', '')
            }
            else {
                legend.style('visibility', 'hidden')
            }
        }
        // Take a 2-column CSV and transform it into a hierarchical structure suitable
        // for a partition layout. The first column is a sequence of step names, from
        // root to leaf, separated by hyphens. The second column is a count of how
        // often that sequence occurred.
        function buildHierarchy(csv) {
            const root = {'name': 'root', 'children': []}
            for (let i = 0; i < csv.length; i++) {
                const sequence = csv[i][0]
                const size = +csv[i][1]
                if (isNaN(size)) { // e.g. if this is a header row
                    continue
                }
                const parts = sequence.split('-')
                let currentNode = root
                for (let j = 0; j < parts.length; j++) {
                    const children = currentNode['children']
                    const nodeName = parts[j]
                    let childNode
                    if (j + 1 < parts.length) {
                        // Not yet at the end of the sequence  move down the tree.
                        let foundChild = false
                        for (let k = 0; k < children.length; k++) {
                            if (children[k]['name'] == nodeName) {
                                childNode = children[k]
                                foundChild = true
                                break
                            }
                        }
                        // If we don't already have a child node for this branch, create it.
                        if (!foundChild) {
                            childNode = {'name': nodeName, 'children': []}
                            children.push(childNode)
                        }
                        currentNode = childNode
                    }
                    else {
                        // Reached the end of the sequence  create a leaf node.
                        childNode = {'name': nodeName, 'size': size}
                        children.push(childNode)
                    }
                }
            }
            return root
        }
    }
}