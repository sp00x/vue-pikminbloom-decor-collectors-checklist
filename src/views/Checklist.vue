<template>
  <div id="checklist">
    <div class="header">
      <div class="settingsBtn" @click="showSettings = !showSettings">☰</div>
      <div class="main">
        <h1 @click="filteredType = undefined">🌱 Pikmin Bloom Decor Checklist</h1>
        <div class="category">
          <div class="checklist">
            <div v-for="t in typesList" :key="`type_${t.id}`">
              <div class="checkbox">
                <div
                  @click="toggleFilteredType(t)"
                  class="typeCircle"
                  :class="{ selected: filteredType === t }"
                  :style="{ backgroundColor: t.color }"
                  :title="t.name"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="settings" v-if="showSettings">
      <p><b>Settings</b></p>
      <p>
        <label><input type="checkbox" v-model="settings.focusMissing"> focus on missing decor</label><br>
        <label><input type="checkbox" v-model="settings.orderAlphabetically"> order categories alphabetically</label><br>
        <label><input type="checkbox" v-model="settings.orderByAcquisition"> order types by in-game acquisition</label><br>
      </p>
      <p><b>Export data</b></p>
      <p>
        <a :href="exportEmailLink">Export</a>
      </p>
      <p><b>Import data</b></p>
      <p>
        <textarea class="importData" v-model="importDataInput"></textarea><br>
        <button @click="importData(importDataInput)">Import</button> 
      </p>

    </div>

    <div class="content" v-if="ready">
      <div class="category" v-for="c in filteredCategories" :key="c.id">
        <div class="categoryName">
          <div v-if="c.iconUrl" class="iconImage"><img :src="`img/category-icons/${c.iconUrl}`"></div>
          <div v-else class="icon">{{ c.icon }}</div>
          {{ c.name }}
        </div>
        <div class="decor" v-for="(d, di) in c.decor" :key="`${c.id}_${di}`">
          <div class="decorName">{{ d }}</div>
          <div class="checklist" v-if="!filteredType">
            <div v-for="t in typesList" :key="`type_${t.id}`">
              <div class="checkbox">
                <!-- <div
                  class="typeCircle"
                  :style="{ backgroundColor: t.color }"
                  :title="t.name"
                /> -->
                <Checkbox3
                  v-model="state.checklist[c.id][di][t.id]"
                  >
                  <template #checked>
                    <span class="checked" :style="{ color: t.color }">
                      <!--{{ `${c.icon}${String.fromCharCode(0xFE0F)}` }}-->
                      <div
                        v-if="!settings.focusMissing"
                        class="typeCircle"
                        style="margin-top: 0.2em"
                        :style="{ backgroundColor: t.color }"
                        />
                      <span v-else>✔</span>
                    </span>
                  </template>
                  <template #unchecked>
                    <span class="unchecked" :style="{ borderColor: t.color }">
                      <div
                        v-if="settings.focusMissing"
                        class="typeCircle"
                        style="margin-top: 0.2em"
                        :style="{ backgroundColor: t.color }"
                        />
                      <span v-else>✖</span>
                    </span>
                  </template>
                  <template #indeterminate>
                    <span class="indeterminate" :style="{ borderColor: t.color }">🌱</span>
                  </template>
                </Checkbox3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="exportImport">
        <!--
        <a href="#" @click.stop.prevent="exportData">Export</a> | 
        <a href="#" @click.stop.prevent="importData">Import</a>
        -->
      </div>
    </div>
  </div>
</template>

<script>
//const pako = require('pako');
//const msgpack = require('msgpack');
const JsonOptimize = require('json-optimize');
const JO = new JsonOptimize();
const gzip = require('gzip-js');

import Checkbox3 from "@/components/Checkbox3";
export default {
  name: "Checklist",
  components: {
    Checkbox3,
  },
  persist: ["state","settings"],
  data() {
    return {
      importDataInput: '',
      settings: {
        focusMissing: false,
        orderAlphabetically: false,
        orderByAcquisition: false
      },
      showSettings: false,
      ready: false,
      filteredType: undefined,
      state: {
        checklist: {},
      },
      types: [
        { id: "0", name: "Red", color: "#EA2119" },
        { id: "2", name: "Yellow", color: "#F7DB02" },
        { id: "1", name: "Blue", color: "#0071B9" },
        { id: "3", name: "White", color: "#DCD9D8" },
        { id: "4", name: "Purple", color: "#9D549C" },
        { id: "5", name: "Rock", color: "#666" },
        { id: "6", name: "Winged", color: "#FC89CD" },
      ],
      categories: [
        { id: "0", name: "Restaurant", icon: "🍴", decor: ["Chef hat"], iconUrl: "24px-Restaurant_icon.png" },
        { id: "1", name: "Café", icon: "☕", decor: ["Coffee cup"], iconUrl: "24px-Cafe_icon.png" },
        { id: "2", name: "Sweetshop", icon: "🍰", decor: ["Macaron"], iconUrl: "24px-Sweetshop_icon.png" },
        { id: "3", name: "Movie Theater", icon: "🎞", decor: ["Popcorn"], iconUrl: "24px-Movie_theater_icon.png" },
        { id: "4", name: "Pharmacy", icon: "⚕", decor: ["Toothbrush"], iconUrl: "24px-Pharmacy_icon.png" },
        { id: "5", name: "Zoo", icon: "🐘", decor: ["Dandelion"] , iconUrl: "24px-Zoo_icon.png" },
        {
          id: "6",
          name: "Forest",
          icon: "🌲",
          decor: ["Acorn", "Stag beetle"],
          iconUrl: "24px-Forest_icon.png"
        },
        { id: "7", name: "Waterside", icon: "🌊", decor: ["Fishing lure"], iconUrl: "24px-Waterside_icon.png" },
        { id: "8", name: "Post Office", icon: "✉", decor: ["Stamp"], iconUrl: "24px-Post_office_icon.png" },
        { id: "9", name: "Art Gallery", icon: "🖼", decor: ["Painting"], iconUrl: "24px-Art_gallery_icon.png" },
        { id: "10", name: "Airport", icon: "✈", decor: ["Toy airplane"], iconUrl: "24px-Airport_icon.png" },
        { id: "11", name: "Station", icon: "🚉", decor: ["Train papercraft"], iconUrl: "24px-Station_icon.png" },
        { id: "12", name: "Beach", icon: "🏖", decor: ["Shell"], iconUrl: "24px-Beach_icon.png" },
        { id: "13", name: "Mini-mart", icon: "🏪", decor: ["Bottle cap"], iconUrl: "24px-Mini_mart_icon.png" },
        {
          id: "14",
          name: "Supermarket",
          decor: ["Mushroom", "Banana"],
          icon: "🛒",
          iconUrl: "24px-Supermarket_icon.png"
        },
        { id: "15", name: "Bakery", icon: "🥖", decor: ["Baguette"], iconUrl: "24px-Bakery_icon.png" },
        { id: "16", name: "Hair Salon", icon: "✂", decor: ["Scissors"], iconUrl: "24px-Hair_salon_icon.png" },
        { id: "17", name: "Clothing Store", icon: "👚", decor: ["Hair tie"], iconUrl: "24px-Clothing_store_icon.png" },
        { id: "18", name: "Park", icon: "🏞", decor: ["Clover"], iconUrl: "24px-Park_icon.png" },
        { id: "19", name: "Special", icon: "❔", decor: ["Mario hat"] },
        { id: "20", name: "Roadside", icon: "Ⓟ", decor: ["Sticker"], iconUrl: "24px-Roadside_icon.png" },
      ],
    };
  },
  mounted() {
    console.log("checklist", this.state.checklist);
    if (
      this.state.checklist == null ||
      Object.keys(this.state.checklist).length === 0
    ) {
      let checklist = {};
      this.categories.forEach((cat) => {
        checklist[cat.id] = {};
        cat.decor.forEach((dec, di) => {
          checklist[cat.id][di] = {};
          this.types.forEach((ty, ti) => {
            checklist[cat.id][di][ti] = false;
          });
        });
      });
      this.state.checklist = checklist;
    }
    this.ready = true;
  },

  computed: {

    exportEmailLink() {
      return "mailto:?subject=Export&body=" + escape(this.exportedData)
    },

    exportedData() {
      let json = JSON.stringify(this.state);
      let gzipped = gzip.zip(json);
      let bin = gzipped.map(c => String.fromCharCode(c)).join("");
      let data = 'gz:' + btoa(bin);
      return data;
    },

    typesList() {
      let order = this.settings.orderByAcquisition ? ["0","1","2","4","3","6","5"] : ["0","1","2","3","4","5","6"];
      return order.map(o => this.types.find(t => t.id == o));
    },

    filteredCategories() {

      let categories;
      if (this.filteredType && this.ready) {
        let list = this.categories
          .map((cat) => {
            let copy = { ...cat };
            copy.decor = cat.decor.filter((decor, di) => {
              return (
                this.state.checklist[cat.id][di][this.filteredType.id] === false
              );
            });
            return copy.decor.length ? copy : null;
          })
          .filter((c) => c != null);
        categories = list;
      } else {
        categories = this.categories;
      }

      categories = [ ...categories ];
      if (this.settings.orderAlphabetically)
        categories.sort((a,b) => a.name.localeCompare(b.name));

      return categories;
    },
  },
  methods: {

    toggleFilteredType(t) {
      if (this.filteredType === t) {
        this.filteredType = undefined;
      } else {
        this.filteredType = t;
      }
    },

    exportData() {
      //let data = btoa(msgpack.pack(this.state));

      // let json = JSON.stringify(this.state);
      // let bin0 = gzip.zip(json);
      // let bin = bin0.map(c => String.fromCharCode(c)).join("");
      // let data = btoa(bin);

      //let data = btoa(gzip.zip(JSON.stringify(this.state)));

      let data = this.exportedData;
      
      //let data = JSON.stringify(JO.pack(this.state));
      prompt("Here's your exported data:", data);
    },

    importData(data) {
      if (data == null)
        data = prompt("Paste exported data from elsewhere:");
      if (data == null) return;
      try {

        let state;

        if (data.startsWith("gz:")) {
          let bin1 = atob(data.substr("gz:".length));
          let gzipped1 = bin1.split("").map(ch => ch.charCodeAt(0));
          let gunzipped1 = gzip.unzip(gzipped1);
          let json1 = gunzipped1.map(ch => String.fromCharCode(ch)).join("");
          state = JSON.parse(json1);
        } else {
          state = JO.unpack(JSON.parse(data));
        }
        
        //let state = JSON.parse(data);
        //let state = msgpack.unpack(atob(data))

        // debugger;
        // let bin = atob(data);
        // let bin0 = bin.split("").map(c => c.charCodeAt(0));
        // let json = gzip.unzip(bin0);
        // let state = JSON.parse(json);

//      let state = JSON.parse(gzip.unzip(atob(data)));

        if (state && typeof state === 'object' && state.checklist && typeof state.checklist === 'object') {
          if (confirm("This will overwrite all your data! Really continue?")) {
            this.state = state;
            // force redraw
            this.ready = false;
            this.$nextTick(() => {
              this.ready = true;
            })
            // this.state = state;
            //this.$set(this, 'state', state); 
            // for (let k in state) {
            //   this.state[k] = state[k];
            // }
          }
        } else {
          throw new Error("Invalid JSON data")
        }
      } catch (err) {
        alert("Oops, that doesn't look correct!\n" + err);
      }
    }
  },
};
</script>

<style lang="scss">
#checklist {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1 {
  font-size: 1em;
  text-align: center;
}

.header {
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #eee;
  z-index: 100;
  height: 5em;
  .main {
      padding: 0em 1em;
  }
  .settingsBtn {
    position: absolute;
    left: 0;
    top: 0;
    padding-left: 0.75em;
    padding-top: 1.75em;
    font-weight: heavy;
    font-size: 1.25em;
  }
}

.content {
  box-sizing: border-box;
  position: absolute;
  top: 7em;
  width: 100%;
  padding: 0em 1em;
}

.settings {
  a {
    color: white;
  }
  z-index: 100;
  background-color: rgba(0,0,0,0.95);
  color: white;
  box-sizing: border-box;
  position: fixed;
  top: 5em;
  width: 100%;
  padding: 1em 1em;
}

.category {
  padding-bottom: 1em;
  .categoryName {
    color: #333;
    font-weight: bold;
    .icon {
      text-align: center;
      display: inline-block;
      width: 1.5rem;
      color: #666;
    }
    .iconImage {
      display: inline-block;
      width: 1.5rem;
      img {
        max-width: 1rem;
        max-height: 1rem;
        filter: opacity(65%);
      }
    }
  }
  .decor {
    .decorName {
      padding-top: 0.5em;
      padding-left: 1.8rem;
      color: #666;
      font-weight: bold;
      font-size: 0.8em;
    }
  }
  .checklist {
    padding-left: 1.8rem;
    display: flex;
    flex-direction: row;
    > * {
      flex: 1;
      text-align: center;
    }
  }
}

.typeCircle {
  box-sizing: border-box;
  display: inline-block;
  width: 1em;
  height: 1em;
  border-radius: 1em;
  border: 1px solid black;
  &.selected {
    border-width: 2px;
    border-color: white;
    width: 1em;
    height: 1em;
    box-shadow: 0 0 8px 4px rgba(0,0,0,0.35);
  }
}

.exportImport {
  text-align: center;
  * {
    font-size: 0.85em;
    color: #999;
  }
  padding-top: 2em;
  padding-bottom: 2em;
}

.checked, .unchecked, .indeterminate {
  //text-shadow: 1px 1px 1px rgba(0,0,0,0.25)
  // border-width: 3px;
  // border-radius: 1em;
  // border-style: solid;
  // display: inline-block;
  // width: 1em;
  // height: 1em;
  // background-color: #eee;
  // font-size: 0.8em;
  // border-radius: 1em;
  // padding: 0.25em;
  //box-sizing: border-box;
}

.importData {
  width: 100%;
  height: 3em;
}

</style>
