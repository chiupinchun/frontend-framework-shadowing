export const parse = (template: string) => {
  template = template.trim();
  // 指針
  let index = 0;
  // 檢測開始標籤，捕獲標籤內文字。ex:<(div)>
  const startRegExp = /^\<([a-z]+[1-6]?)(\s[^\<]+)?\>/;
  // 檢測結束標籤，捕獲標籤內文字。ex:</(div)>
  const endRegExp = /^\<\/([a-z]+[1-6]?)\>/;
  // 檢測文字+下標籤
  const wordRegExp = /^([^\<]+)\<\/[a-z]+[1-6]?\>/;

  const tagStack: string[] = [];
  type TagContent = {
    tag?: string;
    attrs?: Record<string, any>;
    children: (string | TagContent)[];
  };
  const textStack: TagContent[] = [{ children: [] }];
};