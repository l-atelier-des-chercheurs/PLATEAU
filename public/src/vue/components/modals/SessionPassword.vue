

<template>
  <Modal
    @close="$emit('close')"
    @submit="submitPassword"
    :read_only="false"
    :typeOfModal="'EditMeta'"
    :prevent_close="true"
  >
    <template slot="header">
      <span class>{{ $t('connect_to_dodoc') }}</span>
    </template>

    <template slot="sidebar">
      <div class="margin-bottom-small">
        <label>{{ $t('password') }}</label>
        <input type="password" v-model="pwd" required autofocus autoselect />
      </div>
    </template>

    <template slot="submit_button">{{ $t('send') }}</template>
  </Modal>
</template>
<script>
import Modal from "./BaseModal.vue";

export default {
  props: {},
  components: {
    Modal
  },
  data() {
    return {
      pwd: "",
      remember_password_on_this_device: false
    };
  },

  created() {},
  mounted() {},
  beforeDestroy() {},

  watch: {},
  computed: {},
  methods: {
    submitPassword() {
      if (this.remember_password_on_this_device) {
        this.$auth.saveSessionPasswordToLocalStorage(this.pwd);
      }

      this.$socketio.connect(this.pwd);
      this.$emit("close");
    }
  }
};
</script>
<style>
</style>