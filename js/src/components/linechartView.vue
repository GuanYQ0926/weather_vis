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
.line {
    fill: none;
    stroke-width: 1px;
    clip-path: url(#clip);
}
.cell {
}
.legend {
    /*fill: steelblue;*/
}
.label {
    font-size: 10px;
}
</style>
