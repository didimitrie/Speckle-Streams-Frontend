<template lang="jade">
div
  ui-progress-linear.progress-bar(:show='showProgressBar', color='black')
  div(v-if='hasStream')
    #renderer.bg-math( v-bind:class="{ 'move-left-renderer-one' : showlayers, 'move-left-renderer-two': showversions, 'half': false }" )
      renderer
    ui-fab#show-layers(:icon='showlayers ? "close" : "layers"', @click='showlayers=!showlayers', :tooltip='showlayers ? "Close Layers" : "Show Layers"', tooltip-position='top right')
    ui-fab#show-versions(
      :icon='showversions ? "close" : StreamStore.droplets.length<=8 ? "filter_" + (StreamStore.droplets.length+1) : "filter_9_plus"', 
      @click='showversions=!showversions', 
      v-bind:class="{'move-left-button':showlayers}", 
      :tooltip='showversions ? "Back to live view" : "Show History"')
    

    #function-bar.row.middle-xs
      div.col-xs-12
        ui-button(raised=true) {{ StreamStore.name }}
      //- div.col-lg-2
      //-   ui-button(raised=false, type='flat', color='white' style='width:100%', :menu-options='menuF', :has-dropdown-menu='true') {{StreamStore.name}}
      //-   br
      //-   //- span.small Made With #[a(href='http://streams.speckle.xyz') Speckle!]
      //-   br
      //- div.col.function-button
      //-   ui-button(
      //-     icon='all_out', @click='zoomExtents()', 
      //-     tooltip='Zoom Extents', 
      //-     tooltip-position='top left', 
      //-     v-on:keyup.space='zoomExtents()', 
      //-     raised=true)
      //- div.col.function-button
      //-   ui-fab(:icon='!showgrid ? "grid_off" : "grid_on"', @click='toggleGrid()', :tooltip='showgrid ? "Grid On" : "Grid Off" ')
      //- div.col.function-button
      //-   ui-fab(:icon='showSectionPlanes ? "close":"content_cut"', @click='showSectionPlanes = !showSectionPlanes', tooltip='Section Planes')
      //-   section-planes(v-show='showSectionPlanes', transition='fade', transition-mode='out-in')
      //- div.col.function-button 
        div.stream-name {{StreamStore.name}}
    #versions.ui-button-raised(v-show='showversions', transition='fade', transition-mode='out-in', v-bind:class="{'move-left-history':showlayers}")
      history(:livedroplet='StreamStore.livedroplet', :droplets='StreamStore.droplets')
    #layers.ui-button-raised(v-show='showlayers', transition="fade", transition-mode="out-in")
      layers
    stream-controller(:socket='socket')
    stream-precomputer(xxxv-if='ConfigStore.authenticated', :socket='socket')

  div(v-else)
    div.row.middle-xs.center-xs(style='height:100%')
      div.col-xs-8
        h1 Oh dear, 404!
        p Stream #[strong {{$route.params.streamid}}] not found.
  

</template>

<script>
import _                from 'underscore'
import io               from 'socket.io-client'
import Config           from '../../config'
import StreamStore      from '../store/stream'
import Droplets         from '../store/droplets'
import Molecules        from '../store/molecules'

import Bus              from '../logic/Events'

import Renderer         from './Renderer.vue'
import Layers           from './Layers.vue'
import History          from './History.vue'
import SectionPlanes    from './SectionPlanes.vue'

import StreamController  from './StreamController.vue'
import StreamPrecomputer from '../precomputer/StreamPrecomputer.vue'

export default {
  components: {
    Renderer,
    Layers,
    History,
    SectionPlanes,
    StreamController,
    StreamPrecomputer
  },
  data () {
    return {
      menuF: [{id:1, text:'Made with Speckle!'}, { id:2, text: 'lol'}],
      ConfigStore: Config,
      StreamStore: StreamStore,
      DropletStore: Droplets,
      socket: null,
      hasStream: false,
      selectedDroplet: 0,
      showlayers: false,
      showversions: false,
      showgrid: true,
      showSectionPlanes: false,
      showProgressBar: true,
    }
  },
  methods: {
    getStream( cb ) {
      let self = this
      this.$http
      .get( self.ConfigStore.apiendpoint + '/api/frontend/stream', { params: { streamid: self.$route.params.streamid } })
      .then( ( response ) => {
        if(response.data.success) {
          self.StreamStore.setStream( response.data.stream )
          self.hasStream = true
        }
        else self.hasStream = false
      })
    },
    updateStreamStructure() {
      let self = this
      if( !localStorage.getItem('jwttoken') ) 
        return console.error('changes are not saved, you are not logged in.')        
      this.$http
      .post( self.ConfigStore.apiendpoint + '/api/frontend/stream/structure', {streamid: self.StreamStore.streamid, structure: self.StreamStore.consolidatedStructure } , { headers:  { 'Authorization' : localStorage.getItem('jwttoken') }, emulateJSON: true })
      .then( (response) => { 
        if(!response.data.success) console.warn( response.data.message )
        // console.log(response)
      })
    },

    saveScreenshot( image ) {
      let self = this
      if( !localStorage.getItem('jwttoken') ) 
        return console.error('changes are not saved, you are not logged in.')
      this.$http
      .post( self.ConfigStore.apiendpoint + '/api/frontend/stream/screenshot', {streamid: self.StreamStore.streamid, image: image } , { headers:  { 'Authorization' : localStorage.getItem('jwttoken') }, emulateJSON: true })
      .then( (response) => { 
      })
    },
    zoomExtents () {
      Bus.$emit('zoom-objects')
    },
    toggleGrid () {
      this.showgrid = !this.showgrid
      Bus.$emit('toggle-grid')
    }
  },
  watch: {
    showversions() {
      if( this.showversions ) 
        Bus.$emit('close-controllers')
      if( !this.showversions ) {
        Bus.$emit('switch-to-live')
        Bus.$emit('show-controllers')
      }
    }
  },
  ready () {
    let self = this
    this.getStream( this.getDroplets )     
    this.MoleculeStore = Molecules

    Bus.$on('update-stream-structure', (data) => {
      self.updateStreamStructure()
    })

    Bus.$on('save-screenshot', data => {
      self.saveScreenshot( data )
    })
    //Bus.$emit('controllers-active', this.showControllers)
    Bus.$on('close-history', () => {
      this.showversions = false

    })

    Bus.$on('show-progess-bar', data => {      
      this.showProgressBar = true
    })
    Bus.$on('hide-progress-bar', data => {
      this.showProgressBar = false
    })

    // todo: handle live stream updates
    this.socket = io.connect(self.ConfigStore.apiendpoint, {'force new connection':true})
    this.socket.emit('join-stream-viewer', { role: 'frontend', apitoken: self.ConfigStore.profile.apitoken, streamid: self.$route.params.streamid } )

    this.socket.on('join-result-viewer', data =>{
      if(data.sucess) 
        Bus.$emit('socket-ready')
    })

    this.socket.on('viewer-live-update', data => {
      console.info('Live update received now!')
      Bus.$emit('show-progess-bar')
      let newDroplet = self.DropletStore.droplets[0]
      newDroplet.structure = data.data.structure
      newDroplet.date = Date.now()
      self.DropletStore.droplets.$set(0, newDroplet) // push in store reactive styleish 
      
      // structure is consolidated online (...)
      // but we need to consolidate it locally (here) too.
      for(let structure of data.data.structure ) {
        let pleaseExist = _.findWhere(self.StreamStore.consolidatedStructure, { guid: structure.guid} )
        if( !pleaseExist ) {
          let newStructure = {
            name: structure.name,
            guid: structure.guid
          }
          self.StreamStore.consolidatedStructure.push(newStructure)
        } 
      }
      // put all the objects in the molecule storage. the renderer will look there aynway
      // to check before asking for them online!
      if(data.data.objects)
        for( let myMolecule of data.data.objects ) {
          let found = _.findWhere( self.MoleculeStore.molecules , { hash: myMolecule.hash })
          if(!found) self.MoleculeStore.molecules.push( myMolecule )
        }
      console.log(data)
      Bus.$emit('set-controllers', data.data.controllers )
      Bus.$emit('live-droplet-change', newDroplet ) // tell the layers to update. triggers renderer update too.
    })

    this.socket.on('update-structure', data => {
      console.info('TODO: Live Structure update received now. ')
      Bus.$emit('update-layer-names', data)
    })

    this.socket.on('new-droplet-saved', data=> {
      console.info('TODO: New droplet was saved. ')
      console.log(data)
      this.StreamStore.droplets.push({date: Date.now(), droplet: data.id, name: data.name})
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
  },

  beforeDestroy() {
    this.socket.disconnect()
  }
}
</script>

<style>
.stream-name {
  line-height: 57px;
}
.logo-viewer{
  position: fixed;
  top: 20px;
  left: 20px;
  width: 56px;
  height: 56px;
  background-color: white;
}
.logo-viewer-rotate{
  transition: all .3s ease;
}
.logo-viewer-rotate:hover {
  transform: scale(0.5) rotate(180deg);
  cursor: pointer;
}
#show-layers{
  position: fixed;
  top: 20px;
  right: 20px;
  transition: all .3s ease;
}
#show-versions{
  position: fixed;
  top: 20px;
  right: 90px;
  transition: all .3s ease;
}

#function-bar {
  position: fixed;
  top: 27px;
  left: 20px;
  width: 100%;
  z-index: 3;
}

#function-bar button{
  text-align: left !important;
}
#function-bar .ui-icon{
font-size: 20px !important;
}

.function-button{
  margin-left: 7px;
}

.move-left-button {
  right:295px !important;
}
.move-left-history {
  right: 275px !important;
}

.move-left-renderer-one, .move-left-renderer-two {
  right: 150px !important;
}

.move-left-renderer-one.move-left-renderer-two {
  right: 300px !important;
}

.stream-name{
}
#renderer {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  right: 0;
  transition: all .1s ease;
}

#layers{
  position: fixed;
  right:0;
  top:0;
  height: 100%;
  width: 275px;
  background-color: white;
  transition: all .3s ease;
  z-index: 9;
  box-sizing: border-box;
  padding: 0px 10px;
  overflow-y: auto;
}
#versions {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 300px;
  background-color: white;
  overflow-y: auto;
  box-sizing: border-box;
  /*padding: 0px 10px;*/
}

#layers h2, #versions h2 {
  margin: 27px 0 0.5em;
}
.progress-bar {
  position: fixed;
  height: 100vh;
  top: 0;
  left: 3px;
  height: 3px;
  width: 100vh;
  transform-origin: top left;
  transform: rotate(90deg);
  z-index: 9999;
}
</style>
