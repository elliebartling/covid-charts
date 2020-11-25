<template lang="html">
  <div class="side-nav">
    <template v-for="el in elements">
      <p :key="el.url" class="mt-4 mb-0 section-header">
        <a :href="`#${el.url}`" v-scroll-to="`#${el.url}`">{{ el.text }}</a>
      </p>
      <ul :key="`${el.url}-list`" class="nav side-nav">
        <li v-for="c in el.charts" class="nav-item" :key="c.url">
          <a :key="`${c.url}-link`" :href="`#${c.url}`" v-scroll-to="`#${c.url}`">{{ c.text }}</a>
        </li>
      </ul>
    </template>
  </div>
</template>

<script>
  export default {
    name: 'Sidebar',
    data() {
      return {
        elements: []
      }
    },
    mounted() {
      this.$nextTick(() => {
        const sections = this.$parent.$refs['charts'].getElementsByTagName('h3')

        for (let i = 0; i < sections.length; i++) {
          let section = {
            text: sections[i].innerText,
            url: sections[i].id,
            charts: []
          }

          const charts = sections[i].nextSibling.getElementsByClassName('chart-card')
          for (let j = 0; j < charts.length; j++) {
            const cardTitle = charts[j].getElementsByClassName('card-title')[0]
            section.charts.push({
              text: cardTitle.innerText,
              url: charts[j].id
            })
          }

          this.elements.push(section)
        }
      })
    }
  }
</script>

<style lang="scss">
.section-header {
  font-weight: bold;
}
</style>
