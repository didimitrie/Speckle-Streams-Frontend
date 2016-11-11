<template lang="jade">
div(style='max-height:100vh')
  //- h1 Hai {{$route.params.packageid}}
  renderer
  controllers(v-if='dataLoaded', 
    :params='Package.controllers', 
    :performances='Package.performances',
    :packageid='Package.packageid',
    :ppkeys='Package.ParamPerformanceKeys',
    :firstkey='firstKey',
    :name='Package.name'
    v-ref:controllers, transition='fade', transition-mode='out-in')
  div.toolbar
    span.ui-button-group
      ui-button.stream-name(disabled=true, icon='attachment') {{Package.name}}
      ui-icon-button.menu-button(type='flat', color='', icon='all_out', @click='zoomExtents()', tooltip='Zoom Extents (Z)') 
      ui-icon-button.menu-button.hidden-xs(type='flat', color='', :icon='!showgrid ? "grid_off" : "grid_on"', @click='toggleGrid()', tooltip='Toggle Grid (G)') 
      ui-icon-button.menu-button.hidden-xs(type='flat', color='', icon='content_cut', tooltip='Section Planes', @click='showSectionPlanes = !showSectionPlanes')
      section-planes(v-show='showSectionPlanes')
      ui-icon-button.menu-button.hidden-xs(
        has-popover=true,
        open-dropdown-on='click',
        type='flat', color='', 
        :icon='showlayers ? "close" : "layers"',
        tooltip='Layers')
        div(slot='popover')
          div(style='width:350px; max-height:70vh; overflow-y:auto; overflow-x:hidden')
            layers
      //- ui-icon-button.menu-button(type='flat', color='warning', icon='share', tooltip='Share/Embed', has-popover=true) 
      //-   div(slot='popover')
      //-     p.small 
      ui-icon-button.menu-button.hidden-xs(type='flat', color='warning', icon='file_download', tooltip='Download STL', @click='downloadFile()') 
      ui-icon-button.menu-button(type='flat', color='accent', icon='fullscreen', tooltip='Go Fullscreen', @click='fullscreen()') 

</template>

<script>
// import PackageStore from './packagestore'
import Config           from '../../config'
import StreamStore      from '../store/stream'
import Bus              from '../logic/Events'

import Controllers      from './Controllers.vue'
import Renderer         from '../viewer/Renderer.vue'
import Layers           from '../viewer/Layers.vue'
import SectionPlanes    from '../viewer/SectionPlanes.vue'

export default {
  components: {
    SectionPlanes,
    Renderer,
    Controllers,
    Layers
  },
  data () {
    return {
      ConfigStore: Config,
      StreamStore: StreamStore,
      Package: {
        name: '',
        controllers: null,
        performances: null,
      },
      showgrid: true,
      showSectionPlanes: false,
      pShortId: '',
      dataLoaded: false,
      firstKey: '',
      isEmbedded: false
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
      Bus.$emit('download-file', {name: this.Package.name } )
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

  },
  ready() {
    let self = this
    let routeSplit = self.$route.params.packageid.split('+')
    this.pShortId = routeSplit[0]
    this.firstKey = routeSplit[1]
    
    if( window != window.top ) this.isEmbedded = true

    if(routeSplit[1])  { 
      console.log( this.pShortId + ' got requests params like ' + routeSplit[1])
    }

    this.$http
    .get( window.SPKCONFIG.apiendpoint + '/api/frontend/package', { params: { packid: this.pShortId } } )
    .then( (response) => {
      this.Package = response.data.package;
      console.log(response.data)
      for(let perf of this.Package.performances) perf.currentValue = 'n/a'
      if( routeSplit[1] ) {
        routeSplit[1] = atob(routeSplit[1]) // back from base64
        let splits = routeSplit[1].split(',')
        for( let i = 0; i < splits.length; i++ ) {
          this.Package.controllers[i].value = ( splits[i] )
        }
        console.log('setted initial values to ' + splits)
      } else {
        console.log('no intial values, reverting to default')
        for(let param of this.Package.controllers) 
          param.value = param.values[0]
      }
        
      this.StreamStore.setStream( response.data.package )

      this.dataLoaded = true
    })
    // keyboard shortcuts FTW
    document.addEventListener('keydown', (e) => {
      console.log(e.keyCode)
      switch(e.keyCode) {
        case 90:
          self.zoomExtents()
          break
        case 71:
          self.toggleGrid()
          break
        case 83:
          self.showSectionPlanes = !self.showSectionPlanes
          break
      }
    }, false)
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
  text-align: right
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
}

</style>
