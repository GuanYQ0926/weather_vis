<template>
    <div id="japanmap"></div>
</template>

<script>
import Japanmap from '../japanmap'

export default {
    data: () => ({
        jm: new Japanmap(),
    }),
    mounted() {
        this.eventHub.$on('initJapanmapScene', () => this.jm.initScene())
    }
}
</script>
