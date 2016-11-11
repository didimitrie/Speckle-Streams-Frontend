<template lang="jade">
div.row
  div.col-xs-1
    ui-checkbox(:model.sync='enabled')
  div.col.xs-11 #[strong {{ struct.name }}]
  div.col-xs-12(v-if='enabled', style='margin-bottom:20px')
    div.row
      div.col-xs-6
        ui-textbox(:value.sync='value', label='Current Value', :disabled='true', name='lol')
      div.col-xs-6
        ui-textbox(:value.sync='struct.unit', label='Unit. Is it m2, m3, £? ', name='units')
</template>

<script>
import _                  from 'underscore'
import Molecules          from '../store/molecules'
import Bus                from '../logic/Events'

export default {
  props:['struct'],
  data () {
    return {
      Molecules: Molecules,
      value: null,
      unit: null,
      enabled: true
    }
  },
  methods: {
  },
  watch: {
    'enabled'() {
      console.log('enabled changed')
      this.struct.enabled = this.enabled
    }
  },
  ready() {
    let mol = _.findWhere( this.Molecules.molecules, { hash: this.struct.objects[0] })
    this.value = mol.value
  }
}
</script>

<style>
</style>
