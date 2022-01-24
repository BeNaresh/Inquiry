<template>
  <v-container>
    <v-row>
      <v-col md="5" align="center">
        <v-card
          class="px-2 ml-6"
          color="grey lighten-3"
          style="overflow: auto; float: left"
          height="250px"
          width="230px"
        >
          <v-list dense style="background: none">
            <v-list-item-group v-model="selectedItem" color="success">
              <draggable
                class="list-group"
                :list="headerVal"
                group="people"
                @change="log"
              >
                <v-list-item
                  v-for="(item, i) in headerVal"
                  :key="item.text"
                  link
                  @click="mySeleitem(i)"
                  class="text-left ma-1 rounded"
                  style="background-color: ; height: 5px"
                >
                  <v-list-item-content style="text-align: left">
                    <v-list-item-title
                      ><b class="text-uppercase">{{ item.text }}</b>
                      <v-icon class="float-right" style="color: green"
                        >mdi-forward</v-icon
                      ></v-list-item-title
                    >
                  </v-list-item-content>
                </v-list-item>
              </draggable>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-col>
      <v-col md="5">
        <v-card
          class="px-3 ml-6"
          color="grey lighten-3"
          style="overflow: auto; float: left"
          height="250px"
          width="230px"
        >
          <v-list dense style="background: none">
            <v-list-item-group v-model="selectedItem01" color="red">
              <draggable
                class="list-group"
                :list="defaultHeader"
                group="people"
                @change="log"
              >
                <v-list-item
                  v-for="(item, i) in defaultHeader"
                  :key="item.text"
                  @click="removeItem(i)"
                  class="text-left my-1 rounded"
                  style="background-color: ; height: 5px"
                >
                  <v-list-item-content>
                    <v-list-item-title
                      ><b class="text-uppercase">{{ item.text }}</b>
                      <v-icon class="float-right" style="color: red"
                        >mdi-close-circle-outline</v-icon
                      ></v-list-item-title
                    >
                  </v-list-item-content>
                </v-list-item>
              </draggable>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
                    
                <script>
import draggable from "vuedraggable";
export default {
  setup() {},
  components: {
    draggable,
  },
  data() {
    return {
      selitem: "",
    };
  },
  props: ["headerVal", "defaultHeader"],
  methods: {
    removeItem(index) {
      const removeite = this.defaultHeader[index];
      this.defaultHeader.splice(index, 1);
      this.headerVal.push(removeite);
      this.$emit("removeList", this.headerVal);
      this.$emit("addList", this.defaultHeader);
    },
    mySeleitem(index) {
      this.selitem = this.headerVal[index];
      this.headerVal.splice(index, 1);
      this.defaultHeader.push(this.selitem);
      this.$emit("addList", this.defaultHeader);
      this.$emit("removeList", this.headerVal);
    },
  },
};
</script>
