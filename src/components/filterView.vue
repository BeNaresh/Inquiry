<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="800px">
      <template v-slot:activator="{ on, attrs }">
        <v-icon
          v-bind="attrs"
          class="my-4 ml-4 mr-5 rounded d-block outLine"
          small
          v-on="on"
          @click="myopen()"
        >
          {{ icons.mdiFilter }}
        </v-icon>
      </template>

      <v-card>
        <v-row class="pa-0 ma-0">
          <v-col sm="3">
            <v-toolbar-title>Inquiry Settings</v-toolbar-title>
          </v-col>
          <v-col sm="8">
            <v-tabs v-model="tab" align-with-title>
              <v-tab v-for="item in tabList" :key="item">
                {{ item }}
              </v-tab>
            </v-tabs>
          </v-col>
        </v-row>
        <v-col sm="5" md="12">
          <v-tabs-items v-model="tab">
            <v-tab-item v-for="item in tabList" :key="item">
              <v-card-text v-if="item == 'Customize Columns'" class="pa-0 ma-0">
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="dialog = false">
                    Cancel
                  </v-btn>
                  <v-btn color="blue darken-1" text @click="headerChange()">
                    Save
                  </v-btn>
                </v-card-actions>
              </v-card-text>

              <v-card-text v-if="item == 'filtering'" class="pa-0 ma-0">
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
                              :append-icon="icons.mdiCalendarMonth"
                              readonly
                              label="Start Date & End Date"
                              hint="Please Select Start &amp; End Dates"
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
                            <v-btn text color="primary" @click="save(dates)">
                              OK
                            </v-btn>
                          </v-date-picker>
                        </v-menu></span
                      >
                      <div v-if="selDateRange == 'Last N Days'">
                        <v-text-field
                          v-model.number="selDays"
                          label="Days"
                          dense
                          clearable
                          min="1"
                          type="number"
                          outlined
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
                                >{{ icons.mdiInformationOutline }}</v-icon
                              >
                            </template>
                            <span
                              class="d-block"
                              style="max-width: 300px; word-wrap: break-word"
                              >Please enter a number between 1 and 180.
                            </span>
                          </v-tooltip>
                        </v-text-field>
                      </div>
                    </v-form>
                  </v-col>
                  <v-card class="col-md-12 mx-auto">
                    <v-card-text class="pa-0 ma-0">
                      Choose Inquires Status</v-card-text
                    >
                    <chip-select
                      :chipList="localfilterList"
                      :selectChip="fliterIndex"
                      @selectChips="changeFilter"
                    ></chip-select>

                    <v-card-text class="pa-0 ma-0">
                      Choose Departure Status</v-card-text
                    >
                    <chip-select
                      :chipList="localDepartureList"
                      :selectChip="departureIndex"
                      @selectChips="selectDepartureList"
                    ></chip-select>

                    <v-card-text class="pa-0 ma-0">
                      Choose Shop List<v-col
                        md="6"
                        offset-md="3"
                        align="center"
                      >
                        <v-text-field
                          v-model="searchText"
                          :append-icon="icons.mdiMagnify"
                          label="Search"
                          outlined
                          dense
                          hide-details
                        ></v-text-field></v-col
                    ></v-card-text>
                    <div class="ShopListOverFlow">
                      <chip-select
                        :chipList="filterLoadshopList"
                        :selectChip="selectShopeIndex"
                        @selectChips="selectShopList"
                      ></chip-select>
                    </div>
                  </v-card>
                </v-row>
                <v-row>
                  <v-col md="6" offset-md="6">
                    <v-card-actions>
                      <v-btn color="blue darken-1" text @click="closeDiloge()">
                        Cancel
                      </v-btn>
                      <v-btn color="blue darken-1" text @click="filterLtSave()">
                        Save
                      </v-btn>
                    </v-card-actions>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-tab-item>
          </v-tabs-items>
        </v-col>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import {
  mdiFilter,
  mdiInformationOutline,
  mdiCalendarMonth,
  mdiMagnify,
} from "@mdi/js";
import ChipSelect from "./chipSelect.vue";
export default {
  data() {
    return {
      tab: 0,
      dialog: false,
      selectedItem: "",
      defaultHeaders: [],
      selectDepartureItems: [],
      headersList: [],
      tabList: ["filtering", "Customize Columns"],
      //shoplist
      shopList: [],
      searchText: "",
      defaultShopList: [],
      // filter Valibles start
      dateRangeItems: ["All", "Range", "Last N Days"],
      selDateRange: "All",
      selDays: "",
      dateRangeSel: false,
      localDepartureList: [],
      departureIndex: [],

      menu: false,
      dates: [],

      selectSort: [],
      localfilterList: [],
      localfilterselectedList: [],
      fliterIndex: [],
      // filter Valibles end
      localDepartureSelectList: [],
      localShopselcetList: [],
      selectShopeIndex: [],
      icons: {
        mdiFilter,
        mdiInformationOutline,
        mdiCalendarMonth,
        mdiMagnify,
      },
    };
  },
  props: [
    "headerVal",
    "defaultHeader",
    "filterList",
    "filterDepartureList",
    "filterSelect",
    "departureSelectList",
    "shopSelcetList",
  ],
  components: {
    "chip-select": ChipSelect,
  },
  computed: {
    dateRangeText: function () {
      return this.dates[0] ? this.dates.join(" To ") : "";
    },
    filterLoadshopList() {
      return this.shopList.filter((post) => {
        this.selectShopeIndex = [];
        this.localDepartureSelectList = [];
        return post.text.toLowerCase().includes(this.searchText.toLowerCase());
      });
    },
  },
  methods: {
    selectDepartureList(list) {
      this.localDepartureSelectList = list;
    },
    selectShopList(list) {
      this.localShopselcetList = list;
    },
    loadShopList() {
      this.shopList = [];
      let shopList = [
        "ACSC - Container Place",
        "ACSC - East Edison Dr",
        "ACSC - Glades Dr",
        "ACSC - Symmes Rd",
        "ACSC Vendor - A.T.I.",
        "ACSC Vendor - BP Aerospace",
        "ACSC Vendor - CTL-Aerospace Inc.",
        "ACSC Vendor - Comp. Repair Tech.",
        "ACSC Vendor - GKN Aerospace Chem-tronics, Inc.",
        "ACSC Vendor - Jet Airwerks",
        "ACSC Vendor - Jet Aviation Spec.",
        "ACSC Vendor - KLM Eng and Maint",
        "ACSC Vendor - PAS Technologies Inc.",
        "ACSC Vendor - Praxair Surf. Tech",
        "ACSC Vendor - Propulsion Tech Intl",
        "ACSC Vendor - SKF Aero Bearing Service Center",
        "ACSC Vendor - Standard Aero Ltd",
        "ACSC Vendor - TWIN MRO",
        "ACSC Vendor - Tool Sales and Serv",
        "ACSC Vendor - Tube Processing Corp.",
        "ACSC Vendor - Turbine Controls Inc",
        "ACSC Vendor - Unison Engine Components",
        "ACSC Vendor - WGI",
        "ACSC Vendor - Windsor Air, E. Granby",
        "ACSC Vendor - Windsor Airmotive",
        "ACSC Vendor - Windsor Airmotive Asia PTE Ltd.",
        "Asian Compressor Technology Services CO, LTD",
        "Avio Group",
        "BP Aerospace",
        "CFAN Repair Station",
        "CFAN Repair Station",
        "CRMA",
        "Caledonian",
        "Celma",
        "Dallas",
        "Durham",
        "EGAT",
        "Eagle Services Asia",
        "Elano",
        "FTO - Victorville",
        "GE Aircraft Engines HQ",
        "GE Aviation Materials",
        "GE Aviation RTCOE",
        "GE OWS - CVG",
        "GE OWS - DFW",
        "GE OWS - KUL",
        "GE OWS - LHR",
        "GE OWS - MEA",
        "GE OWS - SEL",
        "GE OWS - XMN",
        "GEAM - CRT",
        "GEAM - TSS",
        "GEES - Strother",
        "GEES-P23",
        "GEES-P62",
        "GEEVES",
        "GHAE - HAI MRO",
        "GHAE - Meyer Tool R&O",
        "H+S Aviation",
        "HAECO Composite Structures (Jinjiang) Co.,Ltd",
        "Hispano-Suiza",
        "Hungary",
        "Industria de Turbopropulsores SA",
        "JAL",
        "Japan",
        "KLM",
        "Lafayette",
        "Lynn Repair Station",
        "MTU - Berlin",
        "MTU - Hannover",
        "MTU Aero Engines AG",
        "Malaysia",
        "McAllen",
        "Ontario",
        "Peebles",
        "SAFRAN AIRCRAFT ENGINES",
        "SKF",
        "SNECMA – Chatellerault",
        "SSAMC",
        "Snecma",
        "Snecma - Overhaul",
        "Snecma - SQY",
        "Standard Aero",
        "Taikoo Engine Services Xiamen LTD DBA TEXL",
        "Tri-Reman",
        "Unison EC - Terre Haute",
        "Wales",
        "Wales - GP",
        "Wales Vendor - Barnes Aero",
        "Wales Vendor - Nordam",
        "Wales Vendor - Windsor Airmotive",
        "Woodward",
      ];
      shopList.forEach((item, i) => {
        this.shopList.push({ text: item, value: item, id: i });
      });
    },
    myopen() {
      this.loadShopList();
      this.defaultHeaders = [];
      this.searchText = "";
      this.headersList = [];
      this.localfilterList = [];
      this.localDepartureList = [];
      this.localfilterselectedList = [];
      this.departureIndex = [];
      this.selectShopeIndex = [];
      this.localShopselcetList = [];
      this.shopSelcetList.forEach((item) => {
        this.localShopselcetList.push(item);
        this.selectShopeIndex.push(item.id);
      });
      this.departureSelectList.forEach((item) => {
        this.localDepartureSelectList.push(item);
        this.departureIndex.push(item.id);
      });
      this.fliterIndex = [];
      this.defaultHeader.forEach((item) => {
        this.defaultHeaders.push(item);
      });
      this.headerVal.forEach((item) => {
        this.headersList.push(item);
      });
      this.filterList.forEach((item) => {
        this.localfilterList.push(item);
      });
      this.filterSelect.forEach((item) => {
        this.localfilterselectedList.push(item);
        this.fliterIndex.push(item.id);
      });
      this.filterDepartureList.forEach((item) => {
        this.localDepartureList.push(item);
      });
    },
    headerChange() {
      this.$emit("headerChange", this.defaultHeaders);
      this.$emit("defulheader", this.headersList);

      this.dialog = false;
    },
    //filter methods start
    closeDiloge() {
      this.selDateRange = "All";
      this.dates = [];
      this.selDays = "";
      this.dialog = false;
    },
    async filterLtSave() {
      this.$emit("changeFilList", this.localfilterList);
      if (this.dates.length != 0) {
        let changeDates = [];
        changeDates.push(this.dateConvt(this.dates[0]));
        changeDates.push(this.dates[1] + "T23:59:59.000Z");
        this.$emit("selectedDates", changeDates);
      } else if (this.selDays != "") {
        let chanDays = [];
        let currentDate = new Date(
          Date.now() - new Date().getTimezoneOffset() * 60000
        )
          .toISOString()
          .substr(0, 10);
        let changeDate = currentDate.split("-");
        let changeDays = new Date(
          changeDate[0],
          changeDate[1],
          changeDate[2] - this.selDays
        )
          .toISOString()
          .substr(0, 10);
        chanDays.push(this.dateConvt(changeDays));
        chanDays.push(
          new Date(
            Date.now() - new Date().getTimezoneOffset() * 60000
          ).toISOString()
        );
        this.$emit("selectedDates", chanDays);
      } else {
        this.$emit("selectedDates", []);
      }
      this.$emit("changeFilSelect", this.localfilterselectedList);
      this.$emit("changeDepFilSelect", this.localDepartureSelectList);
      this.$emit("chageShopList", this.localShopselcetList);
      this.dialog = false;
    },
    dateConvt(sendDate) {
      return new Date(sendDate).toISOString();
    },
    changeFilter(list) {
      //alert(JSON.stringify(list));
      this.localfilterselectedList = list;
    },

    addSortchan(list) {
      this.localfilterselectedList = list;
    },
    removeShopList(list) {
      this.shopList = list;
    },
    addShopList(list) {
      this.defaultShopList = list;
    },
    headerListCha(list) {
      this.defaultHeaders = list;
    },
    listChange(list) {
      this.headersList = list;
    },
    selDateRangeChg() {
      if (this.selDateRange == "Range") {
        this.dateRangeSel = true;
      }
      this.dates = [];
      this.selDays = "";
    },
    save(dates) {
      this.$refs.menu[0].save(dates);
    },
    //filter methods end
  },
};
</script>

<style scoped>
.outLine {
  border: solid 1px gray;
}

.ShopListOverFlow {
  max-height: 100px !important;
  overflow: auto;
}
/* .v-card__title {
  padding-bottom: 0px;
  padding-top: 0px;
  font-size: 1rem;
} */
/* >>> .v-tabs-bar {
  height: 25px;
} */

/* >>> .v-slide-group,
.v-tabs-bar {
  border-radius: 5px 0 0 0 !important;
  border-left: 1px gray solid;
  border-top: 1px gray solid;
  box-shadow: 0px 1px 10px #999;
}

>>> .v-slide-group__content,
.v-tabs-bar__content {
  height: 25px;
} */
</style>
