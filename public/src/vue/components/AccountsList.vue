<template>
  <div class="m_accountsList" @click.self="$root.hideAccountsList">
    <button type="button" class="m_accountsList--closeButton" @click="$root.hideAccountsList">
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        width="52px"
        height="52pxpx"
        viewBox="0 0 16 16"
        style="enable-background:new 0 0 16 16;"
        xml:space="preserve"
      >
        <polyline class="st0" points="10,6 8,8 6,6 		" />
        <polyline class="st0" points="6,10 8,8 10,10 		" />
      </svg>
    </button>

    <div class="m_accountsList--content">
      <div class="m_accountsList--content--header">
        <h2>List of referenced accounts in the corpus</h2>
      </div>
      <div class="m_accountsList--content--search">
        <form id="search">
          Search this list:
          <input name="query" v-model="searchQuery" />
        </form>
      </div>

      <TableAccounts :heroes="gridData" :columns="gridColumns" :filter-key="searchQuery" />
    </div>
  </div>
</template>
<script>
import TableAccounts from "./TableAccounts.vue";

export default {
  props: {},
  components: {
    TableAccounts
  },
  data() {
    return {
      searchQuery: "",
      gridColumns: ["account", "category", "detail"],
      gridData: [
        {
          account: "@HadiPresident",
          category: "Government of Yemen",
          detail: "President Abdrabuh Mansour Hadi"
        },
        {
          account: "@DrMaeenSaeed",
          category: "Government of Yemen",
          detail: "Yemeni Prime Minister Dr. Maeen AbdulMalek Saeed"
        },
        {
          account: "@alimohsnalahmar",
          category: "Government of Yemen",
          detail: "Vice President of Yemen Ali Mohsn Alahmar"
        },
        {
          account: "@KhaledBahah",
          category: "Government of Yemen",
          detail: "(Former) Vice President, Prime Minister of Yemen"
        },
        {
          account: "@ahmedbindaghar",
          category: "Government of Yemen",
          detail: "(Former) Yemeni PM Dr. Ahmed Obaid Bin Daghar"
        },
        {
          account: "@KhaledAlyemany",
          category: "Government of Yemen",
          detail: "Minister of Foreign Affairs of the Republic of Yemen"
        },
        {
          account: "@BelovedAden",
          category: "Government of Yemen",
          detail:
            "Ambassador of Yemen to the USA, former PR to the UN , Secretary General of NDC, former CoS of the Presidential Office"
        },
        {
          account: "@RagehBakrit",
          category: "Government of Yemen",
          detail: "Sheikh Rajeh Saeed Bakrit, Governor of Mohar"
        },
        {
          account: "@ERYANIM",
          category: "Government of Yemen",
          detail:
            "Minister of Information and a member of the Advisory Board of Asian Youth Council"
        },
        {
          account: "@YaserAlraeeini",
          category: "Government of Yemen",
          detail:
            "Minister of State for implementing the national dialogue outcomes, Deputy Secretary General of the National Dialogue"
        },
        {
          account: "@FaragALbahsani",
          category: "Government of Yemen",
          detail: "Faraj Salimin al-Bahsani, Governor of Hadramout province"
        },
        {
          account: "@NasrTaha",
          category: "Government of Yemen",
          detail:
            "Advisor to the President of the Republic of Yemen Former Minister of Information"
        },
        {
          account: "@tarikyemen",
          category: "Other Yemeni stakeholders",
          detail:
            "Former President Ali Abdullah Saleh’s nephew, commander of Republican Guards forces in the west coast"
        },
        {
          account: "@SDwaid",
          category: "Other Yemeni stakeholders",
          detail:
            "Spokesperson of the national resistance Forces المتحدث الرسمي(Republican Guards بإسم قوات المقاومة الوطنية"
        },
        {
          account: "@HaniBinbrek",
          category: "Other Yemeni stakeholders",
          detail:
            "Vice President of the Presidency of the Southern Transitional Council"
        },
        {
          account: "@ahmed_binbreak",
          category: "Other Yemeni stakeholders",
          detail:
            "President of the National Assembly of the Southern Transitional Council - Major General Ahmed Said Ben Brik"
        },
        {
          account: "@Moh_Alhouthi",
          category: "Houthis",
          detail: "Chairman of the Supreme Revolutionary Committee"
        },
        {
          account: "@abdusalamsalah",
          category: "Houthis",
          detail: "The official spokesman of Ansar Allah"
        },
        {
          account: "@alejri77",
          category: "Houthis",
          detail: "Member of the Political Council of Ansar Allah"
        }
      ]
    };
  },
  created() {},
  mounted() {
    document.body.style.overflow = "hidden";
  },
  beforeDestroy() {
    document.body.style.overflow = "auto";
  },
  watch: {},
  computed: {},
  methods: {}
};
</script>
<style lang="scss">
.m_accountsList {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1000;

  background-color: rgba(238, 238, 238, 0.2);
  backdrop-filter: blur(10px);

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  .m_accountsList--content {
    /* Probably need media queries here */
    width: 1020px;
    max-width: 90%;
    overflow: auto;

    height: 800px;
    max-height: 100%;
    background: white;
    box-shadow: 0 5px 20px -10px rgba(0, 0, 0, 0.5);

    cursor: auto;
    // border: 2px solid var(--active-color);

    .m_accountsList--content--header {
      margin: 10px 20px;
    }

    .m_accountsList--content--search {
      margin: 10px 20px;
    }
  }
}

.m_accountsList--closeButton {
  position: absolute;
  top: 0;
  right: 0;
  width: 52px;
  height: 52px;
  // font-size: 4em;

  svg {
    width: 100%;
    height: 100%;
    padding: 0;
  }

  polyline {
    stroke: #000;
    fill: transparent;
  }
}
</style>
