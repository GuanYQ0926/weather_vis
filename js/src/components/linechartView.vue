<template>
    <div id="linechart"></div>
</template>

<script>
import Linechart from '../linechart'

export default{
    data: () => ({
        lc: new Linechart(),
    }),
    mounted(){
        this.eventHub.$on('initLinechartScene', data => this.lc.initScene(data))
    }
}
</script>

<style>
.zoom {
    cursor: move;
    fill: none;
    pointer-events: all;
}
.line {
    fill: none;
    stroke: #EF5285;
    stroke-width: 2px;
    clip-path: url(#clip);
}
.area {
    fill: #EF5285;
    clip-path: url(#clip);
}
</style>
