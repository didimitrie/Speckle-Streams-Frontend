<template lang="jade">
div.param
  div.row.slider
    span.param-value {{ perf.name }}: #[strong {{ myValue }}] {{perf.unit}}
</template>

<script>
export default {
  props:['perf'],
  data () {
    return {
      myValue: 'n/a'
    }
  },
  events: {
    'change-perf'( perf ) {
      if(perf.guid != this.perf.guid ) return
      this.myValue = perf.currentValue
    }
  }
}
</script>

<style scoped>
.param {
  position: relative;
  height: 30px;
  user-select:none;
  padding: 10px;
  /*pointer-events: none;*/
  display: block;
  overflow:hidden;
  transition: all .3s ease;
}

.slider {
  opacity: 1;
  transition: all .3s ease;
}

.param-value {
  padding: 5px 10px;
  font-size: 12px;
  color: black;
  background: #E4E4E4;
  border-radius: 200px;
  user-select:none;
}

@media only screen and (max-width : 48em) {
  .param {
    display: none;
  }
}

</style>
