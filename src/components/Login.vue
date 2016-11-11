<template lang="jade">
div.row.middle-xs.center-xs(style='height:100%')
  div.col-xs-10.col-lg-3
    h3 Login
    form(v-on:submit.prevent='submitForm')
      ui-textbox(name='email', help-text='What\'s your email?', placeholder='john@doe.com', validation-rules='required|email', :value.sync='email',)
      ui-textbox(name='password', type='password', validation-rules='min:8|max:16',  placeholder='Password', help-text='Your account password.', :value.sync='password')
      ui-alert(v-show='loginError!=null', type='error', :text='loginError', :dismissible='false')
      ui-button(id='submit', type='flat', color='primary', icon='arrow_forward', raised=true, style='width:100%;') Login!
    br
    h4 No account yet? Here's #[a(v-link='"start"') how to get started].
</template>

<script>
import Store from '../config'

export default {
  data () {
    return {
      email: '',
      password: '',
      loginError: null,
      shared: Store 
    }
  },
  computed: {
      submitEnabled () {
        return this.email!=='' && this.$children[0].valid && this.$children[1].valid
      }
  },
  methods: {
    checkToken( cb ) {
      let self = this
      this.$http
      .get( window.SPKCONFIG.apiendpoint +'/api/frontend/authcheck', { headers:  { 'Authorization' : localStorage.getItem('jwttoken') } } )
      .then( ( response ) => {
        if( response.data.success ) {
          this.shared.authenticated = true
          this.shared.jwttoken = localStorage.getItem('jwttoken')
          this.shared.profile = response.data.user
          this.$route.router.go('dashboard')
        }
      }, (err) => {
        console.warn('JWT token is expired. Need to log in again, son. S-e-c-u-r-i-t-y!')
      })
    },
    submitForm() {
      let self = this
      let data = { email: self.email, password: self.password }
      this.$http
      .post( window.SPKCONFIG.apiendpoint + '/auth/authenticate', data)
      .then( (response) => {
        console.log(response)
        if( response.data.success === false) {
          self.loginError = response.data.message
        }
        else if ( response.data.success === true ) {
          self.loginError = null
          self.shared.authenticated = true
          self.shared.jwttoken = response.data.token
          self.shared.profile = response.data.profile
          localStorage.setItem('jwttoken', response.data.token)
          this.$route.router.go('/dashboard')
        }
      })
    }
  },
  ready () {
    let self = this
    let jwttoken = localStorage.getItem('jwttoken')
    if( jwttoken ) this.checkToken()
    else console.info('Welcome, stranger. No token found, so we guess you are new around here, eh?')
    // self.shared.jwttoken = jwttoken
    // // console.log(jwttoken)
    // if(jwttoken) {
    //   console.info('found jwt token, attempting to retrieve streams')
    //   this.checkToken( ( isExpired ) => {
    //     if( !isExpired ) {
    //       console.log("Auth token is not expired. Proceeding.")
    //       self.shared.authenticated = true
    //       self.shared.jwttoken = jwttoken
    //       this.$route.router.go('dashboard')
    //     }
    //     else {
    //       localStorage.removeItem('jwttoken')
    //       self.shared.authenticated = false
    //       self.shared.jwttoken = null
    //       console.warn('token expired')
    //     }
    //   })
    // }
  }
}
</script>

<style>
</style>
