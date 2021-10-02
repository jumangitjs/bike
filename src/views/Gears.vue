<template>
  <div class="container">
    <!-- TODO create add new table for comparison -->
    <!-- TODO move to component -->
    <!-- TODO add table -->

    <b-tooltip
      class="is-narrow button-add"
      label="Add gear table"
      position="is-left"
    >
      <b-button @click="addGearTable">
        <b-icon pack="fas" icon="plus"></b-icon>
      </b-button>
    </b-tooltip>
    <!-- chart here -->
    <div class="columns overflow-x-scroll">
      <div class="column" v-for="(table, index) in tables" :key="table.id">
        <GearTable
          v-bind:index="index"
          v-bind:show-close="tables.length > 1"
          v-on:change-gears="updateTable($event, table.id)"
          v-on:close-table="removeGearTable(table.id)"
        ></GearTable>
      </div>
    </div>
    <BikeLineChart
      :chartData="chartData"
      :options="chartOptions"
    ></BikeLineChart>
  </div>
</template>

<script>
import GearTable from "../components/GearTable.vue";
import BikeLineChart from "../components/BikeLineChart.js";

export default {
  components: { GearTable, BikeLineChart },
  data: () => ({
    chartData: {},
    chartOptions: {
      responsive: true,
      maintainAspectRatio: false,
    },
    datacollection: null,
    tables: [],
  }),
  methods: {
    updateTable(data, index) {
      this.tables = [
        ...this.tables.map((table) => {
          if (table.id === index) {
            return { ...table, gears: data };
          }
          return { ...table };
        }),
      ];
      this.fillData();
      // this.chartData = {
      //   datasets: [
      //     {
      //       label: 'he',
      //       data: [
      //         { x: 1, y: 1 },
      //         { x: 2, y: 2 },
      //       ],
      //     },
      //     {
      //       label: 'ho',
      //       data: [
      //         { x: 1, y: 2 },
      //         { x: 2, y: 3 },
      //       ],
      //     },
      //   ],
      // };
    },
    fillData() {
      // add options on x data
      // y data automatically ratio
      //https://stackoverflow.com/questions/28180871/grouped-bar-charts-in-chart-js

      const datasets = this.tables
        .map(({ gears }, index) => {
          const hue = gears[0]?.hue || this.randomHue();

          return [...new Set(gears.map((gear) => gear.ring).flat())]
            .sort()
            .map((ring_) => {
              const label = `Gear Combination #${index + 1} - ${ring_}t Ring`;
              const data = gears
                .filter(({ ring }) => ring_ === ring)
                .map(({ ratio }) => ratio);

              return {
                label,
                data,
                fill: false,
                hue,
              };
            });
        })
        .map((rawDatasets) =>
          rawDatasets.map((rawDataset, index, arr) => {
            const increment = 100 * ((index + 1) / arr.length);
            // const color = this.createHSL(rawDataset.hue, increment / 100);
            const r = parseInt(rawDataset.hue.slice(1, 3), 16);
            const g = parseInt(rawDataset.hue.slice(3, 5), 16);
            const b = parseInt(rawDataset.hue.slice(5, 7), 16);
            const color = `rgba(${r}, ${g}, ${b}, ${increment / 100})`;
            return {
              label: rawDataset.label,
              backgroundColor: color,
              borderColor: color,
              data: rawDataset.data,
              fill: rawDataset.fill,
            };
          })
        )
        .flat();

      const cogsArrays = this.tables
        .map(({ gears }) => [...new Set(gears.map(({ cog }) => cog))])
        .map((a) => a.length);

      const mostNumberOfCogs =
        cogsArrays[cogsArrays.indexOf(Math.max(...cogsArrays))];

      const labels = [
        ...Array(mostNumberOfCogs > 0 ? mostNumberOfCogs : 1),
      ].map((_, index) => index + 1);

      this.chartData = {
        labels,
        datasets,
      };
    },
    randomHue() {
      // return "hsla(" + ~~(360 * Math.random()) + "," + "70%," + "60%, 1)";
      return ~~(360 * Math.random());
    },
    createHSL(hue = this.randomHue(), alpha = 1) {
      return `hsla(${hue}, 70%, 80%, ${alpha})`;
    },
    addGearTable() {
      this.tables = [
        ...this.tables,
        {
          id: Date.now(),
          gears: [],
        },
      ];
    },
    removeGearTable(id) {
      this.tables = [...this.tables.filter((table) => table.id !== id)];
      this.fillData();
    },
  },
  mounted() {
    this.fillData();
    this.tables.push({
      id: Date.now(),
      gears: [],
    });
  },
};
</script>

<style scoped>
.overflow-x-scroll {
  overflow-x: auto;
}

.table-header {
  text-align: center;
}

.table-header-label {
  font-size: 24px;
  font-weight: 500;
  margin: auto 24px;
}

.button-add {
  margin: 24px auto;
}
</style>