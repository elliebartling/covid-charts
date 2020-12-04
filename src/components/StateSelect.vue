<template lang="html">
  <div class="relative">
    <div id="state-selector" class="component-wrapper">
      <label>Filter by State:</label>
      <multiselect
        v-model="stateSelected"
        :options="stateMeta"
        label="name"
        :searchable="true"
        track-by="name"
        @input="getStateData"
      ></multiselect>
    </div>
  </div>
</template>

<script>
  import Multiselect from 'vue-multiselect'
  import { mapState, mapActions } from 'vuex'
  import { mapFields } from 'vuex-map-fields'

  export default {
    name: 'StateSelect',
    components: {
      Multiselect
    },
    computed: {
      ...mapState(['stateMeta']),
      ...mapFields(['stateSelected'])
    },
    methods: {
      ...mapActions(['getStateData'])
    },
    mounted() {
      console.log('New component mounted.')
    }
  }
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style lang="scss">
#state-selector,
#filter-wrapper {
  z-index: 5000;
}

.relative {
  position: relative;
}

.content-wrapper {
  position: absolute;
}

.multiselect__tags {
  border-radius: 1px;
}
</style>
