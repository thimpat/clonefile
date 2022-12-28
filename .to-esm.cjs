const packageJson = require("./package.json");

module.exports = {
    "replaceStart"  : [
        {
            search : "packageJson.name",
            replace: `"${packageJson.name}"`
        },
        {
            search : "const cloneFile = `../index.cjs`;",
            replace: "const cloneFile = `../index.mjs`;"
        },
        {
            search: "CloneFile CJS",
            replace: "CloneFile ESM"
        }
    ],
    "replaceEnd"    : [
    ],
}