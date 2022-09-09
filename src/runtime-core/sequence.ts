export function getLongestSubsequence(arr: Array<number>) {
  // 預計返回最長遞增子序列的各項index
  const result = [0]
  // 陣列prevIndexes紀錄arr各項在result中的前一項，最後會用到。
  const prevIndexes: Array<number> = []
  arr.forEach((num, i) => {
    const last = result[result.length - 1]
    if (num > arr[last]) {
      // 若arr當前項大於result最後一項，則將其push進result，並記錄其在result中的前一項於prevIndexes
      result.push(i)
      prevIndexes[i] = last
    } else {
      // 若arr當前項未大於result最後一項，以二分算法找出比它大的最小項
      let start = 0
      let end = result.length - 1
      while (end > start) {
        const middleIdx = ((start + end) / 2) | 0
        if (num > arr[result[middleIdx]]) start = middleIdx + 1
        else end = middleIdx
      }
      // 讓arr當前項取代result中比它大的最小項，並記錄其在result中的前一項於prevIndexes
      result[start] = i
      prevIndexes[i] = result[start - 1]
    }
  })
  // 上述流程結束後，難免有部分項被其他非遞增項覆蓋，
  // 因此先前以prevIndexes紀錄各項遭覆蓋前的前項。
  // 利用prevIndexes的紀錄還原正確結果。
  for (let i = result.length - 1; i > 0; i--) {
    result[i - 1] = prevIndexes[result[i]]
  }
  return result
}