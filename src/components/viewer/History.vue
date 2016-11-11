<template lang="jade">
div.history
  div.last-live( v-if='DropletStore.droplets.length>0' ) #[strong Last Live Data: ] {{ DropletStore.droplets[0].date | date}}
  //- ui-button(icon='add', @click='window.alert("todo")') Save Current Instance
  //- br
  //- br
  p.small(v-show='droplets.length==0') No saved instances. They will appear here once you click on the "save button" on the stream sender component in grasshopper.
  div.droplet( v-for='drp in droplets | reverse' @click=' changeDroplet(drp.droplet) ' v-bind:class='{ "selected" : drp.droplet==selectedDropletId}' ) {{$index+1}}. #[strong {{ timeSince( drp.date )}} ago]: {{ drp.name ? drp.name : "Anonymous Droplet"}}


</template>

<script>
import _             from 'underscore'
import Config        from '../../config'
import Droplets      from '../store/droplets'

import Bus           from '../logic/Events'

export default {
  props: ['livedroplet', 'droplets'],
  data () {
    return {
      ConfigStore: Config,
      DropletStore: Droplets,
      selectedDropletId: '',
      controllersActive: false
    }
  },
  methods: {
    timeSince( date ) {
      var seconds = Math.floor((new Date() - date) / 1000);
      var interval = Math.floor(seconds / 31536000);
      if (interval > 1) {
          return interval + " years";
      }
      interval = Math.floor(seconds / 2592000);
      if (interval > 1) {
          return interval + " months";
      }
      interval = Math.floor(seconds / 86400);
      if (interval > 1) {
          return interval + " days";
      }
      interval = Math.floor(seconds / 3600);
      if (interval > 1) {
          return interval + " hours";
      }
      interval = Math.floor(seconds / 60);
      if (interval > 1) {
          return interval + " minutes";
      }
      return Math.floor(seconds) + " seconds";
    },

    changeDroplet( id ) {
      if( this.selectedDropletId === id ) { 
        return
      }
      Bus.$emit('history-select-droplet', id )
    }
  },
  ready() {
  }
}
</script>

<style scoped>
  .history { 
    width: 300px;
  }
  .last-live{
    min-height: 50px;
    width: 100%;
    line-height: 20px;
    font-size: 12px;
    box-sizing: border-box;
    /*padding: 10 20px;*/
    transition: all .3s ease;
    color: black;
  }
  .droplet {
    min-height: 30px;
    width: 100%;
    line-height: 30px;
    font-size: 12px;
    box-sizing: border-box;
    /*padding: 10 20px;*/
    cursor: pointer;
    transition: all .3s ease;
    color: black;
  }
  .droplet:hover{ 
    background: #0080FF;
    color: white;
  }
</style>
