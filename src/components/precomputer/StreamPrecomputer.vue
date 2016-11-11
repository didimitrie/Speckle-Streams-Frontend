<template lang="jade">
div
  div.total-instances-display.ui-fab(v-show='totalInstances > 0', transition='fade', transition-mode='out-in', v-el:bubble){{ totalInstances }}
  div.stream-computer
    div.row
      div.col-xs-10.col-xs-offset-1(v-show='showIntroduction')
        div.row.middle-xs(style='height:100%;')
          div.col-xs-10.col-xs-offset-1
            h1.text-centerxx Stream Packager #[span(style='float: right') #[ui-button(type='flat', color='danger', @click='closeMe()') Close]]
            h3 Before you get started...
            p The stream packager allows you to "detach" an interactive view of your model from the grasshopper definition, so user can play with the parameters without the need for a live grasshopper backend. To do this, you need to define the desing space and, optionally, the performance space. Design space stands for the parameters controlling your design - widht, height, etc., whereas the performance space consists of criteria you want your design evaluated by - cost, floor-to-area ratio, sustainability, etc.
            h3(v-show='controllers.length == 0', transition='fade', transition-mode='out-in') In order to package a stream, at least one grasshopper defintion needs to be "alive" & have precomputation enabled.  
            h3(v-show='controllers.length > 0', transition='fade', transition-mode='out-in') You're ready to go. 
            ui-button(v-show='controllers.length == 0' color='', :raised='true', type='flat', icon='refresh', @click='checkConnections()', transition='fade', transition-mode='out-in') Check for defintions
            ui-button(v-show='controllers.length > 0 ', color='', :raised='true', type='flat', icon='arrow_right', @click='onwardsToMatrix()') Next
      div.col-xs-10.col-xs-offset-1(v-show='showMatrix')
        spk-param-matrix(v-if='noProblem && controllers.length > 0', :controllers='controllers', v-ref:matrix)
      div.col-xs-12
        div.row.middle-xs.xxxready-set-go.xxxui-button-raised(v-show='showMatrix', style='min-height: 40%;')
          div.col-xs-10.col-xs-offset-1
            h2 Ready, set, go...
            p Solution Space size: #[strong {{ totalInstances }}]
            ui-textbox(:value.sync='packageName', name='package name', label='Package Name')
            ui-button(color='accent', :disabled='totalInstances<=1' @click='generateSet()', style='margin-bottom:100px;') Let's go!
      div.col-xs-10.col-xs-offset-1
        send-manager(v-if='showSendManager', :socket='socket', :consumers='onlineSenders', :controllers='controllers', :precompute-package='precomputePackage', v-ref:sendmanager)
  //- request-precomp(:socket='socket', :consumers='onlineSenders', :controllers='controllers')
</template>

<script>

import _              from 'underscore'

import SpkParamMatrix from './SpkParamMatrix.vue'
import RequestPrecomp from './RequestPrecomputer.vue'
import SendManager    from './SendManager.vue'

import Config         from '../../config'
import StreamStore    from '../store/stream'
import Droplets       from '../store/droplets'
import Molecules      from '../store/molecules'

import Bus            from '../logic/Events'
import MD5            from '../logic/md5'

export default {
  components: {
    SpkParamMatrix,
    SendManager
  },
  props: ['socket'],
  data () {
    return {
      showComputer: false,
      Config: Config,
      StreamStore: StreamStore,
      DropletStore: Droplets,
      onlineSenders: [],
      controllers: [],
      noProblem: true, 
      totalInstances: 0, 
      packageName: 'Little Big Box', 
      precomputePackage: null,
      showIntroduction: true,
      showMatrix: false,
      showSendManager: false
    }
  },
  methods: {
    mapNumber( num, in_min, in_max, out_min, out_max) {
      return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min
    },

    checkConnections() {
      let self = this
      self.socket.emit('sender-ping-consumers')
      self.onlineSenders = []
    },
    // TODO
    consolidateControllers() {
      let self = this
      let consumer1 = this.onlineSenders[0]
      this.controllers = []
      for(let controller of consumer1.controllers ) {
        controller.enabled = false
        controller.divisions = 3 
        this.controllers.push( controller )
      }
      if( this.onlineSenders.length == 1) return this.noProblem = true
      for(let i = 1; i < this.onlineSenders.length; i++ ) {
        let consumer = this.onlineSenders[i]
        if( this.controllers.length !== consumer.controllers.length ) 
        { 
            console.log('not same length')
            return this.noProblem = false
        }
        for( let controller of consumer.controllers ) {
          let test = _.findWhere( this.controllers, { guid: controller.guid } )  
          if(!test) {
            console.log('one controller is off')
            return this.noProblem = false
          } 
        }
      }
      this.noProblem = true
    },

    generateSet() {
      let payload = this.$refs.matrix.generateSet()
      payload.packageName = this.packageName
      this.precomputePackage = payload
      
      this.showSendManager = true
      this.showMatrix = false
      this.showIntroduction = false
      console.log(payload)
    },
    onwardsToMatrix() {
      this.showIntroduction = false
      this.showMatrix = true
      this.showSendManager = false
    },
    closeMe() {
      this.$parent.showPrecomputer = false
    }
  },
  events: {
    'total-instances'( num ) {
      this.totalInstances = num
      let radius = this.mapNumber( num, 0, 10000, 56, 122 ) > 122 ? 122 : this.mapNumber( num, 0, 10000, 56, 122 )
      this.$els.bubble.style.width = radius
      this.$els.bubble.style.height = radius
      if( num < 2500 ) this.$els.bubble.style.background = "#4caf50"
      if( num > 2500 ) this.$els.bubble.style.background = "#FF8000"
      if( num > 5000 ) this.$els.bubble.style.background = "#FF0000"
    }
  },
  ready() {
    let self = this
    // this.checkConnections() 

    this.socket.on('SERVE_consumer-pingback', data => {
      if( !data.canPrecompute ) {
        console.log('Definition online, but precomputation is disabled.')
        alert("Definition online, but precomputation is disabled. Right click the sender component and enable precomputation.")
        return
      }
      let test = _.findWhere( this.onlineSenders, { consumerid: data.consumerid } )
      if(!test) {
        data.solvedInstances = 0
        self.onlineSenders.push( data )
      }
      self.consolidateControllers()
      if( this.showSendManager ) {
          console.log('making him senndd!!!!')
          self.$refs.sendmanager.sendToConsumer( data.consumerid )
        } 
    })

    this.socket.on('ANNOUNCE_consumer-online', data => {
      console.info('new consumer avialble. ' + data.consumerid )
      if( !data.canPrecompute ) return console.info('he can not preocompute')
      let test = _.findWhere( this.onlineSenders, { consumerid: data.consumerid } )
      if(!test) {
        data.solvedInstances = 0
        self.onlineSenders.push( data )
        if( this.showSendManager ) {
          console.log('making him senndd!!!!')
          self.$refs.sendmanager.sendToConsumer( data.consumerid )
        }
      }
    })

    this.socket.on('disconnect', () => {
      console.log('stream precomputer => reseting online senders')
      this.onlineSenders = []
    })

    Bus.$on('socket-ready', data => {
      if( self.$refs.sendmanager.payloadIndex < self.$refs.sendmanager.precomputePackage.set.length && self.$refs.sendmanager.inProgress ) {
        console.log('need to resume sending.')
        // step back in the queue
        self.$refs.sendmanager.payloadIndex -= self.$refs.sendmanager.lostHashes.length
        self.$refs.sendmanager.lostHashes = [] // misleading count in sendmanager otherwise
        // this.startSending() - will happen automatically, consumers should reconnect and announce themselves automatically
        this.onlineSenders = []
        this.checkConnections()
      }
    }) 

    this.socket.on('ANNOUNCE_consumer_offline', data => {
      // TODO
      console.info('consumer went offline... ')
    })
  }
}
</script>

<style>
  .stream-computer{
    position: fixed;
    top:0;
    right: 0;
    width: 100%;
    height: 100%;
    background: white;
    box-sizing: border-box;
    padding-top: 10px;
    padding-right: 20px;
    padding-left: 10px;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 5040;
  }
  .total-instances-display {
    position: fixed;
    top: 47%;
    right: 30px;
    height: 56px;
    width: 56px;
    line-height: 56px;
    border-radius: 144px;
    box-sizing: border-box;
    z-index: 151;
    background: #4caf50;
    color: white;
    padding-left: 10px;
    padding-right: 10px;
    font-size: 12px;
    font-weight: 700;
    transition: all .3s ease;
  }  
  .show-precomputer {
    position: fixed;
    bottom: 20px;
    right:20px;
    z-index: 42;
  }

  .ready-set-go input {
    color: white !important;
  }
</style>
