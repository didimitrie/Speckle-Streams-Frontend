<template lang="jade">
div.spk-slider
  div.row.middle-xs.slider-row
    div.col-xs-3.controller-name.small {{ controller.nickname != '' ? controller.nickname : controller.name }}
    div.col-xs-7
      ui-slider(:value.sync='slidervalue' @mouseover='sliderFocus = true')
    div.col-xs-2
      ui-textbox(:value.sync='controller.value', name='value', type='number', :min='controller.max', :max='controller.min' v-on:keyup.enter='directInputPlease' @focussed='sliderFocus = false')

</template>

<script>

import Bus from '../logic/Events'

export default {
  props:['controller'],
  data () {
    return {
      slidervalue: 30,
      firstchange: true,
      directValue: 0,
      showDirectInput: false,
      sliderFocus: true,
      isInt: false
    }
  },
  methods:{ 
    directInputPlease() {
      this.controller.value
    },
    mapNumber( num, in_min, in_max, out_min, out_max) {
      return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min
    }
  },
  watch: {
    slidervalue() {
      if(!this.sliderFocus) return
      if( this.firstchange ) return this.firstchange = false
      console.log('change slider value')
      let actualValue = this.mapNumber( this.slidervalue, 0, 100, this.controller.max, this.controller.min )
      this.controller.value = parseFloat( actualValue.toFixed( this.isInt ? 0 : this.controller.decimalPlaces ) )
      Bus.$emit('controller-updated')
    },
    'controller.value'() {
      if(this.sliderFocus) return
      this.slidervalue = this.mapNumber( this.controller.value, this.controller.max, this.controller.min, 0, 100)
      Bus.$emit('controller-updated')
    },
    sliderFocus(){
      console.log(this.sliderFocus)
    }
  },
  events: {

  },
  ready() {
    if( this.controller.step % 1 === 0) 
      this.isInt = true
    this.slidervalue = this.mapNumber( this.controller.value, this.controller.max, this.controller.min, 0, 100 )
  }
}
</script>

<style>
.slider-settings{
  color: #A4A4A4;
  font-size: 18px;
  margin-right: 10px;
}

.value-display{
  position: relative;
  top: -10px;
  width: 14%;
}

.slider-value p{
  margin-bottom: 0;
  font-size: 12px;
  width: 40px;
}

.spk-slider {
  padding: 13px;
  box-sizing: border-box;
  margin-top: 5px;
}
.input-row {
  position: absolute;
  top: 0;
  z-index: 300;
  width: 100%;
}

.ui-item-block {
  display: inline-block;
  float: left;
}


</style>
