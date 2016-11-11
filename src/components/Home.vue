<template lang="jade">
div
  div.row.middle-xs.bg-mossxxx.height-75
    div.col-xs-10.col-xs-offset-1.col-sm-8.col-sm-offset-2.text-center()
      img(src='./assets/LogoExport-01.png')
      h1 Speckle Streams
      h4 brings parametric design to the web
      ui-icon.large-down(icon='keyboard_arrow_down')
  div.row.middle-xs.center-xs.bg-mossxx.height-75
    div.col-xs-12
      p Here's some example output:
    div.col-xs-10.col-sm-4.col-md-4.col-lg-4.card(transition="fade", transition-mode="out-in")
      a(href='http://streams.speckle.xyz/#!/package/HybaUyKgl', target='_blank')
        div.card-inner.middle-xs.center-xs
          div.card-image 
            img(src='./assets/screenshots/01benneper.png')
          div.card-text.row.middle-xs
            ui-fab(icon='add', color='primary', tooltip='Customise this model!')
    div.col-xs-10.col-sm-4.col-md-4.col-lg-4.card(transition="fade", transition-mode="out-in")
      a(href='http://streams.speckle.xyz/#!/package/Hkbm9LJ-l', target='_blank')
        div.card-inner.middle-xs.center-xs
          div.card-image 
            img(src='./assets/screenshots/07market.png')
          div.card-text.row.middle-xs()
            ui-fab(icon='add', color='primary', tooltip='Customise this model!')
    div.col-xs-12
    div.col-xs-10.col-sm-4.col-md-4.col-lg-4.card(transition="fade", transition-mode="out-in")
      a(href='http://streams.speckle.xyz/#!/package/H14XwHqlg', target='_blank')
        div.card-inner.middle-xs.center-xs
          div.card-image 
            img(src='./assets/screenshots/06canopy.png')
          div.card-text.row.middle-xs()
            ui-fab(icon='add', color='primary', tooltip='Customise this model!')
  div.row.center-xs(style='padding-top:100px;padding-bottom:10px;')
    div.col-xs-10
      h1 How does it work?
      p Speckle infuses a parametric model (left) with magic, and chanells it through some alambicated pipes called the interwebs to your client's browser (right).
    div.col-xs-12.col-sm-6.text-center(style='border-radius:150px')
      div.row.middle-xs.center-xs(style='height: 600px;')
        div.col
          img(src='./assets/ghdef.png', style='width:100%')
    div.col-xs-12.col-sm-6
      iframe.example(src='http://streams.speckle.xyz/#!/package/HybaUyKgl+My4xNCw0LDExLDIuMCwwLjE=', style='width:100%;height: 600px')
  div.row.middle-xs.center-xs.height-75
    div.col-xs-11
      h1 Curious?
      ui-button.square-button( raised=true, color='primary', v-link='"start"', tooltip='lol') Get Speckle!
      br
    div.col-xs-6
      p Want to deploy it on your own? The Speckle Toolkit (Plugin, Frontend & Backend) will be released under an open source licence as soon as things become stable.#[a(v-link="{ path: '/contact' }") #[ui-icon(icon='keyboard_arrow_right')] Get in touch. ]
      //- h4 New to parametric modelling? #[a(v-link='{path:"/parametric"}') #[ui-icon(icon='keyboard_arrow_right')] Read this bit first.]
</template>

<script>
import Store from '../config'

export default {
  data () {
    return {
      shared: Store
    }
  }
}
</script>

<style scoped>
.large-down{
  font-size: 40px !important;
}

.card {
  height: 400px;
  padding: 20px;
  box-sizing: border-box;
  font-family: 'Roboto', sans-serif;
}

.card-inner {
  position: relative;
  height: 100%;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0px 0px 35px -12px rgba(0,0,0,0.41);
  overflow:hidden;
  transition: all .3s ease;
  background-color: white;
  display: flex;
  /*background-color: #F4F4F4*/
}
.card-inner:hover {
  box-shadow: 0px 0px 35px -6px rgba(0,0,0,0.41);
}

.card-text{ 
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}
.card-text .ui-fab{ 
  pointer-events: all;
  font-size: 16px;
  font-weight: 400;
}

.card-inner img{
  transition: all .3s ease;
  transform: scale(0.8);
}
.card-inner:hover img{
 transform: scale(0.75);
 /* margin-left: -15%;
  max-width: 120%;*/
}



</style>
