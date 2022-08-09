#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const toAnsi = require("to-ansi");
const minimist = require("minimist");

const argv = minimist(process.argv.slice(2), {boolean: ["recursive", "overwrite", "silent", "force"]});

const method = fs.copyFileSync ? "new" : "stream";

const displayLog = (message, style = {fg: "yellow"}) =>
{
    if (argv.silent)
    {
        return;
    }
    console.log(toAnsi.getTextFromColor(message, style));
};

const displayError = (message, style = {fg: "red"}) =>
{
    console.error(toAnsi.getTextFromColor("Error: " + message, style));
};


const normalisePath = (filepath) =>
{
    filepath = path.normalize(filepath);
    filepath = filepath.replaceAll("\\", "/");
    return filepath;
};

const resolvePath = (filepath) =>
{
    filepath = path.resolve(filepath);
    return normalisePath(filepath);
};

const copyFile = (source, dest, isRecursive) =>
{
    try
    {
        const dir = path.parse(dest).dir;
        if (dir && !fs.existsSync(dir) && isRecursive)
        {
            fs.mkdirSync(dir, {recursive: true});
        }

        if (method === "stream")
        {
            fs.createReadStream(source).pipe(fs.createWriteStream(dest));
        }
        else
        {
            fs.copyFileSync(source, dest, fs.constants.F_OK);
        }

        displayLog(`${source} => ${dest}`, {fg: "yellow"});
    }
    catch (e)
    {
        console.error(e.message);
    }
};

const copyFolder = (source, dest) =>
{
    try
    {
        fs.copySync(source, dest, {overwrite: true}, function (err)
        {
            if (err)
            {
                console.error(err.message);
                return;
            }

            displayLog(`${source} => ${dest}`, {fg: "green"});
        });
    }
    catch (e)
    {
        console.error({lid: 1000}, e.message);
    }

};

const getEntityStatus = (source) =>
{
    try
    {
        const res = {};
        if (!fs.existsSync(source))
        {
            res.exists = false;
            return res;
        }

        res.exists = true;
        const stats = fs.lstatSync(source);
        res.file = stats.isFile();
        res.dir = stats.isDirectory();
        return res;
    }
    catch (e)
    {

    }

    process.exit(1);
};

const init = () =>
{
    try
    {
        let source = "";

        if (argv.hasOwnProperty("verbose"))
        {
            displayLog(`The option "--verbose" is deprecated. Use --silent instead`, {fg: "orange"});
        }

        if (argv.force)
        {
            argv.recursive = true;
            argv.overwrite = true;
        }

        source = argv.source;

        if (!source && argv._ && argv._.length)
        {
            source = argv._[0];
            argv._ = argv._.slice(1);
        }

        if (!source)
        {
            displayError(`No source detected in arguments`);
            process.exit(1);
        }

        source = resolvePath(source);

        const sourceStatus = getEntityStatus(source);
        if (!sourceStatus.exists)
        {
            displayError(`The source file "${source}" does not exist, is inaccessible or is invalid`);
            process.exit(1);
        }

        if (!(sourceStatus.file || sourceStatus.dir))
        {
            displayError(`The source file "${source}" is not a file/directory`);
            process.exit(2);
        }

        let filename = path.parse(source).base;

        // --------------------
        // Determine targets folders and files
        // --------------------
        let targets = argv._ || [];

        if (argv.target)
        {
            const targetList = Array.isArray(argv.target) ? argv.target : [argv.target];
            targets.push(...targetList);
        }

        if (argv.targets)
        {
            const targetList = Array.isArray(argv.targets) ? argv.targets : [argv.targets];
            targets.push(...targetList);
        }

        if (!targets.length)
        {
            displayError(`No targets given`);
            process.exit(1);
        }

        // --------------------
        // Start cloning
        // --------------------
        let errorFounds = 0;
        let count = 0;
        const n = targets.length;
        for (let i = 0; i < n; ++i)
        {
            let target = targets[i];
            try
            {
                target = normalisePath(targets[i]);

                if (target.endsWith("/"))
                {
                    target = resolvePath(path.join(target, filename));
                }

                // Source and destination are the same
                if (resolvePath(source) === resolvePath(target))
                {
                    ++errorFounds;
                    displayError(`Cannot clone source into itself: ${target}`);
                    continue;
                }

                const targetStatus = getEntityStatus(target);

                // Destination exists already
                if (targetStatus.exists && !argv.overwrite)
                {
                    displayLog(`The destination "${target}" already exists. Skipping`, {fg: "gray"});
                    continue;
                }

                // Destination is a folder
                if (targetStatus.dir)
                {
                    target = resolvePath(path.join(target, filename));
                }

                if (sourceStatus.file)
                {
                    copyFile(source, target, argv.recursive);
                }
                else
                {
                    if (targetStatus.file)
                    {
                        displayError(`You cannot clone a directory [${source}] into an existing file [${target}].`);
                        ++errorFounds;
                        continue;
                    }

                    if (!argv.force)
                    {
                        displayLog(`To clone the directory [${source}], you must pass the --force option. Skipping`, {fg: "gray"});
                        continue;
                    }

                    copyFolder(source, target, argv.recursive);
                }
                ++count;
            }
            catch (e)
            {
                displayError(`Failed to clone "${target}": ${e.message}`);
            }
        }

        if (!count)
        {

            if (errorFounds)
            {
                displayError(toAnsi.getTextFromColor(`${errorFounds} ${errorFounds === 1 ? "issue" : "issues"} detected`, {fg: "red"}));
                process.exit(1);
            }

            displayLog(`No file copied`, {fg: "gray"});
            process.exit(0);
        }

        const message = `${count} ${count === 1 ? "item" : "items"} cloned`;
        displayLog(``.padEnd(message.length, "-"), {fg: "orange"});
        displayLog(message, {fg: "orange"});

        process.exit(0);
    }
    catch (e)
    {
        displayError(e.message);
    }

    process.exit(1);
};

init();