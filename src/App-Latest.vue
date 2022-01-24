<template>
  <div class="v-inquiries">
    <v-app>
      <v-card>
        <!-- header tag is expected by portals-ui, used for widget reordering / drag-and-drop -->
        <header class="module-header bp-widget-head">
          <v-system-bar window color="#ffffff">
            <v-toolbar-title>Inquiries &amp; Departure Records</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn x-small elevation="2">
              <v-icon class="ma-0" small> {{ icons.addInquiry }}</v-icon
              >ADD
            </v-btn>
            <v-col class="d-flex pt-10 dropDown" sm="3">
              <v-select
                v-model="userSelOption"
                :items="userSelList"
                @change="userSelection()"
                item-text="text"
                item-value="value"
                solo
                label="Filled style"
              ></v-select
            ></v-col>
            <span>
              <filter-view
                :headerVal="headerList"
                :defaultHeader="headers"
                :filterList="filterList"
                :filterDepartureList="filterDepartureList"
                :departureSelectList="departureSelectList"
                :filterSelect="filterSelect"
                :shopSelcetList="shopSelcetList"
                @changeFilList="changeFilList($event)"
                @changeFilSelect="changeFilSelect($event)"
                @chageShopList="chageShopList"
                @changeDepFilSelect="changeDepartureFilSelect($event)"
                @selectedDates="selectedDates($event)"
                @headerChange="headerChange($event)"
                @defulheader="defulheader($event)"
              ></filter-view
            ></span>
            <v-menu offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-bind="attrs"
                  v-on="on"
                  small
                  class="rounded d-block outLine"
                >
                  {{ icons.settings }}
                </v-icon>
              </template>
              <v-list dense>
                <v-list-item
                  v-for="(item, index) in settingsItems"
                  :key="index"
                  @click="item.action"
                >
                  <v-list-item-icon>
                    <v-icon>{{ item.icon }}</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>{{ item.label }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-system-bar>
        </header>

        <div ref="body">
          <v-data-table
            dense
            fixed-header
            item-key="id"
            :headers="headers"
            class="elevation-1"
            :items="importStatusData"
            :loading="isInquiries"
            hide-default-header
            loading-text="fetching Premieres and Pre-Pinned Placements"
            :footer-props="{
              showFirstLastPage: true,
              itemsPerPageOptions: [],
              firstIcon: '',
              lastIcon: '',
              prevIcon: '',
              nextIcon: '',
            }"
          >
            <template v-slot:header="{ props: { headers } }">
              <thead
                v-sortable-table="{
                  onEnd: sortTheHeadersAndUpdateTheKey,
                }"
                :key="anIncreasingNumber"
              >
                <tr>
                  <th
                    v-for="item in headers"
                    :key="item.value"
                    @click="changeSort(item.value)"
                    @mouseover="headerName = item.value"
                    @mouseleave="headerName = 'ghgh'"
                    :style="{ backgroundColor: item.color }"
                    class="column"
                  >
                    {{ item.text }}
                    <v-icon
                      v-if="
                        item.value == headerName &&
                        item.value != headerColmunName
                      "
                      color="#b3b0b0"
                      small
                      >{{ "mdi-arrow-down" }}</v-icon
                    >
                    <v-icon v-if="item.value == headerColmunName" small>{{
                      sortAsc
                        ? "mdi-sort-alphabetical-ascending"
                        : "mdi-sort-alphabetical-descending"
                    }}</v-icon>
                  </th>
                </tr>
              </thead></template
            >
            <template v-slot:footer.page-text>
              <v-container>
                <v-row>
                  <v-col
                    cols="12"
                    style="
                      padding-bottom: 0px;
                      padding-left: 0px;
                      padding-right: 0px;
                      padding-top: 7px;
                    "
                  >
                    <v-btn
                      class="ma-2"
                      text
                      icon
                      :disabled="currentPageNumber == 1 ? true : false"
                      color="red lighten-2"
                    >
                      <v-icon @click="getPageleftServerData()">
                        {{ icons.leftArrow }}
                      </v-icon>
                    </v-btn>
                    Page:- {{ currentPageNumber }}

                    <v-btn class="ma-2" text icon color="red lighten-2">
                      <v-icon @click="getPageRightServerData()">
                        {{ icons.rightArrow }}
                      </v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </template>
          </v-data-table>
        </div>
      </v-card>
    </v-app>
  </div>
</template>

<script lang="ts">
import api from "./api";

import FilterView from "./components/filterView.vue";
import Sortable from "sortablejs";
import {
  mdiPlusThick,
  mdiCog,
  mdiChevronLeftCircle,
  mdiChevronRightCircle,
} from "@mdi/js";

// Dragable Table headers
function watchClass(targetNode, classToWatch) {
  let lastClassState = targetNode.classList.contains(classToWatch);
  const observer = new MutationObserver((mutationsList) => {
    for (let i = 0; i < mutationsList.length; i++) {
      const mutation = mutationsList[i];
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        const currentClassState =
          mutation.target.classList.contains(classToWatch);
        if (lastClassState !== currentClassState) {
          lastClassState = currentClassState;
          if (!currentClassState) {
            mutation.target.classList.add("sortHandle");
          }
        }
      }
    }
  });
  observer.observe(targetNode, { attributes: true });
}

export default {
  name: "data table",
  //better name would be something like GE_InquiriesWidget

  components: {
    "filter-view": FilterView,
  },
  directives: {
    "sortable-table": {
      inserted: (el, binding) => {
        el.querySelectorAll("th").forEach((draggableEl) => {
          // Need a class watcher because sorting v-data-table rows asc/desc removes the sortHandle class
          watchClass(draggableEl, "sortHandle");
          draggableEl.classList.add("sortHandle");
        });
        Sortable.create(
          el.querySelector("tr"),
          binding.value ? { ...binding.value, handle: ".sortHandle" } : {}
        );
      },
    },
  },

  data() {
    return {
      widgetController: null, // initialized in mounted()
      prefs: {
        perspective: null,
      },

      //TABLE HEADER SORT VARIBLES
      headerColmunName: "engineModel",
      headerName: "",
      sortAsc: true,
      sortType: "engineModel:asc",

      // table footer varibles satrt
      isInquiries: false,
      pageSize: 10,
      currentPageNumber: 1,
      anIncreasingNumber: 1,
      pageRightEnd: 0,
      totalPageNubmers: 0,
      // table footer varibles end
      shopSelcetList: [],

      userSelList: [
        { text: "Submitted By My Company", value: "submitted-by-my-org" },
        { text: "Submitted By Me", value: "submitted-by-me" },
      ],
      userSelOption: "submitted-by-my-org",

      menuSizes: ["Expand", "Export"],

      headerList: [],

      headers: [
        {
          text: "engineModel",
          value: "engineModel",
        },
        { text: "esn", value: "esn" },
        {
          text: "ataNumber",
          value: "ataNumber",
        },
        { text: "status", value: "status" },
      ],

      importStatusData: [],
      backupTableData: [],
      seletedDates: [],

      filterList: [
        {
          value: "AwaitingCustResponse",
          text: "Awaiting",
          id: 0,
        },
        {
          value: "InProgress",
          text: "In Progress",
          id: 1,
        },
        {
          value: "Received",
          text: "Received",
          id: 2,
        },
        {
          value: "Closed",
          text: "Closed",
          id: 3,
        },
      ],
      filterDepartureList: [
        {
          value: "AwaitingCustResponse",
          text: "Awaiting",
          id: 0,
        },
        {
          value: "InProgress",
          text: "In Progress",
          id: 1,
        },
        {
          value: "Received",
          text: "Received",
          id: 2,
        },
        {
          value: "Closed",
          text: "Closed",
          id: 3,
        },
        {
          value: "AwaitingCustResponse",
          text: "Awaiting",
          id: 4,
        },
        {
          value: "InProgress",
          text: "In Progress",
          id: 5,
        },
        {
          value: "Received",
          text: "Received",
          id: 6,
        },
        {
          value: "Closed",
          text: "Closed",
          id: 7,
        },
      ],
      filterSelect: [],
      departureSelectList: [],
      icons: {
        addInquiry: mdiPlusThick,
        settings: mdiCog,
        rightArrow: mdiChevronRightCircle,
        leftArrow: mdiChevronLeftCircle,
      },
    };
  },

  async created() {
    await this.getInqueryesData();
    await this.sortHeader();
    await api.getShopList();
  },

  methods: {
    chageShopList(shopList) {
      this.shopSelcetList = shopList;
      this.currentPageNumber = 1;
      this.getInqueryesData();
    },
    changeSort(clum) {
      this.headerName = "";
      if (this.headerColmunName != clum) {
        this.sortAsc = false;
      }
      this.sortAsc = !this.sortAsc;
      this.sortType = this.sortAsc ? clum + ":asc" : clum + ":desc";
      this.headerColmunName = clum;
      console.log(this.headerColmunName + ":" + this.sortType);
      this.currentPageNumber = 1;
      this.getInqueryesData();
    },
    // table footer methods start

    getPageRightServerData() {
      this.currentPageNumber += 1;

      this.getInqueryesData();
    },
    getPageleftServerData() {
      this.currentPageNumber -= 1;
      if (this.currentPageNumber >= 1) {
        this.getInqueryesData();
      }
    },

    // table footer methods end

    async getInqueryesData() {
      const serverData = new URLSearchParams();

      serverData.append("page", this.currentPageNumber);
      serverData.append("pagesize", this.pageSize);
      serverData.append("sort", this.sortType);

      this.filterSelect.forEach((item) => {
        serverData.append("case-status", item.value);
      });
      this.departureSelectList.forEach((item) => {
        serverData.append("dr-workflow-status", item.value);
      });
      /*  this.shopSelcetList.forEach((item) => {
        serverData.append("shop", item.value);
      }); */
      serverData.append("display-mode", this.userSelOption);
      if (this.seletedDates.length != 0) {
        serverData.append("created-on-after", this.seletedDates[0]);
        serverData.append("created-on-before", this.seletedDates[1]);
      }

      this.isInquiries = true;
      await api.getInquiriesWithstatus(serverData).then((response) => {
        this.importStatusData = response["inquiries"];
        this.isInquiries = false;
      });
    },

    sortTheHeadersAndUpdateTheKey(evt) {
      const headersTmp = this.headers;
      const oldIndex = evt.oldIndex;
      const newIndex = evt.newIndex;
      if (newIndex >= headersTmp.length) {
        let k = newIndex - headersTmp.length + 1;
        while (k--) {
          headersTmp.push(undefined);
        }
      }
      headersTmp.splice(newIndex, 0, headersTmp.splice(oldIndex, 1)[0]);
      this.table = headersTmp;
      this.anIncreasingNumber += 1;
    },

    userSelection() {
      this.getInqueryesData();
    },

    headerChange(sortItems) {
      this.headers = sortItems;
    },
    defulheader(sortItems) {
      this.headerList = sortItems;
    },

    changeFilList(flList) {
      this.filterList = flList;
    },
    selectedDates(selDates) {
      this.seletedDates = selDates;
    },
    changeFilSelect(flSlList) {
      this.filterSelect = flSlList;
      this.currentPageNumber = 1;
    },
    changeDepartureFilSelect(depFlList) {
      this.departureSelectList = depFlList;
      this.currentPageNumber = 1;
    },
    /*  blockSize() {
      this.minSize = 12;
    }, */

    async deftData() {
      await this.getInqueryesData();
    },
    defaultHeartSort(item) {
      let sendVal = false;
      for (var i = 0; i < this.headers.length; i++) {
        if (this.headers[i].text == item) {
          sendVal = true;
        }
      }
      return sendVal;
    },
    sortHeader() {
      let keys = Object.keys(this.importStatusData[1]);
      this.headerList = [];
      keys.forEach((i) => {
        let caseVal = false;
        caseVal = this.defaultHeartSort(i);
        if (caseVal != true) {
          const item = {
            value: i,
            text: i,
            align: "center",
            class: "header",
          };
          this.headerList.push(item);
        }
      });
    },
    defaultHeader(item) {
      let sendVal = false;
      for (var i = 0; i < this.headers.length; i++) {
        if (this.headers[i].text == item) {
          sendVal = true;
        }
      }
      return sendVal;
    },
  }, // end 'methods'
};
</script>

<style scoped>
>>> .v-input__control {
  min-height: 10px !important;
  padding-right: 0 !important;
  padding-left: 6 !important;
  font-size: 12px !important;
}
>>> .v-input__slot {
  height: 20px !important;
  padding-right: 0px !important;
  padding-left: 6px !important;
  font-size: 12px !important;
}
>>> .v-label {
  font-size: 14px !important;
}
</style>