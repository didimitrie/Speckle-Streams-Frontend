<template lang="jade">
div
  div.release-warning PRE-RELEASE
  div
    div.row.middle-xs.mainmenu(v-bind:class='{"add-shadow" : shadow}')
      div.col-xs-10.col-sm-3.col-lg-2
        div.home-link(v-link="{ path: '/' }" @click='showMobile=false')#[img.logo-image(src='./assets/LogoExport-02.png')]
      div.col-xs-0.col-sm-9.col-lg-10.text-right.hidden-xs
        span.navlink(v-link="{ path: '/start' }") GET SPECKLE
        span.navlink(v-link="{ path: '/parametric' }") PARAMETRIC WHAT? 
        span.navlink(v-link="{ path: '/basic' }") BASIC USAGE
        span.navlink(v-link="{ path: '/about' }") ABOUT
        span.navlink(v-link="{ path: '/contact' }") CONTACT
        //- span.navlink(v-link="{ path: '/docs' }") DOCS
        span.navlink(v-show='!showLogout',  v-link="{ path: '/login' }") #[ui-icon(icon='account_circle') LOGIN]
        span.navlink(v-show='showLogout', v-link="{ path: '/dashboard' }") DASHBOARD
        span.navlink(v-show='showLogout', @click='logout()') Logout
      div.col-xs-2.visible-xs.text-right
        ui-icon-button(type='flat', :icon='showMobile? "close":"menu"', @click='showMobile=!showMobile')
    div.mobile-menu.row.middle-xs.center-xs(v-show='showMobile', transition="fade", transition-mode="out-in")
      div.col-xs-10
        span.navlink.softlink(v-link="{ path: '/' }", @click='showMobile=false') HOME
        span.navlink(v-link="{ path: '/start' }", @click='showMobile=false') GET SPECKLE
        span.navlink(v-link="{ path: '/parametric' }", @click='showMobile=false') PARAMETRIC WHAT? 
        span.navlink(v-link="{ path: '/basic' }", @click='showMobile=false') BASIC USAGE 
        span.navlink(v-link="{ path: '/about' }", @click='showMobile=false') ABOUT
        span.navlink(v-link="{ path: '/contact' }", @click='showMobile=false') CONTACT
        //- span.navlink(v-link="{ path: '/docs' }") DOCS
        span.navlink(v-show='!showLogout',  v-link="{ path: '/login' }", @click='showMobile=false') LOGIN
        span.navlink(v-show='showLogout', v-link="{ path: '/dashboard' }", @click='showMobile=false') DASHBOARD
        span.navlink(v-show='showLogout', @click='logout()') Logout
  router-view(transition="fade", transition-mode="out-in")
  footerrr
</template>

<script>
import Store from '../config'
import Footerrr from './Footer.vue'

export default {
  components: {
    Footerrr
  },
  data () {
    return {
      shared: Store,
      showLogout: false,
      showMobile: false,
      shadow: false
    }
  },
  events: {
    'enable-logout'() {
      this.showLogout = true
    },
    'disable-logout'() {
      this.showLogout = false
    }
  },
  methods: {
    broadcastLogout() {
      this.$broadcast('logout-please')
    },
    logout() {
      localStorage.clear()
      this.shared.profile = {}
      this.shared.authenticated = false
      this.$dispatch('disable-logout')
      this.$route.router.go('/')
    },
    applyShadow() {
      // console.log(document.body.scrollTop)
      if(document.body.scrollTop < 30 )
        this.shadow = false
      else 
        this.shadow = true
    }
  },
  ready() {
    window.onscroll = this.applyShadow
  }
}
</script>

<style>
.softlink {
  background-color: white !important;
  color: black !important;
}
.mainmenu{
  width: 100%;
  z-index: 210;
  background-color: white;
  
  margin-right: 0;
  margin-left: 0;
}
.add-shadow {
  box-shadow: 0px 0px 35px -12px rgba(0,0,0,0.4);
}
.mainmenu:hover{ 
 box-shadow: 0px 0px 35px -12px rgba(0,0,0,0.6); 
}
.mobile-menu {
  position: fixed;
  top:0;
  left:-10%;
  height: 100vh;
  width: 120%;
  background-color: white;
  z-index: 100;
}
.mobile-menu .navlink {
  width: 100%;
  display: block;
  line-height: 50px;
}
.release-warning {
  position: fixed;
  top: 16px;
  left: 60px;
  font-weight: 400;
  padding: 10px;
  font-size: 12px;
  color: #ef7ab4;
  z-index: 301;
}

.link:hover{ 
  cursor: pointer;
}
.footer {
  padding-top: 150px;
  min-height: 500px;
  color: white;
}
.logo {
  width: 70px;
  height: 70px;
  transition: all .2s ease;
}
.logo:hover{
  transform: scale(0.5) rotate(180deg);
  cursor: pointer;
}
.home-link {
  position: relative;
  margin-left: 10px;
  width: 40px;
  height:40px;
  /*background-color: #4287FF;*/
  background-color: #141414;
  cursor: pointer;
  border-radius: 40px;
  box-shadow: 0px 0px 35px -12px rgba(0,0,0,0.41);
  transition: all .3s ease;
}
.home-link:hover {
  box-shadow: 0px 0px 35px -6px rgba(0,0,0,0.41);
}

.logo-image {
  margin-top: 2px;
  margin-left: 2px;
  width: 36px;
  height: 36px;
}
.logo-name {
  color: black;
  display: inline-block;
  float: left;
  font-weight: 300;
}
</style>
