<template lang="jade">
div(style='width:100%;')
  div.row
    div.col-xs-12
      div.row.layer-bar.noselect
        div.col-xs-8.layer-name(@mouseenter='mouseEnter', @mouseleave='mouseLeave', v-on:click='brother.expanded = !brother.expanded') #[ui-icon.hidden-xs(:icon='brother.expanded ? "expand_less":"expand_more"')] #[strong {{ layer.name }}] ({{layer.objects.length}})
        div.col-xs-1
          ui-icon.visible-toggle(:icon='brother.visible ? "visibility" : "visibility_off"', v-on:click='toggleVisibility()')
        div.col-xs-1
          ui-icon.visible-toggle(icon='all_out', v-on:click='zoomExtents()', @mouseenter='mouseEnter', @mouseleave='mouseLeave')
        div.col-xs-1
          div.layer-color.ui-button-raised(v-el:layercolor, v-on:click='showcolors = !showcolors')
    div.col-xs-12(v-show='showcolors', transition="fade", transition-mode="out-in")
      div.row.center-xs.middle-xs.color-picker
        div.col.text-center
          br
          color-picker(v-el:color-picker, :colors.sync='brother.colors')
          br
          ui-button(color='primaryxxx', type='flat', v-on:click='showcolors = false') Done
  div.row.hidden-xs
    div.col-xs-12.expanded-layer(v-show='brother.expanded' transition="fade" transition-mode="out-in")
      div.object-name(v-for='obj in layer.objects | limit maxSubObjects' track-by='$index') #[layer-object(:hash='obj' )]
      div.object-name(v-if='layer.objects.length > maxSubObjects' @click='maxSubObjects+=layer.objects.length') #[strong.small {{ layer.objects.length - maxSubObjects }} excluded. Show all?]
</template>

<script>
import _                  from 'underscore'
import Vue                from 'vue'
import {Chrome}           from 'vue-color'

import Bus                from '../logic/Events'
import StreamStore        from '../store/stream'

import LayerObject        from './LayerObject.vue'

var defaultProps = {
  hex: '#BFBFBF', 
  hsl: {
    h: 150,
    s: 0.5,
    l: 0.2,
    a: 1
  },
  hsv: {
    h: 150,
    s: 0.66,
    v: 0.30,
    a: 1
  },
  rgba: {
    r: 25,
    g: 77,
    b: 51,
    a: 1
  },
  a: 1
}

export default {
  components: {
    LayerObject,
    'color-picker': Chrome
  },
  props:['layer'],
  computed: {
  },
  data () {
    return {
      StreamStore: StreamStore,
      showcolors: false,
      firstcolorchange: true,
      firstvisiblechange: true,
      firstexpansionchange: true,
      maxSubObjects: 5,
      brother: {
        expanded: false,
        colors: defaultProps,
        visible: true
      }
    }
  },
  filters: {
    limit(arr, limit) {
      return arr.slice(0, Number(limit))
    }
  },
  methods: {
    zoomExtents() {
      Bus.$emit('zoom-objects', this.layer.objects)
    },

    mouseEnter() {
      let self = this
      Bus.$emit('hover-objects', self.layer.objects)
    },
    
    mouseLeave() {
      Bus.$emit('nohover-objects', this.layer.objects)
    },

    getObject ( obj ) {
      let self = this
      let type = obj.split('.')[0]
      return type
    },

    toggleVisibility() {
      let self = this
      this.brother.visible = !this.brother.visible
      Bus.$emit('toggle-visibility', { objs: self.layer.objects, visible: self.brother.visible} )
    }
  },
  watch: {
    'brother.colors'() {
      let self = this
      this.$els.layercolor.style.backgroundColor = self.brother.colors.hex   
      if( this.firstcolorchange ) return (function() {self.firstcolorchange = false })() // prevent a first fire
      this.StreamStore.updateConsolidatedStructure( this.layer.guid, this.brother )
      Bus.$emit('change-color', { objs: self.layer.objects, color: self.brother.colors.hex, alpha: self.brother.colors.a})
    },
    'brother.visible' () {
      this.StreamStore.updateConsolidatedStructure( this.layer.guid, this.brother )
    },
    'brother.expanded' () {
      this.StreamStore.updateConsolidatedStructure( this.layer.guid, this.brother )
    }
  },
  compiled () {
    let self = this

    let brother = _.findWhere( this.StreamStore.consolidatedStructure, { guid: self.layer.guid } )
    if( brother ) {
      //console.log(brother)
      if( !brother.colors ) brother.colors = defaultProps
      this.brother.colors = brother.colors
    
    }
    else console.error(' this should fucking not happen!!! ')
    Bus.$on('update-layer-names', (layers) => {
      let newlayer = _.findWhere( layers.structure, {guid: this.layer.guid})
      if(newlayer) this.layer.name = newlayer.name
    })
  }
}
</script>

<style>
.color-picker {
  position: absolute;
  top:0;
  left:0;
  height: 100%;
  width: 100%;
  background-color: white;
}
.layer-name {
  cursor: pointer;
  height: 50px;
  line-height: 50px;
  font-size: 12px;
  /*font-weight: 400;*/
  overflow: hidden;
} 
.layer-bar:hover{
  background-color: #F1F1F1;
}
.object-name {
  max-width: 100%;
  height: 30px;
  line-height: 30px;
}
.object-name:hover {
  cursor: pointer;
  background-color: #F1F1F1;
}
.visible-toggle {
  line-height: 50px;
  font-size: 18px !important;
  cursor: pointer;
}
.layer-color {
  width: 14px;
  height: 14px;
  margin-top: 18px;
  border-radius: 30px;
  background-color: black;
  display: inline-block;
  cursor: pointer;
}
.no-events {
  pointer-events: none;
}
.vue-color__chrome__fields-wrap {
  display: none !important;
}
</style>
