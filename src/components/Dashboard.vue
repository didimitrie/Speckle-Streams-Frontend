<template lang="jade">
div
  div.row.middle-xs.bg-mossxxx.height-35
    div.col-xs-12.col-lg-8.col-lg-offset-2(style='size:border-box; padding-left:30px;')
      h3 Welcome #[strong {{ shared.profile.local.username }}]! #[ui-icon-button(icon='vpn_key', type='mini', tooltip='Reveal API Key', @click='showApiKey = true')]
      ui-modal(:show.sync='showApiKey', header='Your Api Key is:')
        h4 {{shared.profile.apitoken}}
      p.small(v-if='shared.profile.company') Hope everything goes well at {{ shared.profile.company }}.
      //- p.small #[strong API Key: ] {{ shared.profile.apitoken }}
      //- p.small #[strong Last Login: ] {{shared.profile.logins[0].date | date}} 
  div.row
    div.col-xs-12.xxxcol-xs-offset-1.col-lg-8.col-lg-offset-2(style='margin-top:20px')
      div.row
        div.col-xs-12
          ui-textbox(placeholder='Type to search for a stream', icon='search', name='searchbar', :value.sync='filtertext')
        stream-box(v-for='stream in shared.streams | filterBy filtertext in "name" | orderBy "createdon" -1', :stream='stream')
      div.row.middle-xs.height-75(v-if='shared.streams.length === 0')
        div.col-xs-12
          h2 Whooops! You haven't created any streams.
          h3 To start, drag a speckle sender component in grasshopper, plug in some geometry, and voila! 
          h4 #[a(v-link="{ path: '/contact' }") Do you need help?] 
  br
  br
</template>

<script>
import Store      from '../config'
import StreamBox  from './StreamBox.vue'

export default {
  components: {
      StreamBox
  },
  data () {
    return {
      shared: Store,
      filtertext: '',
      showApiKey: false
    }
  },
  methods: {
    logout() {
      localStorage.clear()
      this.shared.profile = {}
      this.shared.authenticated = false
      this.$dispatch('disable-logout')
      this.$route.router.go('/')
    },
    checkToken( cb ) {
      let self = this
      this.$http
      .get( window.SPKCONFIG.apiendpoint +'/api/frontend/authcheck', { headers:  { 'Authorization' : localStorage.getItem('jwttoken') } } )
      .then( ( response ) => {
        if( response.data.success ) {
          this.shared.authenticated = true
          this.shared.jwttoken = localStorage.getItem('jwttoken')
          this.shared.profile = response.data.user
          this.$dispatch('enable-logout')
          cb()
        }
        else 
          this.$route.router.go('/login')
      }, (err) => {
        console.warn('JWT token is expired. Need to log in again, son. S-e-c-u-r-i-t-y!')
      })
    },
    getStreams( cb ) {
      let self = this
      this.$http
      .get( window.SPKCONFIG.apiendpoint + '/api/frontend/streams', { headers: { 'Authorization' : localStorage.getItem('jwttoken') } } )
      .then( (response) => {
        console.log(response)
        this.shared.streams = response.data.streams
      })
    }
  },
  events: {
  },
  ready () {
    console.log(localStorage.getItem('jwttoken') + "FUCK YOU")
    if(localStorage.getItem('jwttoken')!==null)
      this.checkToken( () => {
        this.getStreams()  
      })
    else 
      window.location.href = '/#!/login'
      // this.$nextTick(function() { 
        
      // })
  }
}
</script>

<style>
.ui-icon-button.homebutton {
  top: 4px;
  background: none;
}

.dashboard-item {
  display: inline-block;
  line-height: 60px;
  box-sizing: border-box;
  padding-left:5px;
  padding-right:5px;
  transition: all .3s ease;
}

.dashboard-item a{ color: white; font-weight: 300; }
.dashboard-item.info{
  text-align: right;
  font-size: 0.75em;
  float: right;
}
</style>
