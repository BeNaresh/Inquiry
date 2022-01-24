<template>
  <v-card-text>
    <v-chip-group v-model="selectChip" column multiple>
      <v-chip
        filter
        outlined
        @click="chipSelect(chip)"
        v-for="chip in chipList"
        :key="chip.id"
      >
        {{ chip.text }}
      </v-chip>
    </v-chip-group>
  </v-card-text>
</template>
                    
<script>
//import draggable from "vuedraggable";
export default {
  setup() {},
  components: {},
  data() {
    return {
      chipIndex: [],
      selitem: "",
      selectval: [],
    };
  },
  props: ["chipList", "selectChip"],
  methods: {
    chisInxToVal() {
      this.selectval = [];
      this.selectChip.forEach((element) => {
        this.selectval.push(this.chipList[element]);
      });
      this.$emit("selectChips", this.selectval);
    },
  },

  watch: {
    selectChip() {
      this.chisInxToVal();
    },
  },
};
</script>
