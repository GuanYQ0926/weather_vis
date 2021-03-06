import Vue from 'vue'
import {
    Select,
    Option,
    Dropdown,
    DropdownMenu,
    DropdownItem,
    Button,
    Form,
    FormItem,
    Slider,
    Container,
    Aside,
    Header,
    Main,
    Footer
} from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import Vue2Leaflet from 'vue2-leaflet'
import App from './app.vue'

Vue.use(Select)
Vue.use(Option)
Vue.use(Dropdown)
Vue.use(DropdownMenu)
Vue.use(DropdownItem)
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Slider)
Vue.use(Container)
Vue.use(Aside)
Vue.use(Header)
Vue.use(Main)
Vue.use(Footer)
Vue.component('v-map', Vue2Leaflet.Map)
Vue.component('v-tilelayer', Vue2Leaflet.TileLayer)
Vue.component('v-marker', Vue2Leaflet.Marker)

const eventHub = new Vue()
Vue.mixin({
    data: () => ({eventHub})
})
new Vue({
    el: '#app',
    render: h => h(App)
})
