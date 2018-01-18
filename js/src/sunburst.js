import * as d3 from 'd3'


export default class Sunburst{
    constructor(){
        this.width = window.innerWidth*0.8
        this.height = window.innerHeight*0.6 - 70
        this.max_radius = Math.min(this.width, this.height) / 2.5
    }
    initScene(data) {
        this.data = data
        this.renderScene()
    }
    renderScene() {
        const width = this.width,
            height = this.height,
            radius = this.max_radius
        const bread = {w: 75, h: 30, s: 3, t: 10}
        const colors = {
            'Kobe': '#bbbbbb', 'Kyoto': '#bbbbbb', 'Oosaka': '#bbbbbb',
            'Wakayama': '#bbbbbb', 'Nara': '#bbbbbb', 'Otsu': '#bbbbbb',
            'Fukui': '#bbbbbb', 'Tsu': '#bbbbbb', 'Gifu': '#bbbbbb', 'Nagoya': '#bbbbbb',
            'rainfall': '#1f77b4', 'windspeed': '#ff7f0e', 'vaporpressure': '#2ca02c', 'cloud': '#d62728', 'temperature': '#9467bd',
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
            .attr('transform', `translate(${height/1.5}, ${height/2.5})`)

        const partition = d3.partition()
            .size([2 * Math.PI, radius * radius])

        const arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .innerRadius(d => Math.sqrt(d.y0))
            .outerRadius(d => Math.sqrt(d.y1))

        const json = buildHierarchy(this.data)
        createVisualization(json)

        // Main function to draw and set up the visualization, once we have the data.
        function createVisualization(json) {
        // Basic setup of page elements.
            initializeBreadcrumbTrail()
            // Bounding circle underneath the sunburst, to make it easier to detect
            // when the mouse leaves the parent g.
            vis.append('svg:circle')
                .attr('r', radius)
                .style('opacity', 0)

            // Turn the data into a d3 hierarchy and calculate the sums.
            const root = d3.hierarchy(json)
                .sum(d => d.size)
                .sort((a, b) => (b.value - a.value))

            // For efficiency, filter nodes to keep only those large enough to see.
            const nodes = partition(root).descendants()
                .filter(function(d) {
                    return (d.x1 - d.x0 > 0.005)  // 0.005 radians = 0.29 degrees
                })

            const path = vis.data([json]).selectAll('path')
                .data(nodes)
                .enter().append('svg:path')
                .attr('display', d => d.depth ? null : 'none')
                .attr('d', arc)
                .attr('fill-rule', 'evenodd')
                .style('fill', d => colors[d.data.name])
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
            d3.select('#container').selectAll('path')
                .style('opacity', 0.3)

            // Then highlight only those that are an ancestor of the current segment.
            vis.selectAll('path')
                .filter(node => sequenceArray.indexOf(node) >= 0)
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
            points.push(bread.w + ',0')
            points.push(bread.w + bread.t + ',' + (bread.h / 2))
            points.push(bread.w + ',' + bread.h)
            points.push('0,' + bread.h)
            if (i > 0) { // Leftmost breadcrumb  don't include 6th vertex.
                points.push(bread.t + ',' + (bread.h / 2))
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
                .attr('x', (bread.w + bread.t) / 2)
                .attr('y', bread.h / 2)
                .attr('dy', '0.35em')
                .attr('text-anchor', 'middle')
                .text(d => d.data.name)

                // Merge enter and update selections  set position for all nodes.
            entering.merge(trail).attr('transform', (d, i) => `translate(${i * (bread.w + bread.s)}, 0)`)

            // Now move and update the percentage at the end.
            d3.select('#trail').select('#endlabel')
                .attr('x', (nodeArray.length + 0.5) * (bread.w + bread.s))
                .attr('y', bread.h / 2)
                .attr('dy', '0.35em')
                .attr('text-anchor', 'middle')
                .text(percentageString)
            // Make the breadcrumb trail visible, if it's hidden.
            d3.select('#trail')
                .style('visibility', '')
        }

        // Take a 2-column CSV and transform it into a hierarchical structure suitable
        // for a partition layout. The first column is a sequence of step names, from
        // root to leaf, separated by hyphens. The second column is a count of how
        // often that sequence occurred.
        function buildHierarchy(json) {
            const root = {'name': 'root', 'children': []}
            for (let i = 0; i < json.length; i++) {
                const sequence = json[i][0]
                const size = +json[i][1]
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
