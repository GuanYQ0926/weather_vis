<template>
    <div id="sunburst">
        <div id="sequence"></div>
        <div id="legend"></div>
        <div id="chart">
            <div id="explanation" style="visibility: hidden;">
                <span id="percentage"></span><br/>
            </div>
        </div>
    </div>
</template>

<script>
import Sunburst from '../sunburst'

export default {
    data: () => ({
        sb: new Sunburst(),
    }),
    mounted() {
        this.eventHub.$on('initSunburstScene', data => this.sb.initScene(data))
    }
}

</script>

<style>
#sidebar {
  float: right;
  width: 100px;
}

#sequence {
  width: 600px;
  height: 70px;
}

#legend {
  padding: 10px 0 0 3px;
  float: right;
}

#sequence text, #legend text {
  font-weight: 600;
  fill: #fff;
}

#chart {
  position: relative;
}

#chart path {
  stroke: #fff;
}

#explanation {
  position: absolute;
  top: 110px;
  left: 190px;
  width: 140px;
  text-align: center;
  color: #666;
  z-index: -1;
}

#percentage {
  font-size: 2.5em;
}
</style>
