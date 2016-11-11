<template lang="jade">
div
  div.row.middle-xs.center-xsxx.height-100
    div.col-xs-10.col-xs-offset-1.col-sm-6.col-sm-offset-3.col-lg-4.col-lg-offset-4(v-if='!messageSent')
      h2.text-center Leave a message.
      p I'll try and get back to you as soon as possible. Bug reports, complaints and general hollers of any sort are welcome.
      //- ui-textbox(name='name', label='Name')
      ui-textbox(name='email', xxxhelp-text='What\'s your email?', placeholder='Your email', validation-rules='required|email', :value.sync='email', xxxicon='email')
      ui-select(name='reason', :options='reasons', :value.sync='thereason', placeholder='What kind of message is this?')
      ui-textbox(name='message', placeholder='Your message', multi-line=true, :rows='7', validation-rules='required', :value.sync='themessage')
      ui-button(name='lol', id='submit', type='flat', raised=true, style='width:100%;', @click='debSend()') Send Message!
    div.col-xs-10.col-xs-offset-1.col-sm-6.col-sm-offset-3.col-lg-4.col-lg-offset-4(v-show='messageSent')
      h2.text-center Thanks for the feedback! Expect a reply in a jiffy.
      ui-button(name='lol', id='submit', type='flat', raised=true, style='width:100%;', v-link="{ path: '/' }") Back home
      

</template>

<script>
import _ from 'underscore'
export default {
  data() {
    return {
      email:'',
      thereason:'just saying hi',
      themessage: '',
      reasons: ['just saying hi', 'feature request', 'bug report', 'help required'],
      debSend: _.debounce(this.submitMessage, 20),
      messageSent: false
    }
  },
  methods: {
    submitMessage() {
      let sendData = {
        reason: this.thereason,
        message: this.themessage,
        email: this.email,
        replyto: this.email
      }
      this.messageSent = true
      this.$http.post('https://formspree.io/d.stefanescu@ucl.ac.uk', sendData).then( (response) => {
        console.log(response)
      })
    }
  },
  ready() {

  }
}
</script>

<style>

</style>
