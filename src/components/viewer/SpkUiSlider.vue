<template lang="jade">
div.param(v-bind:class='{"show-slider" : showSlider }', @mouseleave='toggleSlider', @mouseenter='toggleSlider')
  div.row.middle-xs.less
    h5 #[span.param-value{{ param.nickname ? param.nickname : param.name }}: #[strong(v-el:valuespan) {{ parsedValue }} {{ param.unit }}]]
  div.mobile-param-value.visible-xs {{ param.nickname ? param.nickname : param.name }}: #[strong(v-el:valuespan @click='') {{ parsedValue }} {{ param.unit }}]
  div.row.slider
    div(style='width:95%;pointer-events:all')
      discrete-slider(
          v-ref:slider
          :val.sync='param.value',
          :min='param.max',
          :max='param.min',
          :interval='parseFloat(param.step)',
          tooltip='never', 
          :height='3',
          :dot-size='dotSize', 
          @callback='valueSelected')
</template>

<script>
import DiscreteSlider   from '../packageviewer/DiscreteSlider.vue'
import Bus              from '../logic/Events'

export default {
  components: {
    DiscreteSlider
  },
  props:['param'],
  data () {
    return {
      showSlider: false,
      firstRun: true,
      secondRun: true,
      dotSize: 20
    }
  },
  computed: {
    parsedValue () {
      let strlen = (this.param.step + '').length
      if( strlen > 1 ) strlen = strlen - 2
      else strlen = 0
      return parseFloat(this.param.value).toFixed(strlen)
    }
  },
  methods: {
    toggleSlider() {
      if(window.innerWidth <= 768) return
      this.showSlider = ! this.showSlider
    },
    valueSelected(value) {
      let strlen = (this.param.step + '').length
      if( strlen > 1 ) strlen = strlen - 2
      else strlen = 0
      this.param.value = parseFloat(value).toFixed(strlen)
      if( this.firstRun ) return this.firstRun = false
      // if( this.secondRun ) return this.secondRun = false
      Bus.$emit('controller-updated')
    },
    setupDotsAndStuff() {
      if(window.innerWidth < 768) {
        this.showSlider = true
        this.dotSize = 30;
      }
      else {
        this.dotSize = 20;
        this.showSlider = false
      }
    }
  },
  ready() {
    this.setupDotsAndStuff()
    window.addEventListener( 'resize', this.setupDotsAndStuff )
  }
}
</script>

<style scoped>

h5{
  font-size: 14px;
}
.param {
  position: relative;
  height: 30px;
  user-select:none;
  padding: 10px;
  /*pointer-events: none;*/
  display: block;
  overflow:hidden;
  transition: all .3s ease;
}

.param.show-slider{
  height: 80px;
}

.param-value {
  padding: 5px 10px;
  font-size: 14px;
  color: white;
  background: #4287FF;
  border-radius: 200px;
  user-select:none;
}

.slider {
  margin-top: 20px;
  opacity: 1;
  transition: all .3s ease;
}

@media only screen and (max-width : 48em) {
  .param.show-slider{
    height: 30px;
  }
  .mobile-param-value {
    position: fixed;
    bottom: 65px;
    left: 0;
    width: 100%; 
    text-align:center;
    font-size: 10px;
    text-transform: uppercase;
  }
  .row {
    margin-left: 0;
    margin-right: 0;
  }
  .param {
    position: fixed;
    left:0;
    bottom: 100px;
    width: 100%;
    height: 30px;
  }
  .param-value {
    display: none;
  }
  .less {
    display: none;
  }
  .slider {
    position: relative;
    left: 3%;
    width: 90%;
    margin-top: 5px;
  }
}
</style>
