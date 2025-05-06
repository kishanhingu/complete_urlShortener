import path from "path";
import { readFile } from "fs/promises";
import mjml2html from "mjml";
import ejs from "ejs";

export const getHtmlFromMjmlTemplate = async (template, data) => {
  // 3. we need to convert that file into html file

  // 1. we need to read the mjml file.
  const mjmlTemplatePath = path.join(
    import.meta.dirname,
    "..",
    "emails",
    `${template}.mjml`
  );

  const readMjmlFile = await readFile(mjmlTemplatePath, "utf-8");

  // 2. we need to replace the placeholder
  const filledTemplate = ejs.render(readMjmlFile, data);

  return mjml2html(filledTemplate).html;
};
