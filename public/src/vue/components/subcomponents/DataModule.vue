<template>
  <div>
    <div v-if="data_current_subtype">
      <label>{{ data_current_subtype.text }}&nbsp;</label>
      <!-- <button
        type="button"
        class="c-active"
        @click="show_subtype_selector = !show_subtype_selector"
      >Edit</button>-->
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        width="16px"
        height="13px"
        viewBox="0 0 16 13"
        style="float: right;"
        xml:space="preserve"
      >
        <path
          fill="#1da1f2"
          class="st0"
          d="M16,1.5c-0.6,0.3-1.2,0.4-1.9,0.5c0.7-0.4,1.2-1,1.4-1.8c-0.6,0.4-1.3,0.6-2.1,0.8c-0.6-0.6-1.5-1-2.4-1
	C9.3,0,7.8,1.5,7.8,3.3c0,0.3,0,0.5,0.1,0.7C5.2,3.9,2.7,2.6,1.1,0.6c-0.3,0.5-0.4,1-0.4,1.7c0,1.1,0.6,2.1,1.5,2.7
	c-0.5,0-1-0.2-1.5-0.4l0,0c0,1.6,1.1,2.9,2.6,3.2C3,7.9,2.7,7.9,2.4,7.9c-0.2,0-0.4,0-0.6-0.1c0.4,1.3,1.6,2.3,3.1,2.3
	c-1.1,0.9-2.5,1.4-4.1,1.4c-0.3,0-0.5,0-0.8,0C1.5,12.4,3.2,13,5,13c6,0,9.3-5,9.3-9.3c0-0.1,0-0.3,0-0.4C15,2.8,15.6,2.2,16,1.5z"
        />
      </svg>
      <TopHashtags v-if="data_current_subtype.key === 'top_hashtags'" :media="media" />
    </div>
    <div v-else class="m_module--content_data--subtypeSelector">
      <label>Select a type of data to visualize</label>
      <button
        class="m_module--content_data--subtypeSelector--item"
        :class
        v-for="subtype in subtypes_available"
        :key="subtype.key"
        :disabled="!subtype.enabled"
        @click="setDataModuleSubtypeTo(subtype.key)"
      >
        <div class="content_data--subtypeSelector--item--title">{{ subtype.title }}</div>
        <span
          class="content_data--subtypeSelector--item--icon"
          v-if="!!subtype.svg"
          v-html="subtype.svg"
        ></span>
        <label class="content_data--subtypeSelector--item--text">{{ subtype.text }}</label>
        <label
          class="content_data--subtypeSelector--item--detail"
          v-if="subtype.hasOwnProperty('show_detail') && subtype.hasOwnProperty('detail')"
        >
          <button
            type="button"
            @click.stop="subtype.show_detail = !subtype.show_detail"
            :class="{ 'is--active' : subtype.show_detail }"
          >detail</button>
          <ul v-if="subtype.show_detail">
            <li v-for="(detail, index) in subtype.detail" :key="index">{{ detail }}</li>
          </ul>
        </label>
        <div class="content_data--subtypeSelector--item--origin">
          <template v-if="subtype.origin === 'twitter'">
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              width="16px"
              height="13px"
              viewBox="0 0 16 13"
              style="enable-background:new 0 0 16 13;"
              xml:space="preserve"
            >
              <path
                class="st0"
                d="M16,1.5c-0.6,0.3-1.2,0.4-1.9,0.5c0.7-0.4,1.2-1,1.4-1.8c-0.6,0.4-1.3,0.6-2.1,0.8c-0.6-0.6-1.5-1-2.4-1
                  C9.3,0,7.8,1.5,7.8,3.3c0,0.3,0,0.5,0.1,0.7C5.2,3.9,2.7,2.6,1.1,0.6c-0.3,0.5-0.4,1-0.4,1.7c0,1.1,0.6,2.1,1.5,2.7
                  c-0.5,0-1-0.2-1.5-0.4l0,0c0,1.6,1.1,2.9,2.6,3.2C3,7.9,2.7,7.9,2.4,7.9c-0.2,0-0.4,0-0.6-0.1c0.4,1.3,1.6,2.3,3.1,2.3
                  c-1.1,0.9-2.5,1.4-4.1,1.4c-0.3,0-0.5,0-0.8,0C1.5,12.4,3.2,13,5,13c6,0,9.3-5,9.3-9.3c0-0.1,0-0.3,0-0.4C15,2.8,15.6,2.2,16,1.5z"
              />
            </svg>
          </template>
        </div>
      </button>
    </div>

    <template v-else>
      <template v-if="data_current_subtype.key === 'general_pulse'">
        <img src="fake_viz.png" />
      </template>
      <template v-else-if="data_current_subtype.key === 'visual_content'">
        <img src="fake_viz_2.png" />
      </template>
      <template v-else-if="data_current_subtype.key === 'embed_tweet'">
        <img src="fake_viz_3.png" />
      </template>
    </template>
  </div>
</template>
<script>
import TopHashtags from "./viz_modules/TopHashtags.vue";

export default {
  props: {
    media: Object
  },
  components: { TopHashtags },
  data() {
    return {
      subtypes_available: [
        {
          key: "top_hashtags",
          enabled: true,
          title: "top hashtags",
          text: "list the most popular hashtags for a specific keyword",
          detail: [
            "by default: corpus/current day",
            "filters: keywords/time period"
          ],
          show_detail: false,
          origin: "twitter",
          svg: ``
        },
        {
          key: "top_tweets",
          enabled: false,
          title: "top tweets",
          text: "embed the most popular tweets for a time period",
          detail: [
            "by default: corpus/current day",
            "filters: keywords/time period"
          ],
          show_detail: false,
          origin: "twitter",
          svg: ``
        },
        {
          key: "social_media_pulse",
          enabled: false,
          title: "social media pulse",
          text: "volume of tweets over time and per type of actor",
          detail: [
            "by default: corpus/current day",
            "filters: keywords / time period"
          ],
          show_detail: false,
          origin: "twitter",
          svg: `
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="60.4px"
                height="52.1px" viewBox="0 0 60.4 52.1" style="enable-background:new 0 0 60.4 52.1;" xml:space="preserve">
                <path class="st0" d="M59.6,45.3H8V0.8C8,0.3,7.7,0,7.3,0C6.8,0,6.5,0.3,6.5,0.8v44.6H0.8c-0.4,0-0.8,0.3-0.8,0.8
                  c0,0.4,0.3,0.8,0.8,0.8h5.7v4.5c0,0.4,0.3,0.8,0.8,0.8c0.4,0,0.8-0.3,0.8-0.8v-4.5h51.6c0.4,0,0.8-0.3,0.8-0.8
                  C60.4,45.7,60.1,45.3,59.6,45.3z"/>
                <path class="st0" d="M15.5,20.2c0.5,0,0.9-0.1,1.3-0.3l0.9,1.4c0.1,0.2,0.4,0.4,0.6,0.4c0.1,0,0.3,0,0.4-0.1
                  c0.4-0.2,0.5-0.7,0.3-1.1l-1.1-1.7c0.2-0.4,0.4-0.9,0.4-1.4c0-1.6-1.3-2.9-2.9-2.9s-2.8,1.3-2.8,2.9C12.6,18.9,13.9,20.2,15.5,20.2
                  z"/>
                <path class="st0" d="M15.5,30c1.6,0,2.9-1.3,2.9-2.9c0-0.4-0.1-0.7-0.2-1.1l1.6-1.4l5,8.3c0,0,0,0,0,0c-0.1,0.3-0.1,0.6-0.1,0.9
                  c0,1.6,1.3,2.9,2.9,2.9s2.9-1.3,2.9-2.8c0-0.3-0.1-0.6-0.1-0.9l3.4-3.7c0.3-0.3,0.3-0.8,0-1.1c-0.3-0.3-0.8-0.3-1.1,0l-3.2,3.4
                  c-0.5-0.4-1.1-0.7-1.8-0.7c-0.7,0-1.3,0.2-1.7,0.6l-4.8-8l4.6-4c0.5,0.5,1.2,0.9,2,0.9c0.3,0,0.7-0.1,1-0.2l8.3,9.3
                  c-0.1,0.3-0.1,0.5-0.1,0.8c0,1.6,1.3,2.9,2.9,2.9c1.6,0,2.9-1.3,2.9-2.9c0-0.3,0-0.5-0.1-0.8l8.2-7.7c0.3,0.2,0.7,0.2,1.1,0.2
                  c1.6,0,2.9-1.3,2.9-2.9c0-1.6-1.3-2.9-2.9-2.9s-2.9,1.3-2.9,2.9c0,0.6,0.2,1.2,0.5,1.6l-7.8,7.3c-0.5-0.5-1.2-0.7-1.9-0.7
                  s-1.4,0.3-1.9,0.7l-1.5-1.7l1.8-1.9c0.5,0.3,1,0.5,1.6,0.5c1.6,0,2.9-1.3,2.9-2.9c0-0.6-0.2-1.1-0.4-1.5l8-8c0.5,0.3,1,0.5,1.7,0.5
                  c1.6,0,2.9-1.3,2.9-2.9s-1.3-2.9-2.9-2.9c-1.6,0-2.9,1.3-2.9,2.9c0,0.4,0.1,0.8,0.2,1.1l-8.2,8.2c-0.4-0.2-0.8-0.3-1.2-0.3
                  c-1.6,0-2.9,1.3-2.9,2.9c0,0.4,0.1,0.8,0.2,1.1l0,0l-1.8,1.9l-5.4-6c0.4-0.5,0.6-1.1,0.6-1.8c0-1.6-1.3-2.9-2.9-2.9
                  s-2.9,1.3-2.9,2.9c0,0.2,0,0.4,0.1,0.6l-5.3,4.6l0,0l-2.2,1.9c-0.5-0.4-1.1-0.6-1.7-0.6c-1.6,0-2.9,1.3-2.9,2.9S13.9,30,15.5,30z"
                  />
              </svg>
            `
        },
        {
          key: "topics_pulse",
          enabled: false,
          title: "topics pulse",
          text:
            "volume of tweets over time and per topics – most frequent co-occurences",
          detail: [
            "by default: corpus/current day",
            "filters: keywords / time period"
          ],
          show_detail: false,
          origin: "twitter",
          svg: `
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="60.4px"
                height="52.1px" viewBox="0 0 60.4 52.1" style="enable-background:new 0 0 60.4 52.1;" xml:space="preserve">
                <path class="st0" d="M59.6,45.3H8V0.8C8,0.3,7.7,0,7.3,0C6.8,0,6.5,0.3,6.5,0.8v44.6H0.8c-0.4,0-0.8,0.3-0.8,0.8
                  c0,0.4,0.3,0.8,0.8,0.8h5.7v4.5c0,0.4,0.3,0.8,0.8,0.8c0.4,0,0.8-0.3,0.8-0.8v-4.5h51.6c0.4,0,0.8-0.3,0.8-0.8
                  C60.4,45.7,60.1,45.3,59.6,45.3z"/>
                <path class="st0" d="M15.5,20.2c0.5,0,0.9-0.1,1.3-0.3l0.9,1.4c0.1,0.2,0.4,0.4,0.6,0.4c0.1,0,0.3,0,0.4-0.1
                  c0.4-0.2,0.5-0.7,0.3-1.1l-1.1-1.7c0.2-0.4,0.4-0.9,0.4-1.4c0-1.6-1.3-2.9-2.9-2.9s-2.8,1.3-2.8,2.9C12.6,18.9,13.9,20.2,15.5,20.2
                  z"/>
                <path class="st0" d="M15.5,30c1.6,0,2.9-1.3,2.9-2.9c0-0.4-0.1-0.7-0.2-1.1l1.6-1.4l5,8.3c0,0,0,0,0,0c-0.1,0.3-0.1,0.6-0.1,0.9
                  c0,1.6,1.3,2.9,2.9,2.9s2.9-1.3,2.9-2.8c0-0.3-0.1-0.6-0.1-0.9l3.4-3.7c0.3-0.3,0.3-0.8,0-1.1c-0.3-0.3-0.8-0.3-1.1,0l-3.2,3.4
                  c-0.5-0.4-1.1-0.7-1.8-0.7c-0.7,0-1.3,0.2-1.7,0.6l-4.8-8l4.6-4c0.5,0.5,1.2,0.9,2,0.9c0.3,0,0.7-0.1,1-0.2l8.3,9.3
                  c-0.1,0.3-0.1,0.5-0.1,0.8c0,1.6,1.3,2.9,2.9,2.9c1.6,0,2.9-1.3,2.9-2.9c0-0.3,0-0.5-0.1-0.8l8.2-7.7c0.3,0.2,0.7,0.2,1.1,0.2
                  c1.6,0,2.9-1.3,2.9-2.9c0-1.6-1.3-2.9-2.9-2.9s-2.9,1.3-2.9,2.9c0,0.6,0.2,1.2,0.5,1.6l-7.8,7.3c-0.5-0.5-1.2-0.7-1.9-0.7
                  s-1.4,0.3-1.9,0.7l-1.5-1.7l1.8-1.9c0.5,0.3,1,0.5,1.6,0.5c1.6,0,2.9-1.3,2.9-2.9c0-0.6-0.2-1.1-0.4-1.5l8-8c0.5,0.3,1,0.5,1.7,0.5
                  c1.6,0,2.9-1.3,2.9-2.9s-1.3-2.9-2.9-2.9c-1.6,0-2.9,1.3-2.9,2.9c0,0.4,0.1,0.8,0.2,1.1l-8.2,8.2c-0.4-0.2-0.8-0.3-1.2-0.3
                  c-1.6,0-2.9,1.3-2.9,2.9c0,0.4,0.1,0.8,0.2,1.1l0,0l-1.8,1.9l-5.4-6c0.4-0.5,0.6-1.1,0.6-1.8c0-1.6-1.3-2.9-2.9-2.9
                  s-2.9,1.3-2.9,2.9c0,0.2,0,0.4,0.1,0.6l-5.3,4.6l0,0l-2.2,1.9c-0.5-0.4-1.1-0.6-1.7-0.6c-1.6,0-2.9,1.3-2.9,2.9S13.9,30,15.5,30z"
                  />
              </svg>
            `
        },
        {
          key: "topics_and_actors",
          enabled: false,
          title: "topics and actors",
          text:
            "list of most frequent co-occurences visualized per type of actors",
          detail: [
            "by default: corpus/current day",
            "filters: keywords / time period"
          ],
          show_detail: false,
          origin: "twitter",
          svg: ``
        },
        {
          key: "visual_content",
          enabled: false,
          title: "visual content",
          text: "associated visual content of top tweets",
          detail: [
            "by default: corpus/current day/20 tweets",
            "filters: keywords/time period/#tweets"
          ],
          show_detail: false,
          origin: "twitter",
          svg: `
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="53.6px"
	 height="45.4px" viewBox="0 0 53.6 45.4" style="enable-background:new 0 0 53.6 45.4;" xml:space="preserve">
  <path class="st0" d="M0,17.6h25.8V0H0V17.6z"/>
  <path class="st0" d="M27.8,17.6h25.8V0H27.8V17.6z"/>
  <path class="st0" d="M0,28.9h38.1v-9.3H0V28.9z"/>
  <path class="st0" d="M40.1,45.2h13.5V19.6H40.1V45.2z"/>
  <path class="st0" d="M0,45.2l13.8,0.2V30.9H0V45.2z"/>
  <path class="st0" d="M15.8,45.2h22.3V30.9H15.8V45.2z"/>
</svg>
            `
        },
        {
          key: "news_links",
          enabled: false,
          title: "news links",
          text: "Up to 10 most shared (retweet + like) news links",
          detail: [
            "by default: corpus/current day",
            "filters: keywords/time period"
          ],
          show_detail: false,
          origin: "twitter",
          svg: ``
        },
        {
          key: "top_pushers",
          enabled: false,
          title: "top pushers",
          text:
            "list of top accounts that publish original content – organized per type of actor",
          detail: [
            "by default: corpus/current day",
            "filters: keywords/time period"
          ],
          show_detail: false,
          origin: "twitter",
          svg: ``
        },
        {
          key: "top_influencers",
          enabled: false,
          title: "top influencers",
          text:
            "list of top influential accounts organized per type of actor – retweets,likes and comments",
          detail: [
            "by default: corpus/current day",
            "filters: keywords/time period"
          ],
          show_detail: false,
          origin: "twitter",
          svg: ``
        },
        {
          key: "social_graph",
          title: "social graph",
          text: "Accounts relations per type of actors",
          detail: ["filters: accounts/tweet url"],
          show_detail: false,
          origin: "twitter",
          svg: ``
        },
        {
          key: "embed_tweet",
          enabled: false,
          title: "embed a tweet",
          text:
            "embed a tweet and metadata – most associated terms in comments, retweets, likes",
          detail: ["requires a tweet url"],
          show_detail: false,
          origin: "twitter",
          svg: ``
        },
        {
          key: "tweet_lifecycle",
          enabled: false,
          title: "tweet lifecycle",
          text: "activity from a tweet overtime per type of actor",
          detail: ["requires a tweet url"],
          show_detail: false,
          origin: "twitter",
          svg: ``
        }
      ]
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    data_current_subtype() {
      if (!this.media.dataviz_type) {
        return false;
      }
      return this.subtypes_available.find(
        s => s.key === this.media.dataviz_type
      );
    }
  },
  methods: {
    setDataModuleSubtypeTo(key) {
      console.log(`DataModule • text-change by user`);
      this.$emit("updateSubtype", key);
    }
  }
};
</script>
<style lang="scss">
.m_module--content_data--subtypeSelector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  grid-gap: var(--spacing);

  > label {
    color: var(--active-color);
    grid-column: 1/3;
    margin-bottom: 0;
    // border-bottom: 1px solid currentColor;
  }

  .m_module--content_data--subtypeSelector--item {
    position: relative;
    flex: 0 1 50%;
    background-color: var(--active-color);
    border-radius: 4px;
    color: white;

    display: flex;
    flex-flow: row wrap;
    align-items: flex-start;
    align-content: flex-start;

    // padding: var(--spacing);
    padding: 0 var(--spacing);
    // padding: 0;

    &[disabled] {
      // background-color: var(--active-color);
      // filter: grayscale(0%);

      > * {
        pointer-events: none;
      }
    }

    .content_data--subtypeSelector--item--icon {
      flex: 0 0 90px;
      margin: var(--spacing) calc(var(--spacing) * 1);

      svg {
        width: 60px;
        height: 50px;
      }
    }

    .content_data--subtypeSelector--item--title {
      font-variant: initial;
      text-transform: uppercase;
      font-weight: 700;
      font-size: 0.8em;
      flex: 1 1 100%;
      padding: var(--spacing) 0;
      margin: 0 calc(var(--spacing) * 2);
      border-bottom: 1px solid currentColor;
    }

    .content_data--subtypeSelector--item--text {
      flex: 1 1 10ch;
      margin: var(--spacing) calc(var(--spacing) * 1);
      text-align: left;
    }

    .content_data--subtypeSelector--item--detail {
      flex: 1 1 100%;
      margin: var(--spacing);
      margin-top: 0;

      button {
        text-decoration: underline;
      }

      ul {
        display: block;
        list-style: none;
        margin: 0;
        padding: 0;

        li {
          &:before {
            content: "—";
            display: inline-block;
            vertical-align: baseline;
          }
        }
      }
    }

    .content_data--subtypeSelector--item--origin {
      position: absolute;
      top: 0;
      right: 0;
      margin: var(--spacing);
    }

    svg {
      stroke-width: 1px;

      path,
      ellipse,
      circle,
      polyline,
      line,
      rect {
        fill: white;
      }
    }
  }
}
</style>
