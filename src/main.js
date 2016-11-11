import Vue            from 'vue'
import VueRouter      from 'vue-router'
import VueResource    from 'vue-resource'
import VueFilter      from 'vue-filter'
import JwtDecode      from 'jwt-decode'

Vue.use( Keen )
Vue.use( VueRouter )
Vue.use( VueResource )
Vue.use( VueFilter )

import GAnalytics     from './analytics.js'
import Root           from './components/Root.vue'
import Home           from './components/Home.vue'
import About          from './components/About.vue'
import Contact        from './components/Contact.vue'
import Docs           from './components/Documentation.vue'
import Start          from './components/Start.vue'
import PModeling      from './components/ParametricModelling.vue'
import BasicUsage     from './components/BasicUsage.vue'
import Login          from './components/Login.vue'
import Register       from './components/Register.vue'
import Dashboard      from './components/Dashboard.vue'

import StreamViewer        from './components/viewer/StreamViewer.vue'
import PackageViewer       from './components/packageviewer/PackageViewer.vue'
import DataView            from './components/dataview/DataView.vue'

import Store          from './config'

var router = new VueRouter({})

router.map({
    '/': {
      component: Root,
      subRoutes: {
        '/': {
          component: Home
        },
        '/about': {
          component: About
        },
        '/contact': {
          component: Contact
        },
        '/start': {
          component: Start
        },
        '/parametric': {
          component: PModeling
        },
        '/basic': {
          component: BasicUsage
        },
        '/register': {
          component: Register
        },
        '/register/:apikey': {
          component: Register
        },
        '/login': {
          component: Login
        },
        '/dashboard': {
          component: Dashboard
        },
        '/docs' : {
          component: Docs
        }
      }
    },
    '/view/:streamid': {
      component: StreamViewer,
      canReuse: false
    }, 
    'package/:packageid': {
      component: PackageViewer,
      canReuse: false
    }, 
    'dataview/:packageid': {
      component: DataView,
      canReuse: false
    }
})

router.beforeEach( (transition) => {
  // console.log(window.ga)
  console.log(window.location.origin + transition.to.path)
  if(window.ga)
    window.ga('send', {
      hitType: 'pageview',
      page: transition.to.path,
      location: window.location.origin + transition.to.path,
      title: transition.to.name
    })
  else console.error('ga undefined')
  transition.next()
  window.scrollTo(0, 0)
})

var App = Vue.extend({
  data() {
    return {
      shared: Store
    }
  }
})

router.start(App, '#app', () => {
  GAnalytics.init() 
  
  let jwttoken = localStorage.getItem('jwttoken')
  if(jwttoken)
    Store.profile = JwtDecode(jwttoken)  
  
} )
