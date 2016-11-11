<template lang="jade">
div.col-xs-12.col-sm-6.col-md-4.col-lg-4.stream(transition="fade", transition-mode="out-in")
  div.card 
    div.card-inner
      div.card-image.row.middle-xs
        img(:src='imgsrc')
      div.card-content
        div.card-title {{ stream.name }}
        div.card-info #[strong {{ stream.droplets.private ? "Private" : "Public"}}] | {{ stream.createdon | date}}
        div.card-info #[strong {{ stream.droplets.length }}] history snapshots
        //- div.card-info.action(@click='showPackages = true') #[strong {{ stream.packages.length }}] packages 
        //- #[ui-icon(icon='add_circle')]
        //- div.card-info #[strong {{ stream.droplets.private ? "Private" : "Public"}}] 
        div.card-actions 
          a.card-action.primary(:href='href', target='_blank') VIEW
          a.card-action(@click='showPackages = true') #[strong {{ stream.packages.length }}] PACKS
          //- a.card-action(@click='') ARCHIVE
          //- div.card-action.red DELETE 
      div.card-details(v-show='showPackages' transition="fade", transition-mode="out-in")
        div.card-details-inner
          h4 Packs:
          div.card-info.action(v-for='pack of packageData | orderBy "created" -1', @click='openPack(pack.packageid)') #[strong {{$index+1}}. {{pack.name}}] #[br] Completed: #[strong {{ pack.computedInstances == pack.totalInstances}} ] | #Instances: {{ pack.totalInstances }} #Completed: {{pack.computedInstances}} 
          div.card-info(v-show='stream.packages.length == 0') 
            h4 This stream has no packages.
        div.close-card-details
          ui-fab(icon='close', @click='showPackages = false')
</template>

<script>
import Config   from '../config'
export default {
  props:['stream'],
  computed: {
    href() {  
      return window.SPKCONFIG.frontend + '/view/' + this.stream.streamid
      // return Config.apiendpoint + '/#!/view/' + this.stream.streamid
    },
    imgsrc() {
      // return 'http://localhost:8080/static/stream-screenshots/' + this.stream.streamid + '.png'
      return window.SPKCONFIG.apiendpoint + '/static/stream-screenshots/' + this.stream.streamid +'.png'
    }
  },
  data () {
    return {
      Config: Config,
      showPackages: false, 
      packageData: []
    }
  },
  methods: {
    openPack( pack ) {
      window.open( window.SPKCONFIG.frontend + '/package/' + pack)
    },
    showPacks() {
      this.showPackages = !this.showPackages
      // if(this.packageData.length === 0 && this.showPackages && this.stream.packages.length > 0 ) 
      //   this.getPackageInfos()
    },
    getPackageInfos() {
      let self = this
      this.$http
      .get( window.SPKCONFIG.apiendpoint + '/api/frontend/packs', { headers: { 'Authorization' : localStorage.getItem('jwttoken') }, params: { packageids: this.stream.packages } } )
      .then( (response) => {
        this.packageData = response.data
      })
    }
  },
  ready() {
    if( this.stream.packages.length > 0 )
      this.getPackageInfos()
  }
}
</script>

<style scoped>
.card {
  height: 500px;
  padding: 20px;
  box-sizing: border-box;
  font-family: 'Roboto', sans-serif;
}

.card-inner {
  height: 100%;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0px 0px 35px -12px rgba(0,0,0,0.41);
  overflow:hidden;
  transition: all .3s ease;
  /*background-color: #F4F4F4*/
}
.card-inner:hover {
  box-shadow: 0px 0px 35px -6px rgba(0,0,0,0.41);
}

.card-image {
  height: 250px;
  width: 100%;
  background-color: white;
  overflow:hidden;
}

.card-inner:hover .card-image img{
  max-width: 140%;
  margin-left: -20%;
  opacity: 1;
}
.card-image img {
  margin-left: -10%;
  max-width: 120%;
  transition: all .3s ease;
  transform-origin: center top;
  opacity: 1;
}
.card-content {
  position: relative;
  display: block;
  /*border-top: 2px solid #F2F2F2;*/
  /*background-color: #F2F2F2;*/
  height: 200px;
  margin-left: 20px;
}
.card-title {
  margin-top:15px;
  margin-bottom: 10px;
  font-size: 1.2em;
  font-weight: 600;
  text-transform: uppercase;
}
.card-info {
  font-size: 0.8em;
  margin-top: 10px;
  width: auto;
  /*font-weight: 600;*/
}

.card-info .ui-icon {
  font-size: 1em;
  color: #3F3F3F;
}
.card-info.action {
  cursor: pointer;
  transition: all .3s ease;

}
.card-info.action:hover {
  color: #0080FF !important;
  /*border-bottom: 2px solid black; */
}

.card-actions {
  position: absolute;
  bottom: 30px;
}
.card-action {
  display: inline-block;
  margin-right: 15px;
  border-bottom: 2px solid white;
  font-weight: 600;
  transition: all .3s ease;
  text-decoration: none;
}
.card-action:hover {
  cursor: pointer;
  border-bottom: 2px solid black;
  transform: none;
  color: #3F3F3F;
}
.card-action.primary{ 
  color: #6666FF;
}
.card-action.primary:hover{
  border-bottom: 2px solid #6666FF;
}

.card-details {
  position: relative;
  top: -102%;
  height: 100%;
  background-color: white;
  /*overflow-y: auto;*/
}

.card-details-inner {
  position: relative;
  right: -20px;
  height: 100%;
  width: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 20px;
}

.close-card-details {
  position: absolute;
  bottom: 10px;
  right: 20px;
}
</style>
