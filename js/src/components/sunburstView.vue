<template>
    <div id="sunburst"></div>
</template>

<script>
import Sunburst from '../sunburst'

export default {
    data: () => ({
        sb: new Sunburst(),
    }),
    mounted() {
        this.eventHub.$on('initSunburstScene', () => this.sb.initScene())
    }
}

</script>

<style>
.slice {
    cursor: pointer;
}
.slice .main-arc {
    stroke: #E5E2E0;
    stroke-width: 1px;
}
.slice .hidden-arc {
    fill: none;
}
.slice text {
    pointer-events: none;
    dominant-baseline: middle;
    text-anchor: middle;
}
</style>
