export const parseTextData = (text: string) => {
  const checkData = /{{(.+)}}/;
  if (!checkData.test(text)) return text;
  const express = text.match(checkData)[1];
  return eval(express);
};