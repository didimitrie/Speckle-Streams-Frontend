<template lang="jade">
div
  div.row.center-xs(style='padding-top:200px; padding-bottom:200px;')
    div.col-xs-10.col-sm-7.col-lg-6.text-left
      h1 What is parametric modelling? 
      h3 Parametric modeling enables designers to create a #[a(href='https://en.wikipedia.org/wiki/Parametric_family', target='_blank') family] of designs (described by a system) rather than one static instance.
      p Parametric modeling is a process based on algorithmic thinking that enables the expression of parameters and rules that, together, define, encode and clarify the relationship between design intent and design response. #[a.small(href='https://en.wikipedia.org/wiki/Parametric_design') (wikipedia)]
      //- p Speckle was born out the belief that design parameters can be made relevant to people outside the design industry. 
    div.col-xs-12
    div.col-xs-10.col-sm-7.col-lg-6.text-left
      h3 Speckle #[ui-icon(icon='favorite_border')] #[aas(href='http://www.grasshopper3d.com/') Grasshopper]
      p Grasshopper is a plugin for the popular modeling software Rhino. It allows designers to build form generators from the simple to the awe-inspiring. Speckle is currently deployed as a plugin for grasshopper. 
      p There are plenty of resources to help you get started, and a friendly community. This is #[a(href='http://www.grasshopper3d.com/page/tutorials-1', target='_blank') a good overview] of available learning resources. 
      a(href='http://www.grasshopper3d.com/page/tutorials-1', target='_blank')
        img(src='./assets/ghtutorials.png', style='max-width:100%')
      //- h3 Already a master parametric modeler? #[a(v-link="{ path: '/start' }") Get started!]
      div.text-center
        br
        br
        br
        h1 Already a ninja?
        ui-button.square-button( raised=true, color='primary', v-link='"start"', tooltip='lol') Get Speckle!
  //- div.row.center-xs
    div.col-xs-10.text-center(style='border-radius:150px')
      h3.text-center A parametric model graph. 
      img(src='./assets/screenshots/05surface.png', style='width:100%')
    div.col-xs-12
    div.col-xs-10.text-center
      h3.text-center And its output in Speckle, with customisable parameters.
      iframe.example(src='http://streams.speckle.xyz/#!/package/HybaUyKgl+3.14,6,13,2.0,0.1,', style='width:100%;height: 600px')
</template>

<script>
export default {
  data () {
    return {
    }
  }
}
</script>

<style>
</style>
