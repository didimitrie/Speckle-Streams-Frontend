<template lang="jade">
div
  div.row.center-xs.middle-xs(style='padding-top:200px; padding-bottom:20px;')
    div.col-xs-11.text-center
      h1 Speckle Streams Basic Usage
    div.col-xs-11.col-lg-5.text-center
      video(src='./assets/ShortVid.m4v' preload loop autoplay controls, style='max-width:100%')
      h2.text-center #[ui-icon(icon='device_hub')] SPK Sender & SPK Receiver
      p.text-left The sender component allows to broadcast data to other receiver components & to the online viewer interface. You can add as many parameters as you need through Grasshopper's ZUI, and rename them at your leisure. All input parameters in a SPK Sender component become layers in the online interface, to which you can assign individual colors.
      p.text-left Eeach sender component gets a unique id (KEY). Use this key to listen for data coming from this component.
      p.text-left The receiver component receives data in Grasshopper from another sender component, that can be anywhere. Data structures are reproduced - trees remain trees, lists remain lists. Furthermore, all objects come back as native rhino objects: breps, curves, planes, etc.
    //- div.col-xs-10
      h2 #[ui-icon(icon='cast')] View stuff online
  div.row.xxxmiddle-xs.center-xs(style='padding-top:50px; padding-bottom:50px;')
    div.col-xs-11.col-lg-5.text-center
      video(src='./assets/ViewOnline.m4v' preload loop autoplay controls, style='max-width:100%;')
      h2.text-center #[ui-icon(icon='cast_connected')] Viewing Geometry Online
      p.text-left Right click the SPK Sender component and click on "View stream online.". This will pop your default browser up with your stream there. Any sliders that are found in the defintion should already be there ready for playing around with.
      p.text-left Essentially this transforms your parametric model into a data and geometry server. Anytime a slider is dragged, a request is sent to the grasshopper definition and the computation results are streamed back.
  div.row.xxxmiddle-xs.center-xs(style='padding-top:50px; padding-bottom:50px;')
    div.col-xs-11.col-lg-5.text-center
      iframe(width="560" height="315" src="https://www.youtube.com/embed/lDbnBnEloI0" frameborder="0" allowfullscreen)
      h2.text-center #[ui-icon(icon='cast_connected')] Detaching Models
      p.text-left Speckle allows you to "detach" your parametric model from the computational backend.
      p.text-left Why do you want to do this? Well, sometimes parametric models take some time to provide a result. Having your Grasshopper defintion acting as a server may work nicely, but what about a power cut? Well, pre-packaging a model allows you to forget about all that, and allows for some really interesting exploratory views too.
  div.row.xxxmiddle-xs.center-xs(style='padding-top:50px; padding-bottom:50px;')
    div.col-xs-11.col-lg-5.text-center
      iframe(width="560" height="315" src="https://www.youtube.com/embed/PKd0t1SehFc" frameborder="0" allowfullscreen)
      h2.text-center #[ui-icon(icon='cast_connected')] Multi-user workflow
      p.text-left A short video showing how to use Speckle to create a multi-user workflow. Speckle allows you to send data between grasshopper defintions in real time, while maintaining data-tree structure and types. 
  div.row.xxxmiddle-xs.center-xs(style='padding-top:50px; padding-bottom:50px;')
    div.col-xs-11.col-lg-5.text-left
      h2 Coming soon...
      //- h3 Workflows
      //- p How to use Speckle to enable a collaborative workflow with grasshopper.
      h3 API Querying
      p Query streams for specific information and import the information in other applications.
    
  //- div.row.xxxmiddle-xs.center-xs(style='padding-top:50px; padding-bottom:50px;')
    div.col-xs-10.col-lg-5
      h5 Coming soon
    div.col-xs-11.col-lg-5.text-left
      h3 #[ui-icon(icon='compare_arrows')] API Querying
      p 

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
video{
  margin-top: 80px;
  margin-bottom: 80px;
  box-shadow: 0px 0px 35px -12px rgba(0,0,0,0.41);
  /*border-radius: 50px;*/
}

</style>
