import { Fragment } from "react";

/**
 * A CMS text with {name} placeholders, where each placeholder can be text or an element (a link,
 * a bold name). Unknown placeholders stay as they are, so a typo in the CMS shows up on the page.
 */
export default function Template({
  text,
  values,
}: {
  text: string;
  values: Record<string, React.ReactNode>;
}) {
  return text.split(/(\{\w+\})/).map((part, i) => {
    const key = /^\{(\w+)\}$/.exec(part)?.[1];
    return <Fragment key={i}>{key && key in values ? values[key] : part}</Fragment>;
  });
}
