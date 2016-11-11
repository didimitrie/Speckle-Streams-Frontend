<template lang="jade">
//- div
  div.toolbar
    span.ui-button-group
      ui-button.stream-name(disabled=true) {{StreamStore.name}}
      ui-icon-button.menu-button(type='flat', color='', icon='all_out', @click='zoomExtents()', tooltip='Zoom Extents (Z)') 
      ui-icon-button.menu-button(type='flat', color='', :icon='!showgrid ? "grid_off" : "grid_on"', @click='toggleGrid()', tooltip='Toggle Grid (G)') 
      ui-icon-button.menu-button.hidden-xs(type='flat', color='', icon='content_cut', tooltip='Section Planes', @click='showSectionPlanes = !showSectionPlanes')
      section-planes(v-show='showSectionPlanes')
      ui-icon-button.menu-button(
        has-popover=true,
        open-dropdown-on='click',
        type='flat', color='', 
        :icon='showlayers ? "close" : "layers"',
        tooltip='Layers')
        div.super-pop(slot='popover')
          div(style='width:350px; max-height:70vh; overflow-y:auto; overflow-x:hidden')
            layers
      ui-icon-button.menu-button(
        has-popover=true, 
        type='flat', 
        :color='!isLiveView ? "accent" : ""', 
        :icon='"history"', 
        tooltip='History')
        div(slot='popover')
          history(:livedroplet='StreamStore.livedroplet', :droplets='StreamStore.droplets')
      ui-button.menu-button(
        v-if='!isLiveView', 
        type='flat',
        color='accent',
        icon='arrow_back',
        @click='backToLiveView()'
        transition='fade', transition-mode='out-in') back to live view
      ui-icon-button.menu-button.hidden-xs(v-if='isOwner', type='flat', color='', icon='publish', tooltip='Detach', @click='showPrecomputer = !showPrecomputer') 
      //- ui-icon-button.menu-button(type='flat', color='warning', icon='share', tooltip='Share/Embed', has-popover=true) 
        div(slot='popover')
          p.small /// TODO. Why don't you just copy paste that link?
      ui-icon-button.menu-button.hidden-xs(type='flat', color='warning', icon='file_download', tooltip='Download STL', @click='downloadFile()') 
      ui-icon-button.menu-button(type='flat', color='accent', icon='fullscreen', tooltip='Go Fullscreen', @click='fullscreen()') 
</template>

<script>

import Bus              from './logic/Events'
import StreamStore      from './store/stream'

export default {
  data () {
    return {
      StreamStore: StreamStore,
    }
  },
  methods: {
    zoomExtents () {
      Bus.$emit('zoom-objects')
    },
    toggleGrid () {
      this.showgrid = !this.showgrid
      Bus.$emit('toggle-grid')
    },
    downloadFile( ) {
      Bus.$emit('download-file', {name: this.StreamStore.name } )
    },
    fullscreen() {
      this.isFullScreen = !this.isFullScreen
      if ((document.fullScreenElement && document.fullScreenElement !== null) ||    
      (!document.mozFullScreen && !document.webkitIsFullScreen)) {
      if (document.documentElement.requestFullScreen) {  
      document.documentElement.requestFullScreen();  
      } else if (document.documentElement.mozRequestFullScreen) {  
      document.documentElement.mozRequestFullScreen();  
      } else if (document.documentElement.webkitRequestFullScreen) {  
      document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);  
      }  
      } else {  
      if (document.cancelFullScreen) {  
      document.cancelFullScreen();  
      } else if (document.mozCancelFullScreen) {  
      document.mozCancelFullScreen();  
      } else if (document.webkitCancelFullScreen) {  
      document.webkitCancelFullScreen();  
      }  
      }  
    }
  }
}
</script>

<style scoped>
.toolbar {
  position: fixed;
  top: 10px;
  left: 0;
  width: 100%;
  float: right;
  text-align: right;
  z-index: 1000;
}
.ui-button-group {
  float: right;
  padding-right: 30px;
  box-sizing: border-box;
}
@media only screen and (max-width : 48em) {
  .stream-name {
    position: fixed;
    left:0;
  }
  .ui-button-group {
    float: none;
    padding-right: 10px;
    box-sizing: border-box;
    justify-content: flex-end;
  }
  .toolbar {
    /*top: auto;*/
    /*bottom: 0px !important;*/
    /*float: left;*/
    justify-content: center;
    text-align: center;
  }
}
</style>
