<template>
  <div id="pos-rate">
    <h3>Positivity Rate</h3>
  </div>
</template>


<script>
  // import { Line } from './charts/Line'

  export default {
    // components: { Line },
    computed: {
      dateRange() {
        return {
          start: '08/24',
          end: '11/22'
        }
      },
      dates() {
        return this.$store.state.dates
      }
    }
  }
</script>

<style lang="css">
</style>
