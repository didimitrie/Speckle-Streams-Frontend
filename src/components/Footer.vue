<template lang="jade">
div
  div.row.center-xs.footer
    div.col
      ui-icon.to-top(icon='arrow_upward', style='color:white !important; font-size: 60px;', @click='topPlease()')
      p.small Navigation
      hr(style='background:#272727')
      p.link(v-link='"/"') Home
      p.link(v-link='"/start"') Download
      p.link(v-link='"/about"') About
      //- p.link(v-link='"/docs"') Docs
      p.link(v-link='"/dashboard"') Dashboard
      hr(style='background:#272727')
      p #[a(href='http://twitter.com/idid', style='color:white !important; text-decoration:none; font-weight:400;') @IDID] THIS @ The Bartlett UCL & Innochain
  div.row.center-xs.footer-logos.middle-xs
    div.col-xs-12
      div.row.center-xs
        div.col-xs-12
          div.row
            div.col-xs-12.col-sm-4
              a(href='http://innochain.net')
                img(src='./assets/innochain.png', style='margin-left:0px; margin-bottom:17px' )
            div.col-xs-12.col-sm-4
              a(href='http://ec.europa.eu/')
                img(src='./assets/eu.png', style='opacity:0.7; margin-left:10px;margin-bottom:10px')
            div.col-xs-12.col-sm-4
              a(href='http://www.bartlett.ucl.ac.uk/')
                img(src='./assets/bartlettblack.png' style='margin-left:40px; max-height: 80px;')
        div.col-xs-12.col-lg-4
          p.small.text-justify This project has received funding from the European Union’s Horizon 2020 research and innovation programme under the Marie Sklodowska-Curie grant agreement No 642877.


</template>

<script>
export default {
  data () {
    return {
    }
  },
  methods: {
    topPlease() {
      window.scrollTo(0, 0)
    }
  }
}
</script>

<style scoped>
.footer {
  background-color: black;
  font-size: 14px !important;
  /*box-sizing: border-box;*/ 
}
.to-top {
  position: relative;
  top: -70;
  cursor: pointer;
}
.footer-logos {
  background-color: black;
  height: 40vh;
  color: white;
  font-size: 14px;
}

.link.v-link-active {
  font-weight: 700
}

</style>
