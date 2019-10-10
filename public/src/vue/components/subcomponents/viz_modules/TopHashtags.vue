<template>
  <div class>
    <form class="viz_input_fields" @submit.prevent="submitSearch">
      <label class="viz_input_fields--keywords">
        <span class="label">Keyword(s)</span>
        <input type="text" v-model="kwd" class="input_field" required autofocus autoselect />
      </label>
      <label class="viz_input_fields--keywords">
        <span class="label">Time range</span>
        <v-date-picker mode="range" class v-model="selectedDate"></v-date-picker>
      </label>
      <input
        type="submit"
        value="✓"
        :disabled="kwd !== 'Tez'"
        title="Must be 'Tez' and from 10/09/2019 to 24/09/2019 to work"
      />
    </form>
    <line-chart v-if="chart_data" :chart-data="chart_data"></line-chart>
  </div>
</template>
<script>
import LineChart from "./LineChart.js";

export default {
  props: {
    media: Object
  },
  components: {
    LineChart
  },
  data() {
    return {
      kwd: this.media.dataviz_search_keywords,
      selectedDate: {
        start: this.media.dataviz_search_period_start,
        end: this.media.dataviz_search_period_end
      }
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    "media.dataviz_search_keywords": function() {
      this.kwd = this.media.dataviz_search_keywords;
    },
    "media.dataviz_search_period_start": function() {
      this.dataviz_search_period_start = this.media.dataviz_search_period_start;
    },
    "media.dataviz_search_period_end": function() {
      this.dataviz_search_period_end = this.media.dataviz_search_period_end;
    }
  },
  computed: {
    dataviz_parsed_data() {
      if (!this.media.dataviz_raw_data) {
        return;
      }
      const str = this.media.dataviz_raw_data;
      var x = str.split("\n");
      for (var i = 0; i < x.length; i++) {
        const y = x[i].split("\t");
        x[i] = y;
      }
      if (!x) return;

      x = x.map(item => {
        return {
          label: item[0],
          data: Number(item[1])
        };
      });

      x = x.splice(0, 20);
      return x;
    },
    chart_data() {
      if (!this.dataviz_parsed_data) return;
      return {
        labels: this.dataviz_parsed_data.map(x => x.label),
        datasets: [
          {
            label: `Most popular hashtags`,
            data: this.dataviz_parsed_data.map(x => x.data),
            borderWidth: 1
          }
        ]
      };
    }
  },
  methods: {
    submitSearch() {
      this.$root.editMedia({
        type: "documents",
        slugFolderName: this.$root.do_navigation.current_slugDocumentName,
        slugMediaName: this.media.metaFileName,
        data: {
          dataviz_search_keywords: this.kwd,
          dataviz_search_period_start: this.selectedDate.start,
          dataviz_search_period_end: this.selectedDate.end,
          dataviz_raw_data: `
#اليمن	8368
#تعز	7940
#الحديدة	7369
#Yemen	4175
#العدوان_يخرق_اتفاق_السويد	2496
#مطار_ابها	2468
#الحوثي	2215
#أعيادنا_جبهاتنا	1148
#صنعاء	1127
#استهداف_مطار_أبها	897
#الأمم_المتحدة	841
#انفروا_خفافا_وثقالا	720
#مطار_ابها_الدولي	654
#ستوكهولم	609
#صعدة	587
#الحوثيين	493
#العربية	476
#قناة_المسيرة	442
#السعودية	432
#حبل_الكذب_قصير	421
#التحيتا	409
#الايراني	347
#عدن	344
#لا_لصفقة_ترامب	336
#نحو_القدس	336
#الحوثيون	335
#يوم_القدس_العالمي	321
#اخبار_اليمن	298
#الدريهمي	294
#مليشيا_الحوثي	282
#MQ9	278
#عيد	258
#السويد	242
#حصار_الدريهمي_جريمة_حرب	241
#مطار_أبها	231
#شاهد	190
#الساحل_الغربي	188
#الضالع	188
#السعودية_تقصف_الحوثيين	187
#عاجل	174
#إيران	164
#الحل_في_الحديدة	161
#مبادرة_اعادة_الانتشار_بالحديدة	160
#مارتن_غريفيث	159
#حيس	156
#الإمارات	155
#انتهى	155
#الجناني	152
#البيضاء	148
#الحديده	147
#التحالف	140
#عاصفة_الحسم	133
#بيت_الفقيه	128
#الحوثيون_يكذبون_كما_يتنفسون	123
#المليشيا_الحوثية	122
#قطر	121
#استهداف_مطار_ابها	119
#اتفاق_ستوكهولم	114
#السعوديه_تقصف_الحوثيين	109
#عيد_الفطر	108
#المقاومة_الجنوبية	106
#مأرب	105
#الإخوان_المسلمين	104
#جازان_الان	102
#أبوشاهر	101
#تغيير_غريفيت	94
#الجنائية_الدولية	92
#جريمة	92
#سهيل	91
#الرياض	86
#الحالي	85
#yemen	84
#مكة	84
#بيت_الفقية	84
#ميليشيا_الحوثي	81
#حوثي	81
#عكاظ	78
#ميناء_الحديدة	73
#التحالف_العربي	73
#ابوظبي	70
#حزب_الاصلاح	70
#الحديدة_تتحرر	69
#اأبوشاهر	69
#الشرعية	68
#اخبار	68
#الحديدة_تنتصر	68
#المسيرة_عاجل	65
#لحج	63
#جرائم_العدوان_في_الحديدة	58
#تعز_عذابآ_فوق_العذابات	58
#اعجميات	53
#الحوثي_يعتدي_على_مطار_ابها	51
#بفضل_الله_وقوته	50
#اليمن_الجمهوري	50
#القطريين_يهاجمون_خالد_المريخي	49
#الجنوب_العربي	49
#الألغام	49
#اليمن_العربي	48
#هادي	46
#المقاومة_المشتركة	46
#رجال_الله	45
#أبطال_الجيش_واللجان_الشعبي	45
#الصليف	45
#واس	45
#الكويت	44
#الامارات	42
#الشرعية_اليمنية	42
#عدن_تنتصر_للعرب	42
#غريفيث	41
#الوازعية	41
#اخر_اخبار_اليمن	40
#الإخبارية	40
#HouthiCrimes	39
#الجمهوري	39
#تركيا	38
#فيديو	38
#إمعة_العرب	37
#اليوم_العالمي_للتوعية_بشأن_إساءة_معاملة_المسنين	37
#صالح	37
#مشاورات_السويد	37
#البحر_الأحمر	36
#ايران	36
#السيد_عبدالملك_بدرالدين_الحوثي	35
#فلسطين	35
#الهلال_الأحمر_الإماراتي	34
دم#اعجميات	33
#تعز_وجع_لا_ينتهي	32
#القوات_المشتركة	32
#جبهة_الوعي	30
#روسيا	29
#عيد_الفطر_المبارك	29
#خميس_مشيط	29
#انتهاك	29
#تعز_وجع_لاينتهي	29
#ذمار	29
#الحدث	28
#صحيفة_الوطن	28
#شبكة_المجد_للأخبار	28
#الامم_المتحدة	28
#YEMEN	27
#خالد	27
#نهاية	27
#الاعتداء_الارهابي	27
#الحوثي_ينتهك_القانون_الدولي	26
#مجلس_الأمن	26
#تحرير_الحديده	26
#قطع_النفس	26
#مليشيات_الحوثي_تقتل_اطفال_تعز_دون_رحمة	26
#الجيش_اليمني	26
#مقبنة	26
#المخا	26
#قطع_الوريد	26
#ابها_الان	25
#ابها	25
#جرائم_الحوثي	25
#جازان	25
#أمريكا	25
#زعيم	24
#صواريخ	24
#الإعلام_الحربي	24
#تهامة	24
#حزب_الله	24
#منظمة_سام	24
#كهوف	24
#أبين	24
#اليمني	24
#SaveChildren	23
#سافيز	23
#وكالة_2_ديسمبر_الإخبارية	23
#كان_اليمن_سعيد_بعهد_الزعيم	23
#زلزال_1	22
#الاصلاح_يخذل_التحالف_في_تعز	22
#مليشيات_الحوثي	22
#Taiz	22
#الامارات_في_اليمن	22
#تحرير_الحديدة	21
#اطفال_اليمن	21
#الصفحة_الأولى	21
شرق#تعز	21
#علوم_الدار	21
#سام	20
#المعركة	20
#خط_أحمر	20
#ماوية	20
#العسكرية	20
#السيد_القائد	20
#سقطرى	20
#الولايات_المتحدة	20
#شبوة	20
#المسيره	19
#جرائم_الحوثي_بحق_اطفال_تعز	19
#المصدر_أونلاين	19
#الحوثي_بلا_شرف	19
#عصيفرة	19
#طائره	19
#نسفت	18
#توثيق	18
#سلسلة_ابو_وليد_لتوثيق_انتصارات_الجنوبيين_بالمحافظات_الشمالية	18
#حراس_الجمهورية	18
#نجران	18
            `
        }
      });
    }
  }
};
</script>
<style lang="scss">
.viz_input_fields {
  position: relative;
  display: flex;
  flex-flow: row wrap;
  padding-top: var(--spacing);
  padding-bottom: var(--spacing);

  > * {
    flex: 1 1 auto;
  }

  .viz_input_fields--keywords {
    position: relative;

    margin-right: 5px;

    &:last-child {
      margin-right: 0;
    }

    .label {
      position: absolute;
      top: -15px;
      left: 2px;
      background-color: white;
      padding: 0 5px;
      z-index: 1;
      margin: 2px;
    }
    .input_field,
    .vc-w-full {
      border: 1px solid black;
      font-size: 150%;
      padding: 5px 10px;
      text-transform: normal;
      font-variant: normal;
      font-weight: normal;
      border-radius: 0px;
      width: 100%;

      &:focus {
        outline: 0;
        border-color: var(--active-color);
      }
    }
  }

  input[type="submit"] {
    font-family: inherit;
    flex: 0 0 40px;
    display: block;
    appearance: none;
    border: 0;
    background-color: var(--active-color);
    color: white;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    padding: 0;

    &:focus,
    &:hover {
      outline: 0;
      background-color: white;
      color: currentColor;
    }

    &[disabled] {
      background-color: gray;
    }
  }
}
</style>
