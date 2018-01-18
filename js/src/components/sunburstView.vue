<template>
    <div id="sunburst">
        <div id="sequence"></div>
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
#sequence {
  width: 600px;
  height: 55px;
}

#sequence text {
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
  top: 120px;
  left: 150px;
  width: 140px;
  text-align: center;
  color: #666;
  z-index: -1;
}

#percentage {
  font-size: 2.5em;
}
</style>
