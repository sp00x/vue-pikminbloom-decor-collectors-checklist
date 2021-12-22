<template>
  <span class="cb">
    <!--
    <input
      type="checkbox"
      :indeterminate="indeterminate"
      :checked="checked"
      @click="cycleState"
    -->
    <!--
    <span @dblclick="cycleState(null)" @click="cycleState(false)" v-if="this.state === true">✅</span>
    <span                               @click="cycleState(false)" v-else-if="this.state === null">🌱</span>
    <span @dblclick="cycleState(null)" @click="cycleState(true)" v-else>✖</span>
    -->
    <span @click="cycleState(null)"  v-if="this.state === true"><slot name="checked">✅</slot></span>
    <span @click="cycleState(false)" v-else-if="this.state === null"><slot name="indeterminate">🌱</slot></span>
    <span @click="cycleState(true)"  v-else><slot name="unchecked">✖</slot></span>
  </span>
</template>

<script>
export default {
  name: "Checkbox3",
  props: ["value"],
  data() {
    return {
      state: false,
    };
  },
  computed: {
    checked() {
      return this.state === null ? undefined : this.state;
    },
    indeterminate() {
      return this.state === null ? true : undefined;
    },
  },
  methods: {
    cycleState(target) {
      if (target === undefined) {
        if (this.state === false) {
          this.state = true;
        } else if (this.state === true) {
          this.state = null;
        } else {
          this.state = false;
        }
      } else {
        this.state = target;
      }
      this.$emit("input", this.state);
    },
  },
  mounted() {
    this.state = this.value;
  },
};
</script>

<style lang="scss" scoped>
.cb {
  user-select: none;
  > * {
    width: 1.5em;
    text-align: center;
    display: inline-block;
  }
}
</style>