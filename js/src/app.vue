<template>
    <div id="app">
        <el-container style="height: 100%; width: 100%;">
            <el-header style="height: 10%;">Weather Causality</el-header>
            <el-container>
                <el-aside width="20%">
                    <div id="buttons">
                        <el-form :inline="true" class="demo-form-inline" size="mini">
                            <el-form-item label="Select city">
                                <el-select v-model="city" filterable placeholder="Gifu" size="mini" no-match-text="No matching data">
                                    <el-option
                                        v-for="city in cities"
                                        :key="city.value"
                                        :label="city.label"
                                        :value="city.value">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="factor 1">
                                <el-select v-model="factor1" placeholder="temperature" size="mini">
                                    <el-option
                                        v-for="factor in factors"
                                        :key="factor.value"
                                        :label="factor.label"
                                        :value="factor.value">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <br/>
                            <el-form-item label="factor 2">
                                <el-select v-model="factor2" placeholder="temperature" size="mini">
                                    <el-option
                                        v-for="factor in factors"
                                        :key="factor.value"
                                        :label="factor.label"
                                        :value="factor.value">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item>
                                <el-button size="mini" plain @click='onClick'>confirm</el-button>
                            </el-form-item>
                        </el-form>
                        <div id="slider">
                            <div class="block">
                                <span class="demonstration">Month</span>
                                    <el-slider v-model="ccm_date" :step="1" :max="12" :min="0" :format-tooltip="formatTooltip" show-stops></el-slider>
                            </div>
                        </div>
                    </div>
                </el-aside>
                <el-container style="height: 100%; width: 80%;">
                    <el-main style="height: 50%;">
                        <sunburst></sunburst>
                    </el-main>
                    <el-footer style="height: 40%;">
                        <linechart></linechart>
                    </el-footer>
                </el-container>
            </el-container>
        </el-container>
    </div>
</template>

<script>
import axios from 'axios'
import $ from 'jquery'
import Linechart from './components/linechartView.vue'
import Sunburst from './components/sunburstView.vue'

export default {
    components: {
        linechart: Linechart,
        sunburst: Sunburst,
    },
    data: () => ({
        width: window.innerWidth/2,
        height: window.innerHeight,
        factors: [
            {value: 'temperature', label: 'Temperature'},
            {value: 'rainfall', label: 'Precipitation'},
            {value: 'windspeed', label: 'Wind Speed'},
            {value: 'vaporpressure', label: 'Vapor Pressure'},
            {value: 'cloud', label: 'Cloud Amount'},
        ],
        factor1: 'temperature',
        factor2: 'rainfall',
        cities: [
            {value: 'Kobe', label: 'Kobe', lat: 34.69139, lon: 135.18306},
            {value: 'Kyoto', label: 'Kyoto', lat: 35.02139, lon: 135.75556},
            {value: 'Oosaka', label: 'Oosaka', lat: 34.68639, lon: 135.52},
            {value: 'Wakayama', label: 'Wakayama', lat: 34.230411, lon: 135.17081},
            {value: 'Nara', label: 'Nara', lat: 34.68528, lon: 135.83278},
            {value: 'Otsu', label: 'Otsu', lat: 35.017754, lon: 135.85471},
            {value: 'Fukui', label: 'Fukui', lat: 36.064189, lon: 136.219374},
            {value: 'Tsu', label: 'Tsu', lat: 34.718576, lon: 136.505511},
            {value: 'Gifu', label: 'Gifu', lat: 35.39111,lon: 136.72222},
            {value: 'Nagoya', label: 'Nagoya', lat: 35.18028, lon: 136.90667},
        ],
        city: 'Gifu',
        ccm_date: 1,
        month_list: {
            1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
            7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec',
        }
    }),
    methods: {
        onClick(e) {
            //fetch data from server
            const params = new URLSearchParams()
            params.set('city', this.city)
            params.set('factor1', this.factor1)
            params.set('factor2', this.factor2)
            params.set('month', this.ccm_date)
            const url = `http://0.0.0.0:5000/data/${params.toString()}`
            this.requestToServer(url)
        },
        requestToServer(url, redraw_all=true) {  // from server
            if(redraw_all) {
                $('#linechart').empty()
                $('#chart').empty()
                $('#legend').empty()
            }
            else {
                $('#chart').empty()
                $('#legend').empty()
            }
            axios.get(url)
            .then(res => {
                const data = res.data
                if(redraw_all){
                    this.eventHub.$emit('initLinechartScene', [data[0], data[1]])
                    this.eventHub.$emit('initSunburstScene', data[2])
                    //this.eventHub.$emit('initJapanmapScene')
                }
                else {
                    this.eventHub.$emit('initSunburstScene', data[2])
                }

            })
            .catch(err => {
                console.error(err)
            })
        },
        formatTooltip(val) {
            let res = "Hide"
            if(val != 0) {
                res = this.month_list[val]
            }
            return res
        }
    },
    watch: {
        ccm_date(val) {
            console.log(val)
            const params = new URLSearchParams()
            params.set('city', this.city)
            params.set('factor1', this.factor1)
            params.set('factor2', this.factor2)
            params.set('month', val)
            const url = `http://0.0.0.0:5000/data/${params.toString()}`
            this.requestToServer(url, false)
        }
    },
    mounted() {
        const params = new URLSearchParams()
        params.set('city', this.city)
        params.set('factor1', this.factor1)
        params.set('factor2', this.factor2)
        params.set('month', this.ccm_date)
        const url = `http://0.0.0.0:5000/data/${params.toString()}`
        this.requestToServer(url)
    }
}
</script>

<style>
    html, body, #app {
        height: 100%;
        margin: 0;
    }
    body {
        font-family: Sans-serif;
        font-size: 10px;
    }
    #buttons {
        float: left;
    }
    #sunburst {
        float: left;
        position: absolute;
    }
    #linechart {
        float: left;
    }

    .el-header, .el-footer {
        border: 0.5px solid #c0c0c0;
        border-radius: 8px;
        color: #333;
        text-align: center;
        line-height: 35px;
    }
    .el-aside {
        border: 0.5px solid #c0c0c0;
        border-radius: 8px;
        color: #333;
        text-align: center;
    }
    .el-main {
        border: 0.5px solid #c0c0c0;
        border-radius: 8px;
        color: #333;
        text-align: center;
    }
    .el-select {
        width: 120px;
    }
</style>
