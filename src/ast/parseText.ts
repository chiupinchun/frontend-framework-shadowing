import { isRef } from "../vue";

export const parseTextData = (text: string) => {
  const checkData = /{{(.+)}}/;
  if (!checkData.test(text)) return [text];
  const express = text.match(checkData)[1]?.trim();
  const result = eval(express);
  return [isRef(result) ? result.value : result];
};