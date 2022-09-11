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
export default {  
  template:``,  
  setup(){}  
}  
  
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
