<template lang="jade">
div.section-planes
  div.row.middle-xs(style='height:100%;')
    div.col-xs-12(style='pointer-events:all')
      div.row.middle-xs
        div.col-xs-6
          ui-slider(:value.sync='Sections.pl2Value', :disabled='!Sections.pl2')
        div.col-xs-3
          ui-checkbox(:label-left='false', :model.sync='Sections.pl2Flip') Flip
        div.col-xs-3
          ui-checkbox(:label-left='false', :model.sync='Sections.pl2') XY
      div.row.middle-xs
        div.col-xs-6
          ui-slider(:value.sync='Sections.pl1Value', :disabled='!Sections.pl1')
        div.col-xs-3
          ui-checkbox(:label-left='false', :model.sync='Sections.pl1Flip') Flip
        div.col-xs-3
          ui-checkbox(:label-left='false', :model.sync='Sections.pl1') XZ
      div.row.middle-xs
        div.col-xs-6
          ui-slider(:value.sync='Sections.pl3Value', :disabled='!Sections.pl3')
        div.col-xs-3
          ui-checkbox(:label-left='false', :model.sync='Sections.pl3Flip') Flip
        div.col-xs-3
          ui-checkbox(:label-left='false', :model.sync='Sections.pl3') YZ
</template>

<script>

import Sections         from '../store/sections'
import DiscreteSlider   from '../packageviewer/DiscreteSlider.vue'

export default {
  components: {
    DiscreteSlider
  },
  data () {
    return {
      Sections: Sections
    }
  },
 watch: {
 },
 ready() {
  console.log("SECTION SREADY")
 },
 beforeDestroy() {
  //this.Sections.reset()
 }
}
</script>

<style>
.section-planes {
  display: block;
  position: fixed;
  top: 5%;
  right: 0px;
  width: 200px;
  height:90%;
  padding: 10px;
  width: 350px;
  pointer-events: none;
}
.section-planes .ui-checkbox {
  margin-bottom: 0;
}
</style>
