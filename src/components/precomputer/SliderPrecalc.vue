<template lang="jade">
div.row.slider-precalculator(style='', v-bind:class='{"enabled": enabled }')
  div.col-xs-1
    ui-checkbox(:model.sync='enabled')
  div.col-xs-11
    | #[strong {{controller.nickname ? controller.nickname : controller.name}}]
  div.col-xs-12(v-show='enabled', transition='fade', transition-mode='out-in', style='background:aliceblue;')
    br
    div.row(v-if='controller.type==="toggle"')
      div.col-xs-10
        pre TRUE, FALSE
        br
    div.row(v-else, v-show='!showManualEditModal')
      div.col-xs-2
        ui-textbox(type='number', name='min', :value.sync='controller.max', label='Minimum')
      div.col-xs-2
        ui-textbox(type='number', name='max', :value.sync='controller.min', label='Maximum')
      div.col-xs-3
        ui-textbox(type='number', name='valnr', :value.sync='divisions', label='# of values', :min='2')
      div.col-xs-2
        ui-textbox(type='number', name='decimal', :value.sync='controller.decimalPlaces', label='Decimals', :min='0', :max='10')
      div.col-xs-3
        ui-textbox(name='units', :value.sync='unit', label='Unit (ie, m2, £)',)
      div.col-xs-12
        p.small Unique generated values are below.
        pre.small(style='max-width:100%; height: 50px; line-height: 50px; background: white; overflow-x:auto; overflow-y:hidden; padding: 5px;', v-show='!showManualEditModal', transition='fade', transition-mode='out-in') {{ valuesParsed }}
        br
        p.small #[a(@click='manualEdit()') Edit the list manually?] (Set just one value or other values that can't be generated programatically.)
    div.row(v-show='showManualEditModal', transition='fade', transition-mode='out-in')
      div.col-xs-12.manual-edit
        pre.small(style='max-width:100%; height: 50px; line-height: 50px; background: white; overflow-x:auto; overflow-y:hidden; padding: 5px;') Result: {{ parsedEntryValues }}
        br
        ui-textbox(type='string', name='manual entry values', :value.sync='entryValues', help-text='Enter any numbers separated by commas. ')
        p.small #[a(@click='fuckManualEditMode()') What a bother. Switch back to auto generation?]
</template>

<script>

import _ from 'underscore'

export default {
  props:['controller', 'divisions'],
  data () {
    return {
      enabled: false,
      values: [],
      numberOfValues: 5,
      showManualEditModal: false,
      entryValues: '',
      parsedEntryValues: [],
      unit: null
    }
  },
  computed: {
    valuesParsed() {
      return this.values.join(', ')
    },
    parsedEntryValues() {
      let self = this
      let strarr = this.entryValues.split(',')
      let result = _.uniq( _.map( strarr, (item) => { 
        // return parseFloat(item).toFixed( self.controller.decimalPlaces ) // maybe completely ignore 
        return parseFloat(item)
      } ) )
      this.controller.manualEntryValues = result
      this.$dispatch('divisions-updated')
      return result
    },
    values() {
      let self = this
      let max = this.controller.max > this.controller.min ? this.controller.max : this.controller.min
      let min = this.controller.min < this.controller.max ? this.controller.min : this.controller.max

      let arr = _.range( this.divisions )
      let result =  _.uniq( _.map( arr, (num) => { 
        return self.mapNumber( num, 0, self.divisions - 1, min, max ).toFixed( self.controller.decimalPlaces )
      }))
      this.controller.values = result
      this.$dispatch('divisions-updated')
      return result
    }
  },
  methods: {
    mapNumber( num, in_min, in_max, out_min, out_max) {
      return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min
    },
    manualEdit() {
      this.showManualEditModal = true
      this.controller.manualEntries = true
      this.entryValues = this.values.join(', ')
    }, 
    fuckManualEditMode() {
      this.showManualEditModal = false
      this.controller.manualEntries = false
    },
    getValues() {

    }
  },
  watch: {
    unit() {
      this.controller.unit = this.unit
    },
    values() {
      this.controller.values = this.values
      // this.$dispatch('divisions-updated')
    },
    enabled() {
      this.controller.enabled = this.enabled
      if(this.enabled) { 
        this.values = this.getValues()
        this.controller.values = this.values
      }
      this.$dispatch('divisions-updated')
    }
  },
  ready() {
    this.controller.unit = ''
    if(this.controller.step % 1 === 0) this.controller.decimalPlaces = 0
  }
}
</script>

<style>
/*wtf???*/
a:hover{
  cursor: pointer; 
}
.slider-precalculator {
  box-sizing: border-box;
  padding: 10px;
  margin-top: 10px;
}
.slider-precalculator a{
  color: #0080FF !important;
}
.slider-precalculator a:hover{
  color: #8000FF !important;
}
.manual-edit{
}
.enabled {
  /*background: aliceblue;*/
}

</style>
