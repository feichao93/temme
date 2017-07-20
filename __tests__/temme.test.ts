import { temmeParser } from '..'
import temme from '../src/temme'

test('basic', () => {
  // expect(() => temmeParser.parse('div')).not.toThrow()
  //
  // expect(() => temmeParser.parse(`
  // .companyinfo li@:pack (
  //     &.name{$companyName},
  //     &{text('企业官方网站：', $website)},
  //     &{text('网站备案号：', $icp)},
  //     &{text('联系电话：', $phone)},
  //     &{text('企业传真：', $fax)},
  //     &{text('邮箱：', $email)},
  //     &{text('公众微信号：', $wechat)},
  //     &.address{text('企业地址：', $address)},
  //   )`)).not.toThrow()
  //
  // expect(() => temmeParser.parse(`.brandinfo .info >li@:pack(
  //     &{text('电话：', $phone:splitComma)},
  //     &{text('品牌创立时间：', $foundTime)},
  //     &{text('品牌发源地：', $origination)},
  //     &{html($president:extractPresident)},
  //     &{text('企业官网：', $website)},
  //     &{text('品牌广告词：', $adText)},
  //     script[language]{html($officialWebsite:extractUrl)},
  //   )`)).not.toThrow()
  expect(temme(`
<div class="content" _hover-ignore="1">
  <div class="clear"></div>
  <div class="article_head mingren">
  <h1>张茵-东莞玖龙纸业有限公司董事长介绍</h1>
  <div class="author">
  <span>阅读：<span count="attention">13015</span>次</span>
  <span class="bdsharebuttonbox bdshare-button-style0-32" data-bd-bind="1500534343449"><a href="#" class="bds_more" data-cmd="more"></a></span>
  <div class="brandlist">
  相关品牌：
  <a href="http://www.maigoo.com/maigoocms/special/bggj/158NINE DRAGONS.html" target="_blank">玖龙纸业(控股)有限公司</a>
  <a href="http://www.maigoo.com/maigoocms/special/bggj/158NINE DRAGONS.html" target="_blank">玖龙</a>
  </div>
  </div>
  </div>
  <div class="clear"></div>
  <div class="specialcont">
  <div class="only-cont"><div id="modellist-22087" class="md_3627 modelbox color2" model-fun=""> <div class="md_border s1"> <div class="md_border1" _hover-ignore="1"> <div class="md_flag"></div> <div class="md_word"><p> <span style="font-size:14px;">张茵，东莞玖龙纸业有限公司董事长。曾用10年时间成为美国废纸回收大王。曾是中国第一位女首富，也是世界上最富有的女白手起家者，荣获2008年“中华慈善奖”。2012年，获世界莞商大会“杰出莞商”。</span> </p></div> <div class="clear"></div> </div> </div> </div><div id="modellist-22098" class="md_8000 modelbox " model-fun=""> <div class="md_title2 model_title"> <div class="md_word"> 张茵简介 <div class="md_left"></div> <div class="md_right"></div> </div> </div> </div><div id="modellist-22088" class="md_9385 modelbox " model-fun=""> <div class="md_itembox"> <div class="md_img"> <img src="http://image4.cnpp.cn/upload/images/20150522/15003569209_450x300.jpg" alt="" title="" _hover-ignore="1">
  </div> <div class="md_word"><p> <span style="font-size:14px;"><strong>中文名：</strong>张茵</span> </p> <p> <span style="font-size:14px;"><strong>国 籍：</strong>中国</span> </p> <p> <span style="font-size:14px;"><strong>民 族：</strong>汉</span> </p> <p> <span style="font-size:14px;"><strong>出生地：</strong>广东韶关</span> </p> <p> <span style="font-size:14px;"><strong>出生日期：</strong>1957年</span> </p> <p> <span style="font-size:14px;"><strong>职 业：</strong>东莞玖龙纸业有限公司董事长</span> </p> <p> <span style="font-size:14px;"><strong>祖 籍：</strong>黑龙江省鸡西市</span> </p> <p> <span style="font-size:14px;"><strong>教 育：</strong>大学（财会）</span> </p> <p> <span style="font-size:14px;"><strong>供职机构：</strong>美国中南控股</span> </p> <p> <span style="font-size:14px;"><strong>公司总部：</strong>广东东莞</span> </p> <p> <span style="font-size:14px;"><strong>主要成就：</strong><span style="font-size:14px;line-height:24px;">2007年《福布斯》第一位女首富、2009年胡润百富榜 杰出莞商</span><br> </span> </p></div> <div class="clear"></div> </div> </div><div id="modellist-22099" class="md_8000 modelbox " model-fun=""> <div class="md_title2 model_title"> <div class="md_word"> 人物履历 <div class="md_left"></div> <div class="md_right"></div> </div> </div> </div><div id="modellist-22089" class="md_9385 modelbox " model-fun=""> <div class="md_itembox md_itembox2 md_itemboxr"> <div class="md_img"> <img src="http://image4.cnpp.cn/upload/images/20150522/14573941596_300x436.jpg" alt="" title="">
  </div> <div class="md_word"><p> <span style="font-size:14px;"><strong>1985年</strong> 在香港做废纸回收贸易； </span> </p> <p> <span style="font-size:14px;"><strong>1988年</strong> 在广东东莞建立了自己的独资工厂； </span> </p> <p> <span style="font-size:14px;"><strong>1990年</strong> 从香港移民美国，张茵与丈夫刘名中建立美国中南有限公司，为其在中国的工厂购买并提供可回收废纸； </span> </p> <p> <span style="font-size:14px;"><strong>1996年</strong> 在广东东莞投资1.1亿美元成立玖龙纸业，生产牛卡纸； </span> </p> <p> <span style="font-size:14px;"><strong>1996年</strong> 在全美各行业集装箱出口用量排行榜上，中南公司名列第四； </span> </p> <p> <span style="font-size:14px;"><strong>1997年</strong> 美国评比出妇女企业五百强，中南公司名列95位； </span> </p> <p> <span style="font-size:14px;"><strong>1999年</strong> 7月对玖龙纸业继续注资1.1亿美元，进行二期工程扩建； </span> </p> <p> <span style="font-size:14px;"><strong>2000年</strong> 成为美国废纸回收大王； </span> </p> <p> <span style="font-size:14px;"><strong>2002年</strong> 美国中南公司从美国出口的废纸是300万吨； </span> </p> <p> <span style="font-size:14px;"><strong>2003年</strong> 财富25亿元 全美500强女企业家第54位 中国百富榜第17名； </span> </p> <p> <span style="font-size:14px;"><strong>2004年</strong> 张茵再度投入1亿多美元，进行三期工程扩建； </span> </p> <p> <span style="font-size:14px;"><strong>2004年</strong> 财富30亿元 胡润百富榜第19名； </span> </p> <p> <span style="font-size:14px;"><strong>2005年</strong> 财富15亿元 胡润百富榜第36名； </span> </p> <p> <span style="font-size:14px;"><strong>2006年</strong> 3月玖龙纸业香港上市 财富270亿胡润百富榜第1名； </span> </p> <p> <span style="font-size:14px;"><strong>2007年 </strong>财富250亿元 胡润百富榜第2位； </span> </p> <p> <span style="font-size:14px;"><strong>2008年 </strong>经历“提案门”，“血汗门”“破产门”； </span> </p> <p> <span style="font-size:14px;"><strong>2009年</strong> 财富330亿 胡润百富榜第2位，胡润女富豪榜登榜首； </span> </p> <p> <span style="font-size:14px;"><strong>2010年</strong> 2月净资产17亿美元，列《福布斯》全球亿万富豪榜第582名； </span> </p> <p> <span style="font-size:14px;"><strong>2010年</strong> 5月14日“2010新财富500富人榜”，以344.2亿元资产排名第三位； </span> </p> <p> <span style="font-size:14px;"><strong>2010年 </strong>10月《2010胡润百富榜》第三名张茵 财富380亿元。</span> </p></div> <div class="clear"></div> </div> </div><div id="modellist-22100" class="md_8000 modelbox " model-fun=""> <div class="md_title2 model_title"> <div class="md_word"> 人物事迹 <div class="md_left"></div> <div class="md_right"></div> </div> </div> </div><div id="modellist-22093" class="md_4758 modelbox color2" model-fun="bind_left_right_scroll2"> <div class="md_menu slide_menu_control"><div class="md_menu_box"> <ul class="md_mul md_mul3" style="width: 685px;"> <li class="current"> <div class="md_mcont"> 埋头做事，量力而为 </div></li> <li> <div class="md_mcont"> 女人男人，没有区别 </div></li> <li> <div class="md_mcont"> 我的事业，仍在中国 </div></li> <div class="clear"></div> </ul> <div class="clear"></div> </div></div> <div class="md_cont slide_menu_box"> <ul class="md_cul" style="width: 2700px;"> <li class="li md_left" style="float: left;"> <div class="md_img"> <img src="http://image2.cnpp.cn/upload/images/20150522/15023347267_450x300.jpg" alt="" title=""> </div> <div class="md_mcont"> <div class="md_title"> 埋头做事，量力而为 </div> <div class="md_word"><p> <span style="font-size:14px;">张茵谈创业起步时，恰逢中国改革开放的黄金时期，到美国后又恰逢美国经济复苏持续繁荣，此外，美国森林资源丰富，造纸业发达，废纸回收系统极为科学，加上此时经过在香港的发展，公司资金雄厚，起点高，靠着诚实守信的经营作风，从而发展速度惊人。谈起成功的秘诀，张茵说自己最大的特点就是埋头做自己的事情，凡事量力而为，此外，由于学过财会专业，因此在管理上有独到的见解。提倡“个人小家庭，公司大家庭”的人性化管理。</span> </p></div> </div> <div class="clear"></div> </li> <li class="li md_left" style="float: left;"> <div class="md_img"> <img src="http://image3.cnpp.cn/upload/images/20150522/15012860066_450x300.jpg" alt="" title=""> </div> <div class="md_mcont"> <div class="md_title"> 女人男人，没有区别 </div> <div class="md_word"><p> <span style="font-size:14px;">张茵说话干脆利落，看起来比实际年龄要年轻。获得今天的成功，张茵认为性别对自己并没有什么阻碍。虽然工作起来女性体力稍差一些，但在其他方面和男人没有任何区别。只要有智慧，有进取心，有好的人品，就有可能获得成功。生活工作中，自己反而因为是女的，得到了更多的照顾。 </span> </p> <p> <span style="font-size:14px;">张茵认为自己与一般女性不同的是，她比较大方、大度，特别在钱物方面。“可能因为我有信心，能赚钱、会赚钱，所以钱财对我来说反而不是那么重要了。</span> </p></div> </div> <div class="clear"></div> </li> <li class="li md_left" style="float: left;"> <div class="md_img"> <img src="http://image.cnpp.cn/upload/images/20150522/14590735052_450x300.jpg" alt="" title=""> </div> <div class="md_mcont"> <div class="md_title"> 我的事业，仍在中国 </div> <div class="md_word"><p> <span style="font-size:14px;"> </span> </p> <p> <span style="font-size:14px;"> </span> </p> <p> <span style="font-size:14px;">“我虽然居住在美国，但我的事业在中国。”这是张茵在接受美国第三大新闻媒体采访时回答记者的一句话，她是这样说的，也是这样做的。</span><span style="line-height:2em;">十年前，张茵想做全美废纸回收出口大王，这一愿望很快实现了。十年后，她又有了新的梦想，那就是在中国实现年产包装纸100万吨，成为中国牛卡纸大王。张茵说，目前中国的经济秩序越来越好，投资环境越来越稳定，今后她还将不断扩大投资规模，“在中国赚的钱一分也不会带走，要全部用于扩大再生产。”另外，还有一个重要的原因，那就是实现她的产业报国梦。</span> </p></div> </div> <div class="clear"></div> </li> <div class="clear"></div></ul> </div> </div></div> </div>
</div>`,
    `.article_head h1{text($, '-', _)}`)).toBe('张茵')
})
