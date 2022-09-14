**・前言**  
  
reactive、runtime-core、runtime-dom、shared資料夾參考自珠峰前端架構課，  
ast資料夾參考自尚硅谷Vue源碼系列課程，  
（由於出處不同，為了順利串接，有稍微調整ast內容。）  
有一定參考價值。  
其餘部分及串接由於目前還沒學到，  
因此先以我的獨斷與偏見製作原（ㄌㄧㄝˋ）創（ㄏㄨㄚˋ）版，  
待學習後將再更新優化。  
  
**・使用方法**  
  
在/src/main.ts中寫上以下代碼：  
```
export default {  
  template:``,  
  setup(){}  
}  
```
  
您可以在template中傳入欲渲染至畫面的模板，  
並在setup中寫入數據邏輯，  
別忘了從/src/reactive資料夾引入需要的api喔。  
範例如下：  
```
import { ref } from './reactive'
export default {  
  template:`<h1 @click="fn" :class="color">{{msg}}</h1>`,  
  setup(){  
    const msg = ref('想雇用高CP值的前端框架師？找Hato就對了>wO')  
    function fn() {
      alert(123)
    }
    const color = ref('pink')
    return {  
      msg,  
      fn,
      color
    }  
  }  
}  
```

**・api**  
  
目前可使用的功能如下：  

1. template相關  
標籤內的「:」和「@」  
2. setup相關  
ref、reactive、computed、watch  

**・學習路徑**  
  
如前言所述，  
我主要是透過珠峰的影片學習源碼，  
但如今（2022/9/14）珠峰源碼後半的影片還是沒長回來，  
私訊也沒得到回覆，  
我想應該是涼了。  
  
現時間點網路上已不存在任何「完整」的Vue3源碼教學影片，  
因此我的學習方式是先從珠峰僅存的影片學習依賴收集、基本api、虛擬DOM、diff算法，  
再去尚硅谷看ast抽象語法樹，  
需要注意的是尚硅谷的抽象語法樹解讀出來的格式無法直接調用render(h())來渲染，  
得自己調整一下數據的格式，  
並參考解析標籤的方式，  
自己手寫一套正則去捕獲被插入的數據及v-bind、v-on。  

之後自己用一個template把模板傳入抽象語法樹解析，  
再調用setup()獲取數據填充模板，  
把這個過程用effect()的回調函數包起來即可。  

組件渲染和vue-router我目前沒頭緒，  
下次失業再來慢慢研究-3-  
希望有人能代替珠峰分享完整的源碼教學。
