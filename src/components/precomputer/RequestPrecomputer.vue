<template lang="jade">
div.precomputer-container(v-if='visible', transition='fade', transition-mode='out-in')
  div.precomputer.ui-button-raised
    div.row
      div.col-xs-12.text-center
        h1 Ready to go? 
        p Warning: Leave this page open. If you close it before the all the operations are done, you will loose any progress. 
        p #[a(@click='visible=false') Nope. Get me back!]
    div.row.center-xs
      div.col-xs-12
        ui-button(@click='startCalc()') Start
</template>

<script>
import Config         from '../../config'
import StreamStore    from '../store/stream'

import Bus           from '../logic/Events'
// import RequestQueue  from './RequestQueue.vue'

export default {
  components: {
    // RequestQueue
  },
  props:['socket', 'consumers', 'controllers'],
  data () {
    return {
      StreamStore: StreamStore,
      ConfigStore: Config,
      visible: false,
      set: [],
      guids: []
    }
  },
  methods: {
    startCalc( bag ) {
      let self = this
      
      let activeControllers = []
    
      for(let ctrl of this.controllers)
        if( ctrl.enabled ) activeControllers.push( ctrl )
    
      let payload = { }
      payload.streamid = this.StreamStore.streamid
      payload.controllers = activeControllers
      payload.consolidatedStructure = this.StreamStore.consolidatedStructure
      payload.packageName = this.packageName

      this.$http
      .post( window.SPKCONFIG.apiendpoint + '/api/frontend/package', {streamid: self.StreamStore.streamid, package: payload } , { headers:  { 'Authorization' : localStorage.getItem('jwttoken') }, emulateJSON: true })
      .then( (response) => { 
        console.log(response.data)
        console.info('package metadata saved.')
        Bus.$emit('start-precomputation')
      })
    }
  },
  ready() {
    
    Bus.$on('pop-requester', ( data ) => {
      this.packageName = data.packageName
      this.visible = true
      this.set = data.set
      this.guids = data.guids
      console.info('Got ' + this.consumers.length + ' consumers. Will distribute requests amongst them.')
    })

    Bus.$on('start-precomputation', () => {
      console.log('Do something!')
    })
  }
}
</script>

<style>
  .precomputer-container {
    position: fixed;
    top:0;
    left:0;
    width: 100%;
    height: 100%;
    background: rgba(200, 200, 200, 0.7);
    z-index: 50;
  }
  .precomputer{ 
    position: absolute;
    width: calc(100% - 80px);
    height: calc(100vh - 80px);
    margin-left: 40px;
    margin-top: 40px;
    box-sizing: border-box;
    padding:10px;
    background-color: white;

  }
</style>
