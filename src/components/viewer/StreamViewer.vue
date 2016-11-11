<template lang="jade">
div
  ui-progress-linear.progress-bar(:show='showProgressBar', color='black')
  div(v-if='hasStream')
    #renderer.bg-math
      renderer

    div.toolbar
      span.ui-button-group
        ui-button.stream-name(disabled=true) {{StreamStore.name}}
        ui-icon-button.menu-button(type='flat', color='', icon='all_out', @click='zoomExtents()', tooltip='Zoom Extents (Z)') 
        ui-icon-button.menu-button(type='flat', color='', :icon='!showgrid ? "grid_off" : "grid_on"', @click='toggleGrid()', tooltip='Toggle Grid (G)') 
        ui-icon-button.menu-button.hidden-xs(type='flat', color='', icon='content_cut', tooltip='Section Planes', @click='showSectionPlanes = !showSectionPlanes')
        section-planes(v-show='showSectionPlanes')
        ui-icon-button.menu-button.hidden-xs(
          has-popover=true,
          open-dropdown-on='click',
          type='flat', color='', 
          :icon='showlayers ? "close" : "layers"',
          tooltip='Layers')
          div.super-pop(slot='popover')
            div(style='width:350px; max-height:70vh; overflow-y:auto; overflow-x:hidden')
              layers
        ui-icon-button.menu-button.hidden-xs(
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
        ui-icon-button.menu-button(type='flat', color='warning', icon='file_download', tooltip='Download STL', @click='downloadFile()') 
        ui-icon-button.menu-button(type='flat', color='accent', icon='fullscreen', tooltip='Go Fullscreen', @click='fullscreen()') 
        
    stream-controller(:socket='socket', v-show='isLiveView', transition='fade', transition-mode='out-in')
    stream-precomputer(v-if='showPrecomputer', :socket='socket', transition='fade', transition-mode='out-in')

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
import Toolbar          from '../Toolbar.vue'
import StreamController  from './StreamController.vue'
import StreamPrecomputer from '../precomputer/StreamPrecomputer.vue'

export default {
  components: {
    Renderer,
    Layers,
    History,
    SectionPlanes,
    StreamController,
    StreamPrecomputer,
    Toolbar
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
      showPrecomputer: false,
      showProgressBar: true,
      isLiveView: true,
      isFullScreen: false,
      isOwner: false
    }
  },
  methods: {
    checkLogin() {
      let self = this
      this.$http
      .get( window.SPKCONFIG.apiendpoint +'/api/frontend/ownercheck', { headers:  { 'Authorization' : localStorage.getItem('jwttoken') }, params: { streamid: self.$route.params.streamid } } )
      .then( ( response ) => {
        if( response.data.success ) {
          self.isOwner = true
        }
      }, (err) => {
        
      })
    },
    getStream( cb ) {
      let self = this
      this.$http
      .get( window.SPKCONFIG.apiendpoint + '/api/frontend/stream', { params: { streamid: self.$route.params.streamid } })
      .then( ( response ) => {
        if(response.data.success) {
          self.StreamStore.setStream( response.data.stream )
          self.hasStream = true
          if( cb ) cb( response.data.stream )
        }
        else self.hasStream = false
      })
    },
    getDroplet( id, callback) {
      let self = this
      // test store for droplet
      let droplet = _.findWhere( self.DropletStore.droplets, { _id: id } )
      if( droplet ) return callback( droplet )

      // otherwise request it from server
      this.$http
      .get( window.SPKCONFIG.apiendpoint + '/api/frontend/droplet', { params: { dropletid: id } } )
      .then( (response) => {
        self.DropletStore.droplets.push( response.data.droplet )
        if(callback) callback( response.data.droplet ) 
      })
    },
    backToLiveView() {
      this.getDroplet( this.StreamStore.livedroplet, ( droplet ) => {
        console.log('got droplet')
        Bus.$emit( 'droplet-change', droplet )
        this.isLiveView = true
      })
    },
    updateStreamStructure() {
      let self = this
      if( !localStorage.getItem('jwttoken') ) 
        return console.error('changes are not saved, you are not logged in.')        
      this.$http
      .post( window.SPKCONFIG.apiendpoint + '/api/frontend/stream/structure', {streamid: self.StreamStore.streamid, structure: self.StreamStore.consolidatedStructure } , { headers:  { 'Authorization' : localStorage.getItem('jwttoken') }, emulateJSON: true })
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
      .post( window.SPKCONFIG.apiendpoint + '/api/frontend/stream/screenshot', {streamid: self.StreamStore.streamid, image: image } , { headers:  { 'Authorization' : localStorage.getItem('jwttoken') }, emulateJSON: true })
      .then( (response) => { 
      })
    },
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
  },
  watch: {
    // L-o-l
  },
  ready () {
    let self = this
    this.checkLogin()
    // init 
    this.getStream( (stream) => {
      console.log('got stream')
      this.getDroplet( stream.livedroplet, ( droplet ) => {
        console.log('got droplet')
        Bus.$emit( 'droplet-change', droplet )
      })
    })     
    this.MoleculeStore = Molecules
    
    // bus stuffs
    Bus.$on('history-select-droplet', ( dropletid ) => {
      this.showProgressBar = true
      this.getDroplet(dropletid, ( droplet) => {
        Bus.$emit('droplet-change', droplet )
        this.showProgressBar = false
        this.isLiveView = false
      })
    })

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
    this.socket = io.connect( window.SPKCONFIG.apiendpoint, {'force new connection':true} )
    
    this.socket.on('disconnect', data => {
      console.log('DISCONNECTED')
      console.log(data)
      console.log('omg, what to do....?')
      Bus.$emit('socket-disconnected')
    })

    this.socket.on('connect', data => {
      console.log('CONNECTED AGAIN')
      console.log(data)
      console.log('oh wow let us play')

      this.socket.emit('join-stream-viewer', { role: 'frontend', apitoken: self.ConfigStore.profile.apitoken, streamid: self.$route.params.streamid } )
    })

    this.socket.on('join-result-viewer', data =>{
      if(data.sucess) 
        Bus.$emit('socket-ready')
    })


    this.socket.on('viewer-live-update', data => {
      
      console.info('Live update received now!')
      
      if(this.showPrecomputer ) return console.log("OOOOOOK, hold your horses")
      
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

      
      Bus.$emit('set-controllers', data.data.controllers )
      // Bus.$emit('live-droplet-change', newDroplet ) // tell the layers to update. triggers renderer update too.
      if(this.isLiveView)
        Bus.$emit('droplet-change', data.data)
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

    this.socket.on('update-name', (name) => {
      this.StreamStore.name = name
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

<style scoped>
@media only screen and (max-width : 48em) { 
  .drop-element {
    position: fixed !important;
    left:0 !important;
    bottom: 20px !important;
    width: 100% !important;
    height: 50% !important;
  }
}
.menu-button {
  position: relative;
  top: 0;
  float: right;
}
.pill {
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  background: #191919;
  border-radius: 200px;
  user-select:none;
  margin-left:30px;
}
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
.stream-name {
    color: black;
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
.streamname {
  line-height: 40px;
  margin-left: 35px;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 700;
}
img{
  width: 40px;
  height: 40px;
}
#renderer {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  right: 0;
  transition: all .1s ease;
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
