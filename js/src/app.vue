<template>
    <div id="app">
        <div id="buttons">
            <el-form :inline="true" class="demo-form-inline" size="mini">
                <el-form-item label="市町村">
                    <el-select v-model="city" filterable placeholder="岐阜" size="mini" no-match-text="No matching data">
                        <el-option
                            v-for="city in cities"
                            :key="city.value"
                            :label="city.label"
                            :value="city.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="気象データ">
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
                <el-form-item label="市町村">
                    <el-select v-model="allcities" disabled placeholder="他の観測所" size="mini"></el-select>
                </el-form-item>
                <el-form-item label="気象データ">
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
                    <el-button size="mini" plain @click='onClick'>確認</el-button>
                </el-form-item>
            </el-form>
        </div>
        <sunburst></sunburst>
        <linechart></linechart>
        <div id="slider">
            <div class="block">
                <span class="demonstration">Month</span>
                <el-slider v-model="ccm_date" :step="1" :max="11" :min="0" :format-tooltip="formatTooltip" show-stops></el-slider>
            </div>
        </div>
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
            {value: 'temperature', label: '日平均気温'},
            {value: 'rainfall', label: '降水量'},
            {value: 'windspeed', label: '日平均風速'},
            {value: 'vaporpressure', label: '日平均蒸気圧'},
            {value: 'cloud', label: '日平均雲量'},
            {value: 'sunlight', label: '日合計全天日射量'},
        ],
        factor1: 'temperature',
        factor2: 'rainfall',
        cities: [
            {value: 'Kobe', label: '神戸', lat: 34.69139, lon: 135.18306},
            {value: 'Kyoto', label: '京都', lat: 35.02139, lon: 135.75556},
            {value: 'Oosaka', label: '大阪', lat: 34.68639, lon: 135.52},
            {value: 'Wakayama', label: '和歌山', lat: 34.230411, lon: 135.17081},
            {value: 'Nara', label: '奈良', lat: 34.68528, lon: 135.83278},
            {value: 'Otsu', label: '大津', lat: 35.017754, lon: 135.85471},
            {value: 'Fukui', label: '福井', lat: 36.064189, lon: 136.219374},
            {value: 'Tsu', label: '津', lat: 34.718576, lon: 136.505511},
            {value: 'Gifu', label: '岐阜', lat: 35.39111,lon: 136.72222},
            {value: 'Nagoya', label: '名古屋', lat: 35.18028, lon: 136.90667},
        ],
        city: 'Gifu',
        allcities: '',
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
            const url = `http://0.0.0.0:5000/data/${params.toString()}`
            this.requestToServer(url)
        },
        requestToServer(url) {  // from server
            $('#linechart').empty()
            $('#chart').empty()
            $('#legend').empty()
            axios.get(url)
            .then(res => {
                const data = res.data
                this.eventHub.$emit('initLinechartScene', [data[0], data[1]])
                this.eventHub.$emit('initSunburstScene', data[2])
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
        }
    },
    mounted() {
        const params = new URLSearchParams()
        params.set('city', this.city)
        params.set('factor1', this.factor1)
        params.set('factor2', this.factor2)
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
        width: 50%;
    }
    #sunburst {
        float: right;
    }
    #linechart {
        float: left;
    }
    #slider {
        float: right;
        width: 50%;
    }
</style>
