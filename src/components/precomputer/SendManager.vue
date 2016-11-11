<template lang="jade">
div.send-manager
  div.row.height-100.middle-xs
    div.col-xs-10.col-xs-offset-1
      h2(v-if='payloadIndex < precomputePackage.set.length') Working...
      p(v-if='payloadIndex < precomputePackage.set.length') Don't close this window, or the precomputation process will stop!
      p.small(v-if='payloadIndex < precomputePackage.set.length') In the future we'll manage to offset this to the server, so you can just go away and... receive an email when stuff's done. 
      //- h2(v-if='payloadIndex >= precomputePackage.set.length') Done! #[br]Check your package out: #[a( :href='"http://localhost:8080/#!/package/" + packageId' ) {{precomputePackage.packageName}}]
      h2(v-if='payloadIndex >= precomputePackage.set.length') Done! #[br]Check your package out: #[a( :href='packageHRef' ) {{precomputePackage.packageName}}]
      br
      p Overall Progress: {{ actualIndex }} / {{ precomputePackage.set.length }} | #[strong {{ percentComplete }} % ] | In progress: {{ lostHashes.length }}
      ui-progress-linear(show=true, color='primary', type='determinate', :value='progressValue')
      br
      p(v-for='consumer in consumers') 
        queue-display(:consumer='consumer')
      p.small Did you know that opening up more grasshoppers with the same definition & enabling precomputation will allow for "parallel computing"? 
      ui-alert(v-show='internetError', type='danger') Poopsie. Socket is disconnected: server might be down or your internet connection has failed. Will automatically retry after stuff's in order.
      br
</template>

<script>
import _              from 'underscore'
import MD5            from '../logic/md5'

import Config         from '../../config'
import StreamStore    from '../store/stream'
import Bus            from '../logic/Events'

import QueueDisplay   from './QueueDisplay.vue'

export default {
  props:['socket', 'consumers', 'controllers', 'precomputePackage'],
  components: {
    QueueDisplay
  },
  data () {
    return {
      StreamStore: StreamStore,
      ConfigStore: Config,
      payloadIndex: 0, 
      packageId: null,
      progressValue: 0,
      solveCounts: {},
      lostHashes: [], 
      startTime: null,
      inProgress: false,
      internetError: false
    }
  },
  computed: {
    packageHRef() {
      return window.SPKCONFIG.frontend + '/package/'+ this.packageId
    },
    queueFinished() {
      if(this.lostHashes.length === 0 && this.payloadIndex < this.precomputePackage.set.length) return true
        // something else
      return false;
    },
    actualIndex() {
      return this.payloadIndex
    },
    percentComplete() {
      return ( ( this.payloadIndex ) / this.precomputePackage.set.length * 100).toFixed(2)
    }
  },
  methods: {
    startSending() {
      this.startTime = Date.now()
      this.inProgress = true
      for(let consumer of this.consumers) {
        let payload = this.generatePrecomputePayload( consumer.consumerid )
        this.socket.emit('sender-precompute-request', payload )
      }
    },
    sendToConsumer ( consumerid ) {
      this.socket.emit( 'sender-precompute-request', this.generatePrecomputePayload( consumerid ) )
    },
    generatePrecomputePayload ( consumerid ) {
      let paramkey = ''
      let currentPayload = this.precomputePackage.set[ this.payloadIndex++ ]
      let payload = {
        jobType: 'precompute-request',
        controllers: [],
        performances: this.precomputePackage.perfs,
        hash: '',
        paramkey: '',
        streamid: this.StreamStore.streamid,
        consumerid: consumerid,
        packageid: this.packageId,
        reply_to: this.socket.socket.sessionid
      }
      for(var i = 0; i < currentPayload.length; i++ ) {
        let myctrl = _.findWhere(this.controllers, {guid: this.precomputePackage.guids[i] }) 
        payload.controllers.push( { type: myctrl.type, guid: this.precomputePackage.guids[i], value: parseFloat( currentPayload[i] ) })
        payload.paramkey += myctrl.guid + '@' + currentPayload[i] + ':::'
      }
      // emportant: hash to be held against packageid too yay
      payload.hash = this.packageId + '.' + MD5( payload.paramkey )

      this.lostHashes.push( { hash: payload.hash, payloadIndex: this.payloadIndex - 1} )
      return payload

    },
    savePackageMetadata() {
      let self = this
      let activeControllers = []
      for(let guid of this.precomputePackage.guids) {
        let mycontroller = _.findWhere(this.controllers, {guid: guid})
        activeControllers.push(mycontroller)
      }

      let packageToSave = {
        streamid: this.StreamStore.streamid,
        controllers: activeControllers,
        performances: this.precomputePackage.perfs,
        consolidatedStructure: this.StreamStore.consolidatedStructure,
        packageName: this.precomputePackage.packageName,
        cartesianset: this.precomputePackage.set
      }

      console.log(packageToSave)
      this.$http
      .post( window.SPKCONFIG.apiendpoint + '/api/frontend/package', {streamid: self.StreamStore.streamid, package: packageToSave } , { headers:  { 'Authorization' : localStorage.getItem('jwttoken') }, emulateJSON: true })
        .then( (response) => { 
          console.info('package metadata saved.')
          console.log(response.data)
          this.packageId = response.data.packageid
          // now we can start sending precompute requests
          // 
          this.startSending()
          // 
        })
    }
  },
  ready() {
    this.savePackageMetadata()

    Bus.$on('socket-disconnected', () => {
      this.internetError = true
    })

    Bus.$on('socket-ready', () => {
      this.internetError = false
    })

    this.socket.on('precompute-ack', (data) => { 
      let iii = this.lostHashes.length, found = false
      
      while(iii-- && !found) {
        let lost = this.lostHashes[iii]
        if( lost.hash === data.data.requesthash ) {
          this.lostHashes.splice(iii, 1)
          found = true
        }
      }

      this.progressValue = (this.payloadIndex / this.precomputePackage.set.length) * 100
      
      // let solver = _.findWhere( this.consumers, {consumerid: data.data.consumerid })
      // solver.solvedInstances++
      
      this.$broadcast('increment-solved', data.data.consumerid )

      if(this.payloadIndex < this.precomputePackage.set.length )
        this.sendToConsumer( data.data.consumerid ) // because there's some data in your data, dawg
      else {
        // if lostHash.length > 0
        // this.sendToConsumer( data.data.consumerid ) - should pick up from the losthashes queue if it's still got stuff in it
        if( this.lostHashes.length === 0 ){
          this.inProgress = false
          console.info('Processing ready. Yupii!')
        }
      }
    })
  }
}
</script>

<style>
.send-manager {
  background: white;
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 9999999;
}
</style>
