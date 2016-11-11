<template lang="jade">
div
  layer(v-for='layer in layers', :layer='layer')
</template>

<script>
import StreamStore  from '../store/stream'
import Bus          from '../logic/Events'

import Layer        from './Layer.vue'

export default {
  components: {
    Layer
  },
  data () {
    return {
      StreamStore: StreamStore,
      layers: []
    }
  },
  methods: {
    dropletChange( data ) {
      this.layers = data.structure
      console.log('layers droplet changed')
    }
  },
  compiled() {
    let self = this
    console.log('layers ready')
    Bus.$on('droplet-change', data => { self.dropletChange(data) } )
  }
}
</script>

<style>
</style>
