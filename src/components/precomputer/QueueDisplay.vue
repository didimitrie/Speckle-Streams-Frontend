<template lang="jade">
p.small Queue {{consumer.consumerid}}: #[strong {{solvedInstances}}]
</template>

<script>
export default {
  props:['consumer'],
  data () {
    return {
      solvedInstances: 0
    }
  },
  events: {
    'increment-solved'( id ) {
      if(this.consumer.consumerid == id) this.solvedInstances++
    }
  }
}
</script>

<style>
</style>
