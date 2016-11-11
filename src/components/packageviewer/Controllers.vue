<template lang="jade">
div
  ui-progress-linear.progress-vertical(:show='showLoader', color='accent')
  div.title-stream.ui-button-group
    p.small.prev-param-name.visible-xs(v-show='showControllers') {{params[currentSlider-1].nickname ? params[currentSlider-1].nickname : params[currentSlider-1].name}}
    ui-icon-button.p-prev.visible-xs(icon='arrow_left' @click='currentSlider--', v-show='showControllers', raised='true', :disabled='prevEnabled')
    div.param-btn.ui-fab(
      @click='showControllers=!showControllers')
      div.bg-slider(v-show='!showControllers')
      ui-icon(icon='close', v-show='showControllers')
    ui-icon-button.p-next.next.visible-xs(icon='arrow_right' @click='currentSlider++', v-show='showControllers', :disabled='nextEnabled')
    p.small.next-param-name.visible-xs(v-show='showControllers') {{params[currentSlider+1].nickname ? params[currentSlider+1].nickname : params[currentSlider+1].name}}
  div.stream-controller(v-el:controllers) 
    div.row.myControllers.middle-xs-xs(v-el:actualControllers, v-show='showControllers', transition='fade', transition-mode='out-in')
      div.col-xs-12(style='margin-right:-30px;')          
        div.row.middle-xs.controller-bar(v-for='controller in params' track-by="$index", v-bind:class='{"go-away": !showControllers}')
          div.col-xs-11.col-xs-offset-1(v-if='currentIndex($index)')
            fancy-controller(:param='controller', style='pointer-events:all')
        div.row.middle-xs.controller-bar(v-for='perf in performances' track-by="$index", v-bind:class='{"go-away": !showControllers}')
          div.col-xs-11.col-xs-offset-1
            fancy-performance(:perf='perf', :value='perf.currentValue')

            //- spk-ui-slider(v-if='controller.type=="slider"', :param.sync='controller')
            //- spk-ui-toggle(v-if='controller.type=="toggle"', :param.sync='controller')
  //- div.col-xs-10.col-xs-offset-1.myControllers(v-el:actualControllers)
    div.row.middle-xs
      div.col-xs-12
        span.pill.ui-button-raised(style='margin-left:-5px;', @click='showControllers = !showControllers') #[ui-icon(:icon='showControllers ? "remove_circle" : "add_circle"')] {{ name }}
        br
        br
      div.col-xs-12(v-show='showControllers', style='pointer-events: all', transition="fade", transition-mode="out-in")
        fancy-controller(v-for='param in params', :param='param')
        br
        fancy-performance(v-for='perf in performances', :perf='perf', :value='perf.currentValue')
</template>

<script>
import _                from 'underscore'
import MD5              from '../logic/md5'
import Config           from '../../config'
import Bus              from '../logic/Events'

import DiscreteSlider   from './DiscreteSlider.vue'
import FancyController  from './FancyController.vue'
import FancyPerformance from './FancyPerformance.vue'

export default {
  props: ['params', 'performances' ,'packageid', 'ppkeys', 'firstkey', 'plugins', 'name'], 
  components: {
    DiscreteSlider,
    FancyController,
    FancyPerformance
  },
  data () {
    return {
      ConfigStore: Config,
      firstRun: true,
      selectedItem: null,
      showgrid: false,
      getDropletDebounced: _.debounce( this.getDropletByHash, 500 ),
      valueSelectedDebounced: _.debounce( this.valueSelected, 250 ),
      lasthash: null,
      showControllers: true,
      showLoader: false,
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
      if(this.currentSlider+1 < this.params.length) return false
      return true
    }
  },
  methods: {
    downloadFile( ) {
      Bus.$emit('download-file', {name: this.$parent.Package.name} )
    },
    currentIndex( index ) {
      if(this.windowWidth > 768) return true
      if(this.currentSlider === index ) return true
      return false
    },
    positionsPlease() {
      let height = window.innerHeight
      let cheight = this.$els.actualcontrollers.clientHeight
      if( cheight < height ) 
        this.$els.controllers.className += ' row middle-xs'
      else 
        this.$els.controllers.className = ' stream-controller'
    },

    setIntialDroplet( paramkeys ) {
      this.showLoader = true
      let paramkey = ''
      if( paramkeys ) {
        paramkeys = atob(paramkeys)
        let splitkeys = paramkeys.split(',')
        for( let i = 0; i < splitkeys.length; i++ ) {
          paramkey += this.params[i].guid + '@' + parseFloat( splitkeys[i] ) + ':::'
          this.params[i].value = parseFloat( splitkeys[i] )
          // Bus.$emit('set-value-silent', {guid:  this.params[i].guid, value: splitkeys[i] })
        }
      } else {
        for(param of this.params) {
          param.value = parseFloat( param.values[0] )
          paramkey += param.guid + '@' + parseFloat( param.values[0] ) + ':::'
        }
      }
      // important: hash to be held against package id too
      let hash = this.packageid + '.' + MD5( paramkey )
      this.getDropletByHash( hash )
      this.changePerformanceMeasures( hash )
    },
    changePerformanceMeasures( hash ) {
      let THEONE = this.ppkeys.find( (arr) => { return arr[0] === hash})
      if( THEONE )
      for(let i = this.params.length; i < this.params.length + this.performances.length; i++ ) {
        this.performances[i-this.params.length].currentValue = parseFloat(THEONE[i+1]);//.toFixed(5)
        this.$broadcast('change-perf', this.performances[i-this.params.length])
      }
    },
    valueSelected( value ) {
      this.$nextTick( () => {
        let paramkey = ''
        let urlkey = ''
        for(param of this.params) {
          paramkey += param.guid + '@' + parseFloat(param.value) + ':::'
          urlkey += param.value + ','
        }
        // important: hash to be held against package id too
        let hash = this.packageid + '.' + MD5( paramkey )
        this.getDropletDebounced( hash )  
        this.changePerformanceMeasures( hash )
        console.log(urlkey)
        urlkey = urlkey.slice(0,-1)
        window.history.pushState({},"", '/#!/package/' + this.packageid + '+' + btoa(urlkey))
      }) 
    },
    getDropletByHash( requesthash ) {
      this.showLoader = true
      this.lasthash = requesthash
      let self = this
      this.$http
      .get( window.SPKCONFIG.apiendpoint + '/api/frontend/droplet/requesthash', { params: { requesthash: requesthash} } )
      .then( (response) => {
        console.log( response.data )
        Bus.$emit('droplet-change', response.data.droplet ) // pass to renderer
        // this.showLoader = false
      })
    }
  },
  ready() {
    this.windowWidth = window.innerWidth
    if(! this.firstkey ) {
      this.setIntialDroplet()
    } else {
      this.setIntialDroplet( this.firstkey )
    }

    Bus.$on('hide-progress-bar', () => {
      this.showLoader = false
    })

    setTimeout(() => {
      // this.positionsPlease()
    }, 1000)
    window.addEventListener( 'resize', this.positionsPlease )
  }
}
</script>

<style scoped>
.progress-vertical {
  position: fixed;
  height: 100vh;
  top: 0;
  left: 5px;
  height: 5px;
  width: 100vh;
  transform-origin: top left;
  transform: rotate(90deg);
}
.param-btn {
  position: fixed;
  top: 20px;
  left: 30px;
  width: 40px !important;
  height: 40px !important;
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
  pointer-events: none;
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
