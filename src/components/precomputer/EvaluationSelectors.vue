<template lang="jade">
div.row
  div.col-xs-12(v-for='struct of parsedStructure')
    eval-object(:struct.sync='struct', v-ref:performance)

</template>

<script>
import Droplets      from '../store/droplets'
import EvalObject    from './EvalObject.vue'

export default {
  components: {
    EvalObject
  },
  data () {
    return {
      DropletStore: Droplets
    }
  },
  computed: {
    parsedStructure() {
      let pstruct = []
      for(let struct of this.DropletStore.droplets[0].structure) {
        if( struct.count === 1 )
          if( struct.objects[0].split('.')[0]==="Number") {
            let mygiggle = {
              objects: struct.objects,
              name: struct.name,
              guid: struct.guid,
              enabled: true,
              unit: null
            }
            pstruct.push(mygiggle)
          }
      }
      return pstruct
    }
  },
  methods: {
    getPerformances() {
      return this.parsedStructure
    },
    getFeasibleMeasures () {
      // dropletStore.droplets[0].structure
      // for(let struct of dropletStore.droplets[0].structure)
    }
  },
  ready() {

  }
}
</script>

<style>
</style>
