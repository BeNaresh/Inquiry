<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="600px">
      <template v-slot:activator="{ on, attrs }">
        <v-icon
          v-bind="attrs"
          size="13px"
          style="
            color: black;
            margin-left: 10px;
            margin-right: 15px;
            margin-top: 15x;
            padding: 2px;
            border: 1px solid black;
            border-radius: 2px;
          "
          v-on="on"
          @click="myopen()"
        >
          mdi-filter
        </v-icon>
      </template>

      <v-card>
        <v-row
          style="
            padding: 0;
            margin: 0;
            background-color: lightgray;
            box-shadow: 0px 3px 1px -2px rgb(0 0 0 / 20%),
              0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%);
          "
        >
          <v-col
            md="6"
            style="
              margin: 0;
              padding: 0;
              border-bottom: 1px solid gray;
              box-shadow: 0px 1px 10px #999;
            "
            ><v-card-title
              ><div
                style="margin-bottom: 0; padding-bottom: 0; text-align: left"
              >
                Inquiry Settings
              </div>
            </v-card-title>
          </v-col>
          <v-col md="6" style="margin: 0; padding: 0; padding-top: 7px">
            <v-tabs v-model="tab" align-with-title>
              <v-tab v-for="item in items" :key="item">
                {{ item }}
              </v-tab>
            </v-tabs>
          </v-col>
        </v-row>
        <v-col sm="5" md="12" style="margin: 0; padding: 0; margin-top: 10px">
          <v-tabs-items v-model="tab">
            <v-tab-item v-for="item in items" :key="item">
              <v-card-text
                v-if="item == 'shopping'"
                style="margin: 0; padding: 0"
              >
                <listBox
                  :hederVal="listHeader"
                  :defltHeader="myval"
                  @removeList="listChange($event)"
                  @headerList="headerListCha($event)"
                />
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="dialog = false">
                    Close
                  </v-btn>
                  <v-btn color="blue darken-1" text @click="headerChange()">
                    Save
                  </v-btn>
                </v-card-actions>
              </v-card-text>

              <v-card-text v-if="item == 'web'" style="margin: 0; padding: 0">
                <v-card-title align="left">Open Date</v-card-title>
                <v-row>
                  <v-col md="6" offset-md="3" align="center">
                    <v-form ref="form" v-model="valid" lazy-validation>
                      <v-select
                        v-model="selDateRange"
                        :items="dateRangeItems"
                        label="Date Range"
                        dense
                        outlined
                        @change="selDateRangeChg()"
                      ></v-select>
                      <span v-if="selDateRange == 'Range'">
                        <v-menu
                          ref="menu"
                          v-model="menu"
                          :close-on-content-click="false"
                          :return-value.sync="dates"
                          transition="scale-transition"
                          offset-y
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-model="dateRangeText"
                              append-icon="mdi-calendar"
                              readonly
                              label="Start Date & End Date"
                              v-bind="attrs"
                              dense
                              outlined
                              v-on="on"
                            />
                          </template>
                          <v-date-picker v-model="dates" no-title range>
                            <v-spacer></v-spacer>
                            <v-btn text color="primary" @click="menu = false">
                              Cancel
                            </v-btn>
                            <v-btn
                              text
                              color="primary"
                              @click="$refs.menu[0].save(dates)"
                            >
                              OK
                            </v-btn>
                          </v-date-picker>
                        </v-menu></span
                      >
                      <div v-if="selDateRange == 'Last N Days'">
                        <v-text-field
                          v-model="message4"
                          label="Days"
                          dense
                          clearable
                          min="1"
                          type="number"
                          outlined
                          @click:append-outer="myfun()"
                        >
                          <v-tooltip
                            slot="append-outer"
                            append-outer-icon="mdi-information"
                            bottom
                          >
                            <template v-slot:activator="{ on, attrs }">
                              <v-icon
                                color="primary"
                                v-bind="attrs"
                                v-on="on"
                                @click="scrollTo(0)"
                                >mdi-information</v-icon
                              >
                            </template>
                            <span
                              style="
                                max-width: 300px;
                                display: block;
                                word-wrap: break-word;
                              "
                              >fdsfsf sdsfdsfsad sdfdsafasd dsfadsf fdsdsfas
                              ssdfasfs sdsfsafas sdfsadsa sddsfsa sdfasf
                            </span>
                          </v-tooltip>
                        </v-text-field>
                      </div>
                    </v-form>
                  </v-col>
                </v-row>
                <v-card-title align="left">Status</v-card-title>
                <listBox
                  :hederVal="sortList"
                  :defltHeader="selectSort"
                  @removeList="removeSortChan($event)"
                  @addList="addSortchan($event)"
                />
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="dialog = false">
                    Close
                  </v-btn>
                  <v-btn color="blue darken-1" text @click="headerChange()">
                    Save
                  </v-btn>
                </v-card-actions>
              </v-card-text>
            </v-tab-item>
          </v-tabs-items>
        </v-col>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import { bus } from "./main";
import listBox from "./components/listBox.vue";
export default {
  data() {
    return {
      tab: 1,

      dialog: false,
      selectedItem01: "",
      selectedItem: "",
      myval: [],
      listHeader: [],
      selitem: null,
      items: ["web", "shopping"],

      // filter Valibles start
      dateRangeItems: ["All", "Range", "Last N Days"],
      selDateRange: "All",
      dateRangeSel: false,
      menu: false,
      dates: [],

      sortList: [
        {
          value: "Awaiting",
          text: "Awaiting",
          id: 1,
        },
        {
          value: "In Progress",
          text: "In Progress",
          id: 2,
        },
        {
          value: "Received",
          text: "Received",
          id: 3,
        },
        {
          value: "Closed",
          text: "Closed",
          id: 4,
        },
      ],
      selectSort: [],
      // filter Valibles end
    };
  },
  components: {
    listBox,
  },
  computed: {
    dateRangeText: function () {
      return this.dates[0] ? this.dates.join(" To ") : "";
    },
  },
  props: ["hederVal", "defltHeader"],

  methods: {
    //filter methods start
    myfun() {
      alert("fdsfds");
    },
    removeSortChan(list) {
      console.log("removeSortChan" + JSON.stringify(list));
    },
    addSortchan(list) {
      console.log("addSortchan" + JSON.stringify(list));
    },
    headerListCha(list) {
      this.myval = list;
    },
    listChange(list) {
      this.listHeader = list;
    },
    selDateRangeChg() {
      if (this.selDateRange == "Range") {
        this.dateRangeSel = true;
      }
    },
    save(dates) {
      console.log(this.$refs.menu[0].save);
      this.$refs.menu[0].save(dates);
    },
    //filter methods end

    mySeleitem(index) {
      this.selitem = this.listHeader[index];
      this.listHeader.splice(index, 1);

      this.myval.push(this.selitem);
      this.selectedItem = "";

      //alert(JSON.stringify(index));
    },

    myopen() {
      this.myval = [];
      this.listHeader = [];
      this.defltHeader.forEach((item) => {
        this.myval.push(item);
      });
      this.hederVal.forEach((item) => {
        this.listHeader.push(item);
      });
      bus.$emit("headerRest", true);
    },
    headerChange() {
      bus.$emit("headerChange", this.myval);
      bus.$emit("defulheader", this.listHeader);
      this.dialog = false;
    },
  },
};
</script>
<style scoped>
.v-card__title {
  padding-bottom: 0px;
  padding-top: 0px;
  font-size: 1rem;
}
>>> .v-tabs-bar {
  height: 25px;
}

>>> .v-slide-group,
.v-tabs-bar {
  border-radius: 5px 0 0 0 !important;
  border-left: 1px gray solid;
  border-top: 1px gray solid;
  box-shadow: 0px 1px 10px #999;
}

>>> .v-slide-group__content,
.v-tabs-bar__content {
  height: 25px;
}
</style>
