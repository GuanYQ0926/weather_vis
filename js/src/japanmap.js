import * as d3 from 'd3'

export default class Japanmap {
    constructor() {
        this.width = window.innerWidth*0.8*0.5
        this.height = window.innerHeight*0.48
        this.city_color = {
            'Kobe': '#E3BA22', 'Kyoto': '#E58429',
            'Oosaka': '#BD2D28', 'Wakayama': '#D15A86',
            'Nara': '#8E6C8A', 'Otsu': '#6B99A1',
            'Fukui': '#42A5B3', 'Tsu': '#0F8C79',
            'Gifu': '#6BBBA1', 'Nagoya': '#5C8100'
        }
    }
    initScene() {
        const svg = d3.select(document.getElementById('japanmap')).append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
        const projection = d3.geoMercator()
            .center([136.0, 35.0])
            .scale(1700)
            .translate([this.width*0.7, this.height*0.7])
        const path = d3.geoPath().projection(projection)
        d3.json('../asset/japan.json', data => {
            svg.selectAll('path').data(data.features)
                .enter().append('path')
                .attr('stroke', 'white')
                .attr('stroke-width', '0.5')
                .attr('d', path)
                .style('fill', d => {
                    const index = data.features.indexOf(d)
                    switch (index) {
                    case 14:
                        return this.city_color.Gifu
                    case 15:
                        return this.city_color.Fuki
                    case 20:
                        return this.city_color.Otsu
                    case 23:
                        return this.city_color.Nagoya
                    case 24:
                        return this.city_color.Tsu
                    case 25:
                        return this.city_color.Oosaka
                    case 26:
                        return this.city_color.Nara
                    case 27:
                        return this.city_color.Wakayama
                    case 28:
                        return this.city_color.Kyoto
                    case 29:
                        return this.city_color.Kobe
                    default:
                        return '#c0c0c0'
                    }
                })
        })
    }
}
/*
{
14: Gifu,
15: Fukui,
20: Otsu(Shiga),
23: Nagoya,
24: Tsu(Mie)
25: Oosaka,
26: Nara,
27: Wakayama,
28: Kyoto,
29: Kobe
}
*/
