<template lang="jade">
div.param
  div.row.middle-xs(style='margin-top:10px;')
    div.param-value(@click='param.value = !param.value', v-bind:class='{"true-val" : param.value}') {{ param.nickname != '' ? param.nickname : param.name }} #[ui-icon(:icon=' param.value ? "radio_button_checked" : "radio_button_unchecked"' )]
</template>

<script>

import Bus from '../logic/Events'

export default {
  props: ['param'],
  data () {
    return {
    }
  },
  watch: {
    'param.value'() {
      Bus.$emit('controller-updated')
    }
  }
}
</script>

<style scoped>
.ui-icon {
  font-size: 18px;
}
.param {
  height: 47px;
  pointer-events: all;
  user-select:none;
  margin-top:20px;
  }
.param-value{ 
  padding: 5px 10px;
  font-size: 14px;
  line-height: 18px;
  color: white;
  background: #4287FF;
  border-radius: 200px;
  user-select:none;
  cursor: pointer;
  transition: all .3s ease;
 }
 .true-val {
  background: #4287FF;
 }
</style>
