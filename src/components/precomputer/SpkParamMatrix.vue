<template lang="jade">
div.row
  div.col-xs-12
  div.col-xs-12
    h2 1. Desing Space Defintion
    ui-alert(hide-icon=false, icon='info', :dismissible='false', type='info') Select the sliders that you want to precompute for. The following have been detected in your defintion:
    slider-precalc(v-for='controller in controllers', style='margin-bottom:10px;', :controller.sync='controller', :divisions.sync='controller.divisions')
  div.col-xs-12 
    h2 2. Performance Space:
    ui-alert(hide-icon=false, icon='info', :dismissible='false') Select the information that you want your design evaluated by: cost, surface area, etc. The following have been possibly identified from your stream component:
    eval-selectors(v-ref:performances)
  </template>

<script>


import SliderPrecalc from './SliderPrecalc.vue'
import EvalSelectors from './EvaluationSelectors.vue'

import Bus           from '../logic/Events'

export default {
  components: {
    SliderPrecalc,
    EvalSelectors
  },
  props:['controllers'],
  data () {
    return {
      instanceCount: 1,
      totalInstances: 0, 
      mode: 'generate',
      set: []
    }
  },
  methods: {
    reviewMode() {
      this.mode = 'review'
    },
  
    generateSet() {
      let allArrays = []
      let guids = []
      let length = 1
      for(let controller of this.controllers ) {
        if(controller.enabled) {
          guids.push( controller.guid )
          if( controller.manualEntries ) {
            allArrays.push( controller.manualEntryValues )
            length *= controller.manualEntryValues.length
          }
          else {
            allArrays.push( controller.values )
            length *= controller.values.length
          }
        }
      }
      let set = this.getCartesianSet( allArrays, length )

      // console.log(this.$refs.performances.getPerformances())
      let perfs = this.$refs.performances.getPerformances()
      let selectedPerfs = []
      for(let perf of perfs) {
        if(perf.enabled)
          selectedPerfs.push(perf)
      }
      
      let bag = {
        guids: guids,
        set: set,
        packageName: this.packageName,
        perfs: selectedPerfs
      }
      
      return bag
      // Bus.$emit('pop-requester', bag )
    },
    
    getCartesianSet( allArrays, len ) {
      let divisors = []
      let set = []
      for (var i = allArrays.length - 1; i >= 0; i--) {
        divisors[i] = divisors[i + 1] ? divisors[i + 1] * allArrays[i + 1].length : 1;
      }

      let getPermutation = function( n ) {
        var result = [], curArray;
        for (var i = 0; i < allArrays.length; i++) {
          curArray = allArrays[i];
          result.push( parseFloat(curArray[Math.floor(n / divisors[i]) % curArray.length]) );
        }
        return result;
      }
      
      for(let i=0; i<len; i++ ) {
        set.push( getPermutation(i) )
      }
      return set
    },

    computeTotalInstances() {
      let a = 1
      this.controllers.forEach( (ctrl, index ) => {
        if(ctrl.enabled) {
          if(ctrl.manualEntries) {
            a *= ctrl.manualEntryValues.length
          }
          else {
            a *= ctrl.values.length
          }
        } 
      })
      this.$dispatch( 'total-instances', a )
      this.totalInstances = a
    }
  },
  events: {
    'divisions-updated'() {
      this.computeTotalInstances()
    }
  },
  ready() {
    console.log('param matrix ready')
    console.log(this.controllers)
  }
}
</script>

<style>
</style>
