<template lang="jade">
div
  ui-progress-linear.progress-vertical(:show='showLoader', color='accent')
  div.title-stream.ui-button-group
    p.small.prev-param-name.visible-xs(v-show='showControllers') {{controllers[currentSlider-1].nickname ? controllers[currentSlider-1].nickname : controllers[currentSlider-1].name}}
    ui-icon-button.p-prev.visible-xs(icon='arrow_left' @click='currentSlider--', v-show='showControllers', raised='true', :disabled='prevEnabled')
    div.param-btn.ui-fab(
      @click='showControllers=!showControllers')
      div.bg-slider(v-show='!showControllers')
      ui-icon(icon='close', v-show='showControllers')
    ui-icon-button.p-next.next.visible-xs(icon='arrow_right' @click='currentSlider++', v-show='showControllers', :disabled='nextEnabled')
    p.small.next-param-name.visible-xs(v-show='showControllers') {{controllers[currentSlider+1].nickname ? controllers[currentSlider+1].nickname : controllers[currentSlider+1].name}}
  div.stream-controller(v-el:controllers) 
    div.row.myControllers.middle-xs-xs(v-el:actualControllers, v-show='showControllers', transition='fade', transition-mode='out-in')
      div.col-xs-12(style='margin-right:-30px;')
        div.row.middle-xs.center-xs.controller-barxx
          div.col-xs-11.col-xs-offset-1(v-show='controllers.length===0')
            ui-button(icon='refresh') Stream is not live, check again?
        div.row.middle-xs.controller-bar(v-for='controller in controllers' track-by="$index", v-bind:class='{"go-away": !showControllers}')
          div.col-xs-11.col-xs-offset-1(v-if='isControllable(controller.type) && currentIndex($index)')
            spk-ui-slider(v-if='controller.type=="slider"', :param.sync='controller')
            spk-ui-toggle(v-if='controller.type=="toggle"', :param.sync='controller')

</template>

<script>

import _              from 'underscore'

import SpkUiSlider    from './SpkUiSlider.vue'
import SpkUiToggle    from './SpkUiToggle.vue'

import Config         from '../../config'
import StreamStore    from '../store/stream'
import Droplets       from '../store/droplets'
import Molecules      from '../store/molecules'

import Bus            from '../logic/Events'
import MD5            from '../logic/md5'

export default {
  components: {
    SpkUiSlider,
    SpkUiToggle
  },
  props:['socket'],
  data () {
    return {
      Config: Config,
      StreamStore: StreamStore,
      DropletStore: Droplets,
      isAlive: false,
      showControllers: true,
      showMobileControllers: false,
      controllers: [],
      sendRequestDebounced: _.debounce( this.sendRequest, 250 ),
      onlineSenders: [],
      showLoader: false,
      disableNextRequest: false,
      windowWidth: 0,
      currentSlider: 0
    }
  },
  computed: {
    prevEnabled() {
      if(this.currentSlider == 0) return true
      return false
    },
    nextEnabled() {
      if(this.currentSlider+1 < this.controllers.length) return false
      return true
    }
  },
  watch: {
    showControllers() {
      // if(this.showControllers)
      //   this.checkConnection()
    }
  },
  methods: {
    isControllable( type ) {
      return type==='slider' || type === 'toggle';
    },
    currentIndex( index ) {
      if(this.windowWidth > 768) return true
      if(this.currentSlider === index ) return true
      return false
    },
    sendRequest() {
      if(this.disableNextRequest) return this.disableNextRequest = false
      this.showLoader = true
      let paramkey = ''
      for( let ctrl of this.controllers ) {
        paramkey += ctrl.guid + '@' + ctrl.value + ':::'
      }
      hash = MD5( paramkey )

      let payload = {
        controllers: this.controllers,
        hash: hash,
        paramkey: paramkey,
        streamid: this.StreamStore.streamid,
        ghsenderid: this.onlineSenders[0].consumerid,
        reply_to: this.socket.socket.sessionid
      }
      console.info('compute-request for hash: ' + hash + ' ('+ paramkey + ')')
      console.log( payload )
      this.showLoader = true
      this.socket.emit('serve-compute-request', payload)
    },
    checkConnection() {
      this.socket.emit('sender-ping-consumers')
    }
  },
  filters: {
    limit(arr, limit) {
      return arr.slice(0, Number(limit))
    }
  },
  ready() {
    let self = this
    this.MoleculeStore = Molecules
    this.windowWidth = window.innerWidth

    Bus.$on('socket-ready', () => {
      this.checkConnection()
    })
    Bus.$on('close-controllers', () => {
      this.showControllers = false
    })
    Bus.$on('show-controllers', () => {
      this.showControllers = true
    })

    this.socket.on('SERVE_consumer-pingback', data => {
      console.info('got controllers from someone.')
      // console.log(data)
      self.isAlive = true
      self.controllers = data.controllers
      self.onlineSenders.push(data)
      if( window.innerHeight < 768 ) this.showControllers = false
    })

    this.socket.on('compute-request-result', data => {
      console.info('compute request received.')
      // console.log(data) // same same same as ? 
      // consolidate structure
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
      this.showLoader = false;
      Bus.$emit('droplet-change', data.data )
    })
    
    this.socket.on('ANNOUNCE_consumer-online', data => { 
      if( !data.canCompute ) return console.info('he could not compute')
      self.isAlive = true
      self.controllers = data.controllers
      self.onlineSenders.push(data)
    })
    
    Bus.$on('controller-updated', () => {
      self.sendRequestDebounced()
    })

    Bus.$on('set-controllers', data => {
      self.controllers = data
      self.disableNextRequest = true
    })
  }
}
</script>

<style scoped>
.controller-bar {
  cursor: pointer;
}
.title-stream{ 
  position: fixed;
  z-index: 2042;
}
.progress-vertical {
  position: fixed;
  height: 100vh;
  top: 0;
  left: 3px;
  height: 3px;
  width: 100vh;
  transform-origin: top left;
  transform: rotate(90deg);
}

.pill {
  padding: 5px 10px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  color: white;
  background: #333333;
  border-radius: 200px;
  user-select:none;
  cursor: pointer;
  pointer-events: all;
  transition: all .3s ease;
}
.pill:hover{
  background-color: #8000FF;
}
.pill .ui-icon{
  font-size: 14px;
}

.param-btn {
  position: fixed;
  top: 20px;
  left: 30px;
  width: 50px !important;
  height: 50px !important;
  background-color: white;
}

.param-btn .ui-icon{
  color: #0080FF !important;
}

.stream-controller {
  position: fixed;
  bottom: 0;
  left: -20px;
  width:355px;
  height: 100%;
  z-index: 1;
  box-sizing: border-box;
  padding-top: 10px;
  padding-right: 20px;
  padding-left: 10px;
  pointer-events: none;
  overflow: hidden;
  z-index: 2040;
}

.myControllers {
  position: absolute;
  width: 105%;
  right: -5%;
  padding-top: 10px;
  padding-bottom: 10px;
  overflow-y: scroll;
  overflow-x: hidden;
  pointer-events: all;
  height: 80%;
  top: 10%;
}

.upwards {
  position: absolute;
  top: 120px;
  left: 30px;
  width: 100vw;
}

@media only screen and (max-width : 48em) {
  .prev-param-name {
    position: fixed;
    left: 0;
    bottom: 0px;
    max-width: 30%;
    box-sizing: border-box;
    padding: 10px;
    color: blue;
    text-transform: uppercase;
    font-size: 10px;
    overflow: hidden;
  }
  .next-param-name {
    position: fixed;
    right: 0;
    bottom: 0px;
    max-width: 30%;
    box-sizing: border-box;
    padding: 10px;
    color: blue;
    text-transform: uppercase;
    font-size: 10px;
    overflow: hidden;
  }
  .p-prev, .p-next {
    margin-right: 10px;
    margin-left: 10px;
  }
  .stream-controller { 
    bottom: 0;
    left: 0;
    width: 100%;
    height: 200px;
  }
  .myControllers {
    bottom: 0;
    left: 0;
    width: 100%;
    height: 200px;
    padding-top: 0;
    padding-bottom: 0;
    pointer-events: none;
    overflow: hidden;
  }
  .title-stream {
    position: fixed;
    top: none;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50px;
    justify-content: center;
    /*align-items: center;*/
  }
  .middle-xs-xs {
    align-items: center;
  }
  .param-btn {
    /*transform: scale(1.2);*/
    position: relative;
    top: 0; left: 0;
  }
}

</style>
