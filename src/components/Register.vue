<template lang="jade">
div.row.middle-xs.center-xs.height-75
  div.col-xs-4(v-if='$route.params.apikey && !fakeapikey && !hasregistered')
    h3 Completing account registration...
    p You are one step away from acessing your dashboard & viewing streams online.
    p.small Your API key is: {{$route.params.apikey}}
    form(v-on:submit.prevent='submitForm')
      //- ui-textbox(name='apikey', :value.once='$route.params.apikey', help-text='API KEY', disabled=true)
      ui-textbox(name='name', :value.sync='username', help-text='What\'s your name?', placeholder='John Doe', validation-rules='required')
      ui-textbox(name='email', :value.sync='email', help-text='What\'s your email?', placeholder='john@doe.com', validation-rules='required|email')
      ui-alert(:show='emailtaken', type='error', text='Email is taken. Do you want to login?', :dismissible='false')
      //- ui-textbox(name='company', :value.sync='company', help-text='Where do you work (optional)?', placeholder='ACME Inc.')
      ui-textbox(type='password', validation-rules='min:8|max:16', :value.sync='passwd1', name='password', placeholder='Password')
      ui-textbox(type='password', validation-rules='min:8|max:16', :value.sync='passwd2', name='password validation', placeholder='Confirm Password')
      ui-alert(:show='!passwordsMatch', type='warning', text='Passwords do not match.')
      br 
      ui-button(id='submit', color='primary', icon='arrow_forward', raised=true, :disabled='!submitEnabled', xv-on:click='submit', style='width:100%;') Let's go!
  div.col-xs-11(v-else)
    h3 Eager to join?
    p To complete your account registration, open grasshopper up and #[strong click on the Complete Account Registration] menu item from under #[strong Speckle Suite].
    //- p(style='text-align:left') Meep. Your api key is invalid.
    ui-button.square-button( raised=true, color='primary', v-link='"../start"') Get Speckle!
  div.col-xs-3(v-if='hasregistered')
    h3 Seems you have already registered :)
    ui-button.square-button( raised=true, color='primary', v-link='"../login"') Login!
</template>

<script>
import Store from '../config'

export default {
   data () {
    return {
      shared: Store,
      fakeapikey: false,
      email: '',
      passwd1: '',
      passwd2: '',
      company: '',
      username: '', 
      emailtaken: false,
      hasregistered: false
    }
  },
  computed: {
      passwordsMatch () {
        return this.passwd1 === this.passwd2
      },
      submitEnabled () {
        return this.email!=='' && this.username!=='' && this.passwd1 !== '' && this.passwd2 !== '' && this.$children[0].valid && this.$children[1].valid && this.$children[3].valid && this.$children[4].valid && this.passwordsMatch
      }
  },
  methods: {
    gotoLogin() {
      this.$parent.activeTab = 'Login' 
    },
    submitForm() {
      var self = this
      var data = {
        apikey: self.$route.params.apikey,
        email: self.email,
        password: self.passwd1,
        username: self.username,
        company: self.company
      }
      this.$http
        .post( window.SPKCONFIG.apiendpoint + '/auth/completeregistration', data)
        .then( (response) => { 
          if(response.data.success) {
            this.$dispatch('user-registered', self.email)
            this.$route.router.go('/login')
          }
          if(response.data.message === 'Email is taken') self.emailtaken = true;
         } )
    }
  },
  ready() {
    if(this.$route.params) {
      let self = this
      this.$http
      .post( window.SPKCONFIG.apiendpoint + '/auth/keycheck', { apikey: self.$route.params.apikey})
      .then((response) => {
        console.log(response.data)
        if(!response.data.success)
          self.fakeapikey = true
        else if(response.data.username)
          self.hasregistered = true
      })
    }
  }
}
</script>

<style>
</style>
