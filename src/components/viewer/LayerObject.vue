<template lang="jade">
div.object(@mouseenter='mouseEnter', @mouseleave='mouseLeave', @click='zoomExtents()')
  #[small ({{ hash.split(".")[0] }})] #[small {{ value }}] 
</template>

<script>
import _                  from 'underscore'
import Bus                from '../logic/Events'
import Molecules          from '../store/molecules'

export default {
  props: ['hash'],
  data () {
    return {
      value: 'Object',
      visible: true,
      // molecule: null
    }
  },
  methods: { 
    zoomExtents() {
      // console.log(this.molecule.value)
      // console.log(this.molecule.displayValue)
      let objs = []
      objs.push(this.hash) 
      Bus.$emit('zoom-objects', objs)
    },
    mouseEnter() {
      let arr = []
      arr.push(this.hash)
      Bus.$emit('hover-objects', arr)
    },
    mouseLeave() {
      let arr = [this.hash]
      Bus.$emit('nohover-objects', arr)
    },
    setValue ( molecule ) { 
      let self = this
       let type = molecule.hash.split(".")[0]
        switch( type ) {
          case 'Number':
            self.value = molecule.value
          break
          case 'Point':
          self.value = '(' + molecule.value.X.toFixed(2) + ', ' + molecule.value.Y.toFixed(2) + ', ' + molecule.value.Z.toFixed(2) + ')'
          break
          case 'String':
          self.value = molecule.value
          break
          case 'Bool':
          self.value = molecule.value
          break
        }
    }
  },
  ready() {
    let self = this
    this.Molecules = Molecules
    this.molecule = null
    let mol = _.findWhere( self.Molecules.molecules, { hash: self.hash })
    if( mol ) {
      this.molecule = mol
      self.setValue( mol )
    }
    else 
      Bus.$on('hash-loaded', ( hash ) => {
        if( hash === self.hash ) {
          this. molecule = _.findWhere( self.Molecules.molecules, { hash: hash })
          self.setValue( this.molecule )
        }
      })
  }
}
</script>

<style scoped>
.object {
/*  max-width: 80%;
  background: gray;*/

}
</style>
