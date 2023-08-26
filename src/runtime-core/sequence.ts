export default (arr: number[]) => {
  const result = [0];
  const prevIdxs: number[] = [];

  arr.forEach((num, i) => {
    const last = result[result.length - 1];
    if (num > arr[last]) {
      result.push(i);
      prevIdxs[i] = last;
    } else {
      let start = 0;
      let end = result.length - 1;
      while (end > start) {
        const middleIdx = ((start + end) / 2) | 0;
        if (num > arr[result[middleIdx]]) start = middleIdx + 1;
        else end = middleIdx;
      }

      result[start] = i;
      prevIdxs[i] = result[start - 1];
    }
  });

  for (let i = result.length - 1; i > 0; i--) {
    result[i - 1] = prevIdxs[result[i]];
  }

  return result;
};