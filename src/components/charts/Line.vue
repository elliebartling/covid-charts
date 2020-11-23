<script>
  import { Bar, mixins } from 'vue-chartjs'
  const { reactiveProp } = mixins
  import { mapState } from 'vuex'

  export default {
    extends: Bar,
    mixins: [reactiveProp],
    data() {
      return {
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      }
    },
    computed: {
      ...mapState(['filteredDates']),
      dates() {
        return this.filteredDates.map(d => d.formatted)
      }
    },
    mounted () {
      this.renderChart(this.chartData, this.options)
    }
  }
</script>

<style lang="css">
</style>
