// @ts-check

const allColumnNames = [
  ...new Set(Object.values(data).flatMap((analyt) => Object.keys(analyt))),
];

const allAnalyts = Object.keys(data);

/** @type {typeof import('vue')} */
var Vue = window.Vue;

const { createApp } = Vue;

createApp({
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
