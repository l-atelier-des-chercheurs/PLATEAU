export default {
  computed: {},
  methods: {
    formatDateToPrecise(date) {
      let options = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      };
      return new Date(date).toLocaleDateString(undefined, options);
    },
  },
};
