<template lang="jade">
div
  div.row.middle-xs.height-75
    div.col-xs-12.text-center
          h1 Download the plugin.
          //- a(@click='showModal = true', href='http://streams.speckle.xyz/releases/SpeckleSuite.zip')
          ui-fab.large-fab.white(@click='showModal = true', icon='get_app', style='margin:0 auto')
          br
          p.small #[a(v-link="{ path: '/parametric' }" style='font-weight: 400; color:#0080FF') Ahm, dude, what is this par-oh-metric modelling stuff?]
  div.row.middle-xs.height-35(style='padding-bottom:40px;')
    div.col-xs-10.col-xs-offset-1.col-sm-6.col-sm-offset-3.text-centerxxx
      h3 1. Install the components: unzip & copy the 'SpeckleSuite' folder in the Grasshopper components folder.
      p Make sure all the dlls are unblocked. 
      //- hr(style='background:gray')
      h3 2. Complete account registration. 
      p To access your dashboard and view your streams, you have to complete your account registration by clicking on the Speckle Streams menu in Grasshopper and selecting "Complete account registration". This is optional.
      //- hr(style='background:gray')
      h3 Firewalls & Speckle #[ui-icon(icon='error_outline')]
      p Many corporate environments may have a firewall in place that might prevent Speckle from working. Check with your IT department, and *kindly* ask them to whitelist `http://46.101.85.144:3001` 
      //- hr(style='background:gray')
      h3.text-center Having trouble? #[a(v-link="{path:'/contact'}") #[ui-icon(icon='keyboard_arrow_right')] Get in touch.]
  ui-confirm(:show.sync='showModal', header='The Fine Print', confirm-button-text='Agree & Download', autofocus='confirm-button', @confirmed='download()') 
    h4 Speckle Streams is a #[strong research instrument] developed to measure solution space navigation and interaction. #[hr] 
    p The service is provided #[strong AS-IS], with no pledges to uptime, reliability, prior notice of disruptions. We can not be held liable for any damages caused by using the service. 
    p Speckle will anonymously aggregate interaction data through time, as detailed in Section 4.3 Methodology, subsection Observing Patterns of #[a(href='https://docs.google.com/document/d/1vWfGCpaTfaUjaXyGGRPT6JMDnzNM6BYhBuXR41ndvOg/edit?usp=sharing', target='_blank') this document]. Please read through it carefully, and if you want to go ahead, then click on 'Agree & Download'.

</template>

<script>
export default {
  data () {
    return {
       showModal: false
    }
  },
  methods: {
    download() {
      this.showModal = false
      window.open( 'http://streams.speckle.xyz/releases/SpeckleSuite.zip' )
    }
  }
}
</script>

<style>
.large-fab{ 
  width: 100px;
  height: 100px;
}

.large-fab.white {
  background-color: white !important;
  color: black !important;
}
.large-fab.white i {
 color: black !important; 
}

@media screen and (max-width: 650px) {
  .large-fab{
    width: 50px;
    height: 50px;
  }
}
</style>
