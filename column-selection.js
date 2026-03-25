// @ts-check

const allColumnNames = [
  ...new Set(Object.values(data).flatMap((analyt) => Object.keys(analyt))),
];

const allAnalyts = Object.keys(data);

/** @type {typeof import('vue')} */
var Vue = window.Vue;

const { createApp } = Vue;

createApp({
  template: `<h3>Analyts</h3>
<ul>
  <li v-if="analyts.length >= 2">
    <button type="button" @click="analyts = []">Delete all</button>
  </li>

  <li v-for="analyt of analyts">
    <button type="button" @click="removeAnalyt(analyt)">X</button>
    {{analyt}}
  </li>
  <li>
    +
    <select :value="" @input="addAnalyt">
      <option />
      <option
        v-for="analyt of allAnalyts.filter(analyt => !analyts.includes(analyt))"
      >
        {{analyt}}
      </option>
    </select>
  </li>
</ul>

<template v-for="column of getActiveColumnNames()" v-if="analyts.length > 0">
  <h3>{{column}}</h3>

  <table v-for="valueIndex of getActiveValueIndexes(column)" :key="valueIndex">
    <tr>
      <th />
      <th>{{valueTitles[valueIndex]}}</th>
    </tr>
    <tr v-for="(analyt, analytIndex) of getSortedAnalyts(column, valueIndex)" :key="analyt">
      <td>{{analyt}}</td>
      <td :class="getCellClass(column, valueIndex, analytIndex)">
        {{data[analyt][column][valueIndex] == null ? fallbackDisplayString : data[analyt][column][valueIndex]}}
      </td>
    </tr>
  </table>
</template>`,
  data() {
    return {
      valueTitles,
      allColumnNames,
      data,
      allAnalyts,
      analyts: allAnalyts.slice(0, 1),
      fallbackDisplayString,
    };
  },
  methods: {
    getNumberValue(analyt, column, valueIndex) {
      const rawValue = this.data[analyt][column][valueIndex]
      if (typeof rawValue === 'number') return rawValue;
      if (typeof rawValue !== 'string') return null;
    
      const value = parseFloat(rawValue.replace(',', '.'))
      return Number.isNaN(value) ? null : value;
    },
    getActiveColumnNames() {
      return this.allColumnNames.filter(column => this.getActiveValueIndexes(column).length)
    },
    getActiveValueIndexes(column) {
      return this.valueTitles.flatMap((_title, valueIndex) => {
        return this.analyts.some(analyt => this.data[analyt][column][valueIndex])
          ? [valueIndex]
          : []
      })
    },
    getSortedAnalyts(column, valueIndex) {
      const getValue = analyt => {
        const value = this.getNumberValue(analyt, column, valueIndex)
        return value == null ? Infinity : value;
      }
      return [...this.analyts].sort((a,b) => getValue(a) - getValue(b))
    },
    getCellClass(column, valueIndex, analytIndex) {
      if (analytIndex === 0) return undefined;
      const sortedAnalyts = this.getSortedAnalyts(column, valueIndex);
      const analyt = sortedAnalyts[analytIndex];
      const value = this.getNumberValue(analyt, column, valueIndex)
      if (typeof value !== 'number') return undefined

      const analytBefore = sortedAnalyts[analytIndex - 1];
      const valueBefore = this.getNumberValue(analytBefore, column, valueIndex)
      if (typeof valueBefore !== 'number') return undefined
      
      const diff = value - valueBefore;
      return diff >= diffTolerance ? 'csaGreen' : 'csaRed';
    },
    addAnalyt(event) {
      const analyt = event.target.value;
      if (analyt && !this.analyts.includes(analyt)) {
        this.analyts.push(analyt);
      }
    },
    removeAnalyt(analyt) {
      this.analyts = this.analyts.filter((it) => it !== analyt);
    },
  },
}).mount("#csa");
