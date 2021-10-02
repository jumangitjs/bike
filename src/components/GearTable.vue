<template>
  <div>
    <div class="table-header columns is-vcentered is-centered">
      <div class="columns is-vcentered">
        <span class="column table-header-label">
          Gear Combination #{{ index + 1 }}
        </span>
        <v-swatches
          class="column"
          v-model="selectedColour"
          show-fallback
          fallback-input-type="color"
          popover-x="right"
          v-on:close="changeInputGears()"
        ></v-swatches>
      </div>
      <b-tooltip
        class="column is-narrow"
        label="Close gear combination"
        position="is-left"
      >
        <b-button
          v-if="showClose"
          @click="removeGearTable()"
          type="is-danger is-small"
          outlined
        >
          <b-icon pack="fas" icon="times"></b-icon>
        </b-button>
      </b-tooltip>
    </div>
    <!-- TODO create add new table for comparison -->
    <!-- TODO move to component -->
    <!-- TODO add table -->
    <div class="container">
      <span>
        this is a gear calculator table (speed calculation coming soon.)
      </span>
      <div>
        <ValidationObserver ref="div">
          <div class="columns is-vcentered is-centered">
            <b-dropdown
              class="column"
              v-model="selectedCassetteDropdown"
              aria-role="list"
              expanded
              @change="selectCassette"
            >
              <template #trigger="{ active }">
                <b-button
                  :label="
                    !selectedCassetteDropdown
                      ? 'Common cassettes'
                      : selectedCassetteDropdown
                  "
                  type="is-primary"
                  :icon-right="active ? 'menu-up' : 'menu-down'"
                />
              </template>

              <b-dropdown-item
                v-for="(cassette, index) in commonCassettes"
                :key="index"
                aria-role="listitem"
                :value="cassette.value"
              >
                {{ cassette.label }}
              </b-dropdown-item>
            </b-dropdown>

            <b-field class="column is-three-fifths">
              <ValidationProvider
                name="cassette"
                :rules="vvalidateRules"
                v-slot="{ errors }"
              >
                <b-input
                  v-model="cassette"
                  placeholder="Cassette Teeth (comma, space, dash separated)"
                  @input="changeInputGears('cassette')"
                  v-on:change="changeInputGears"
                  :pattern="inputStringPattern"
                ></b-input>
                <span>{{ errors[0] }}</span>
              </ValidationProvider>
            </b-field>
          </div>

          <div class="columns is-vcentered is-centered">
            <b-dropdown
              class="column"
              v-model="selectedChainringDropdown"
              aria-role="list"
              expanded
              @change="selectChainrings"
            >
              <template #trigger="{ active }">
                <b-button
                  :label="
                    !selectedChainringDropdown
                      ? 'Common chainrings'
                      : selectedChainringDropdown
                  "
                  type="is-primary"
                  :icon-right="active ? 'menu-up' : 'menu-down'"
                />
              </template>

              <b-dropdown-item
                v-for="(ring, index) in commonChainrings"
                :key="index"
                aria-role="listitem"
                :value="ring.value"
              >
                {{ ring.label }}
              </b-dropdown-item>
            </b-dropdown>

            <b-field class="column is-three-fifths">
              <ValidationProvider
                name="chainrings"
                :rules="vvalidateRules"
                v-slot="{ errors }"
              >
                <b-input
                  v-model="chainrings"
                  placeholder="Chainrings (comma, space, dash separated)"
                  @input="changeInputGears('chainring')"
                  v-on:change="changeInputGears"
                  :pattern="inputStringPattern"
                ></b-input>
                <span>{{ errors[0] }}</span>
              </ValidationProvider>
            </b-field>
          </div>
        </ValidationObserver>
      </div>

      <div>
        <!-- labels here what are your gears -->
        <!-- table here -->
        <p>
          {{ chainringArray.length }} x {{ cassetteArray.length }} ({{
            chainringArray.length * cassetteArray.length
          }}
          speed)
        </p>
        <!-- <p>save here?</p> -->
      </div>

      <div>
        <b-dropdown v-model="shownColumns" multiple aria-role="list">
          <template #trigger>
            <b-button type="is-primary" icon-right="menu-down">
              Columns Shown ({{ shownColumns.length }})
            </b-button>
          </template>
          <b-dropdown-item
            v-for="(item, index) in columnsDropdown"
            :key="index"
            :value="item.field"
            aria-role="listitem"
          >
            <span>{{ item.label }}</span>
          </b-dropdown-item>
        </b-dropdown>
        <b-table
          :data="data"
          ref="multiSortTable"
          :backend-sorting="backendSortingEnabled"
          @sort="sortPressed"
          @sorting-priority-removed="sortingPriorityRemoved"
          :sort-multiple="multiColumnSortingEnabled"
          :sort-multiple-data="sortingPriority"
          :sort-multiple-key="customKey"
          :mobile-cards="false"
          narrowed
          hoverable
        >
          <b-table-column
            v-for="column in columns1"
            :key="column.field"
            :field="column.field"
            :label="column.label"
            :sortable="column.sortable"
            :visible="getColumnVisibility(column.field)"
            v-slot="props"
            centered
          >
            {{ props.row[column.field] }}
          </b-table-column>

          <b-table-column
            field="gear_number"
            label="Gear Number"
            sortable
            v-slot="props"
            :visible="getColumnVisibility('gear_number')"
            centered
            width="50"
          >
            {{ props.row.gear_number }}
          </b-table-column>

          <b-table-column
            field="ring"
            label="Chainring"
            sortable
            v-slot="props"
            :visible="getColumnVisibility('ring')"
            centered
          >
            <b-tag
              :type="props.row.ring_number % 2 ? 'is-success' : 'is-danger'"
            >
              {{ `${props.row.ring}t (${props.row.ring_number})` }}
            </b-tag>
          </b-table-column>

          <b-table-column
            class="cog-row-container"
            field="cog"
            label="Cog"
            sortable
            v-slot="props"
            :visible="getColumnVisibility('cog')"
            centered
          >
            <b-tag
              type="is-success"
              v-bind:style="getCogTagStyle(props.row.cog)"
            >
              {{ `${props.row.cog}t (${props.row.cog_number})` }}
            </b-tag>
          </b-table-column>

          <b-table-column
            field="ratio"
            label="Ratio"
            sortable
            v-slot="props"
            :visible="getColumnVisibility('ratio')"
            centered
          >
            <b-tooltip
              label="The bigger the ratio, the heavier the gear. Heavy gear = harder to pedal."
              multilined
              position="is-bottom"
            >
              {{ props.row.ratio }}
            </b-tooltip>
          </b-table-column>

          <b-table-column
            field="diff_above"
            label="% Diff gear above"
            v-slot="props"
            :visible="getColumnVisibility('diff_above')"
            centered
          >
            <b-tooltip
              label="The bigger the % change, the feel of pedalling (cadence) will be drastic. Ideal % change is 10-15% per gear change."
              multilined
              position="is-bottom"
            >
              <b-tag
                v-if="!!props.row.diff_above"
                :type="
                  props.row.diff_above > 9 && props.row.diff_above < 16
                    ? 'is-success is-light'
                    : 'is-danger is-light'
                "
              >
                {{ props.row.diff_above }}%
              </b-tag>
            </b-tooltip>
          </b-table-column>
          <b-table-column
            field="diff_below"
            :visible="getColumnVisibility('diff_below')"
            label="% Diff gear below"
            v-slot="props"
            centered
          >
            <b-tooltip
              label="The bigger the % change, the feel of pedalling (cadence) will be drastic. Ideal % change is 10-15% per gear change."
              multilined
              position="is-bottom"
            >
              <b-tag
                v-if="!!props.row.diff_below"
                :type="
                  props.row.diff_below > 9 && props.row.diff_below < 16
                    ? 'is-success is-light'
                    : 'is-danger is-light'
                "
              >
                {{ props.row.diff_below }}%
              </b-tag>
            </b-tooltip>
          </b-table-column>
          <!-- speed here -->
        </b-table>
      </div>
    </div>
    <!-- chart here -->
  </div>
</template>

<script>
import orderBy from "lodash/orderBy";
import { ValidationProvider, ValidationObserver } from "vee-validate";
import VSwatches from "vue-swatches";

const columns = [
  // gear number
  // {
  //   field: "gear_number",
  //   label: "Gear Number",
  //   sortable: true,
  // },
];

// model
/**
 * chainring
 * cog
 * ratio
 * % diff up (from ratio)
 * % diff down (from ratio)
 */

export default {
  name: "GearTable",
  components: {
    ValidationProvider,
    ValidationObserver,
    VSwatches,
  },
  props: {
    index: Number,
    showClose: Boolean,
  },
  data() {
    return {
      customKey: null,
      columns1: columns,
      columnsDropdown: [
        ...columns,
        {
          field: "ratio",
          label: "Ratio",
        },
        {
          field: "cog",
          label: "Cog",
        },
        {
          field: "ring",
          label: "Chainring",
        },
        {
          field: "diff_above",
          label: "% Diff gear above",
        },
        {
          field: "diff_below",
          label: "% Diff gear below",
        },
        // speed here
      ],
      shownColumns: ["gear_number", "ratio", "ring", "cog", "diff_above"],
      backendSortingEnabled: true,
      multiColumnSortingEnabled: true,
      data: [],
      sortingPriority: [],
      // actual
      inputStringPattern: "[\\d\\s\\-;,\\|]*",
      vvalidateRules: {
        required: true,
        regex: "^([\\d\\s\\-;,\\|]*)$",
      },
      chainrings: "50 34",
      cassette: "11-12-13-14-15-17-19-21-24-27-30",
      chainringArray: [],
      cassetteArray: [],
      // default data
      // label, value
      selectedColour: "#000000",
      selectedChainringDropdown: null,
      selectedCassetteDropdown: null,
      commonChainrings: [
        {
          label: "53 39 standard",
          value: "53 39",
        },
        {
          label: "52 36 semi-compact",
          value: "52 36",
        },
        {
          label: "50 34 compact",
          value: "50 34",
        },
        {
          label: "48 32 super compact",
          value: "48 32",
        },

        {
          label: "46 30 super compact",
          value: "46 30",
        },
      ],
      commonCassettes: [
        {
          label: "11-28 CS-R8000",
          value: "11-12-13-14-15-17-19-21-23-25-28",
        },
        {
          label: "11-30 CS-R8000",
          value: "11-12-13-14-15-17-19-21-24-27-30",
        },
        {
          label: "11-32 CS-HG500-10",
          value: "11-12-14-16-18-20-22-25-28-32",
        },
        {
          label: "12-28 CS-HG500-10",
          value: "12-13-14-15-17-19-21-23-25-28",
        },
        {
          label: "12-30 CS-6700 ",
          value: "12-13-14-15-17-19-21-24-27-30",
        },
        {
          label: "11-28 CS-HG400-9",
          value: "11-12-13-14-16-18-21-24-28",
        },
        {
          label: "11-32 CS-HG400-9",
          value: "11-12-14-16-18-21-24-28-32",
        },
        {
          label: "11-28 CS-HG50-8",
          value: "11-13-15-17-19-21-24-28",
        },
        {
          label: "11-28 CS-PG-1070-A1",
          value: "12,13,14,15,16,17,19,22,25,28",
        },
        {
          label: "11-42 CS-M4100-10",
          value: "11-13-15-18-21-24-28-32-37-42",
        },
        {
          label: "11-46 CS-M4100-10",
          value: "11-13-15-18-21-24-28-32-37-46",
        },
      ],
    };
  },
  computed: {
    getRawData() {
      return (this.chainringArray || [])
        .map((ring, ringIdx) =>
          (this.cassetteArray || []).map((cog, cogIdx) => ({
            ring,
            ring_number: ringIdx + 1,
            cog_number: cogIdx + 1,
            cog,
            ratio: (ring / cog).toFixed(3),
            hue: this.selectedColour,
          }))
        )
        .flat()
        .map(this.calculateDataRatioDiff)
        .map((data, idx) => ({
          ...data,
          gear_number: idx + 1,
        }))
        .sort((a, b) => a.gear_number - b.gear_number);
    },
  },
  methods: {
    changeInputGears(textBox = "") {
      // on change, change data
      switch (textBox) {
        case "cassette":
          this.selectedCassetteDropdown = null;
          break;
        case "chainring":
          this.selectedChainringDropdown = null;
          break;
      }
      this.verifyValidInput().then(() =>
        this.$emit("change-gears", this.getRawData)
      );
      this.loadAsyncData(this.sortingPriority);
    },

    async verifyValidInput() {
      return new Promise((res) => {
        setTimeout(() => {
          this.$refs.div.validate().then((dat) => {
            if (dat) {
              this.updateGearArray();
              this.data = [...this.getRawData];
              console.log("changed gears!");
            }
            res(dat);
          });
        }, 100);
      });
    },

    updateGearArray() {
      const digitRegex = /\d{1,}/g;
      this.chainringArray = this.chainrings
        .match(digitRegex)
        .map((i) => parseInt(i))
        .filter((i) => !!i)
        .sort((a, b) => a - b);
      this.cassetteArray = this.cassette
        .match(digitRegex)
        .map((i) => parseInt(i))
        .filter((i) => !!i)
        .sort((a, b) => b - a);
    },

    calculateDataRatioDiff(row, idx, arr) {
      const diff_below =
        idx === arr.length - 1
          ? undefined
          : this.computeRatioDiff(row.ratio, arr[idx + 1].ratio);
      const diff_above =
        idx === 0
          ? undefined
          : this.computeRatioDiff(row.ratio, arr[idx - 1].ratio, false);
      return {
        ...row,
        diff_above,
        diff_below,
      };
    },

    computeRatioDiff(ratio1 = 0.0, ratio2 = 0.0, isBelow = true) {
      return isBelow
        ? Math.abs((((ratio1 - ratio2) / ratio1) * 100).toFixed(3))
        : Math.abs((((ratio2 - ratio1) / ratio2) * 100).toFixed(3));
    },

    getCogTagStyle(cog) {
      return {
        backgroundColor: this.getCogColor(cog),
        color: "black",
      };
    },

    getCogColor(cog) {
      // append last colors, increment until 255, div via count.
      // const maxColor = 16711680; // hex of FF0000
      // const minColor = 44032; // hex of 00FF00
      // const diff = maxColor - minColor;
      const cogIndex = this.cassetteArray.indexOf(cog) + 1;
      const ratio = cogIndex / (this.cassetteArray.length || 0);
      // const actualcolor = parseInt((diff * ratio) + minColor).toString(16);

      return `rgba(255, 0, 100, ${ratio})`; //some hex color
    },

    selectCassette(value) {
      this.cassette = value;
      this.changeInputGears();
    },

    selectChainrings(value) {
      this.chainrings = value;
      this.changeInputGears();
    },

    getColumnVisibility(field) {
      // return this.hiddenColumns.findIndex((col) => col.field === field) === -1;
      // return this.hiddenColumns.indexOf(field) === -1;
      return this.shownColumns.indexOf(field) > -1;
    },

    resetPriority() {
      this.$refs.multiSortTable.resetMultiSorting();

      // reset local backend sorting
      if (this.backendSortingEnabled) {
        this.sortingPriority = [];
        this.loadAsyncData();
      }
    },

    // Backend sorting
    sortingPriorityRemoved(field) {
      this.sortingPriority = this.sortingPriority.filter(
        (priority) => priority.field !== field
      );
      this.loadAsyncData(this.sortingPriority);
    },

    sortPressed(field, order, event) {
      if (this.backendSortingEnabled) {
        if (this.multiColumnSortingEnabled) {
          if ((this.customKey && event[this.customKey]) || !this.customKey) {
            let existingPriority = this.sortingPriority.filter(
              (i) => i.field === field
            )[0];
            if (existingPriority) {
              existingPriority.order =
                existingPriority.order === "desc" ? "asc" : "desc";
            } else {
              // request sorted data from backend
              this.sortingPriority.push({ field, order });
            }
            this.loadAsyncData(this.sortingPriority);
          } else {
            // request regular sorted data from backend
            this.sortingPriority = []; // [{field, order}]
            this.loadAsyncData([{ field, order }]);
          }
        }
      }
    },

    // "API request" for data
    async loadAsyncData(sortingPriority = []) {
      let mockdata = JSON.parse(JSON.stringify(this.getRawData));
      // get data already sorted from the backend using sortingPriority
      // compute diff here
      this.data = orderBy(
        mockdata,
        sortingPriority.map((i) => i.field),
        sortingPriority.map((i) => i.order)
      ).map(this.calculateDataRatioDiff);
    },

    removeGearTable() {
      this.$emit("close-table");
    },

    randomHue() {
      // return "hsla(" + ~~(360 * Math.random()) + "," + "70%," + "60%, 1)";
      return ~~(360 * Math.random());
    },
    createHSL(hue = this.randomHue(), alpha = 1) {
      return `hsla(${hue}, 70%, 80%, ${alpha})`;
    },
    RGBtoHue(hexColor = "#000000") {
      let r = hexColor.slice(1, 3);
      let g = hexColor.slice(3, 5);
      let b = hexColor.slice(5, 7);
      r /= 255;
      g /= 255;
      b /= 255;
      let cmin = Math.min(r, g, b);
      let cmax = Math.max(r, g, b);
      let delta = cmax - cmin;
      let h = 0;
      if (delta == 0) h = 0;
      // Red is max
      else if (cmax == r) h = ((g - b) / delta) % 6;
      // Green is max
      else if (cmax == g) h = (b - r) / delta + 2;
      // Blue is max
      else h = (r - g) / delta + 4;

      h = Math.round(h * 60);
      // Make negative hues positive behind 360°
      if (h < 0) h += 360;
    },
  },
  created() {
    // this.data = JSON.parse(JSON.stringify(this.getRawData));
  },
  mounted() {
    this.changeInputGears();
  },
};
</script>

<style scoped>
.container {
  padding: 1rem 1rem;
}
</style>