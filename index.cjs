#!/usr/bin/env node

const minimist = require("minimist");

const argv = minimist(process.argv.slice(2), {boolean: ["silent", "force"]});
const packageJson = require("./package.json");
const {displayError, displayLog, cloneFromCLI, displayHelpFile} = require("./src/clonefile.cjs");
const {SKIP_MESSAGE} = require("./src/constants.cjs");

const init = async () =>
{
    try
    {
        const silent = !!argv.silent;

        if (argv.hasOwnProperty("verbose"))
        {
            displayLog(`The option "--verbose" is deprecated. Use --silent instead`, {fg: "orange", silent});
        }

        if (argv.hasOwnProperty("overwrite"))
        {
            displayLog(`The option "--overwrite" is deprecated. Use --force instead`, {fg: "orange"});
            argv.force = argv.force || argv.overwrite;
        }

        // --------------------
        // Version and help
        // --------------------
        if (argv.v || argv.version)
        {
            console.log(packageJson.version);
            return;
        }

        if (argv.h || argv.help)
        {
            await displayHelpFile();
            return;
        }

        if (argv.force)
        {
            argv.recursive = true;
            argv.overwrite = true;
        }

        let {count, message} = cloneFromCLI(argv);

        process.exitCode = process.exitCode || 0;

        if (message === SKIP_MESSAGE)
        {
            return;
        }

        if (!argv.silent)
        {
            message = message || `${count} ${count === 1 ? "item" : "items"} cloned`;
            displayLog(``.padEnd(message.length, "-"), {fg: "orange"});
            displayLog(message, {fg: "orange"});
        }

        return;
    }
    catch (e)
    {
        console.error(e.message);
    }

    process.exitCode = process.exitCode || 1;
};

init().then(() => true).catch(e => displayError(e));

