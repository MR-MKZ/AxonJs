import jsdoc from "jsdoc-to-markdown"

const apiDocs = await jsdoc.render({ files: 'dist/*.js' })