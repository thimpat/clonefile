#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const toAnsi = require("to-ansi");
const minimist = require("minimist");

const argv = minimist(process.argv.slice(2));

const method = fs.copyFileSync ? "new" : "stream";

if (!argv.hasOwnProperty("verbose"))
{
    argv.verbose = true;
}

if (["false", "no", "nada", "non"].includes(argv.verbose))
{
    argv.verbose = false;
}

const displayLog = (message, style = {fg: "yellow"}) =>
{
    if (!argv.verbose)
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
};

const isFileExist = (source) =>
{
    try
    {
        if (!fs.existsSync(source))
        {
            return false;
        }

        return (fs.lstatSync(source).isFile());
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

        source = argv.source;

        if (!source && argv._ && argv._.length)
        {
            source = argv._[0];
            argv._ = argv._.slice(1);
        }

        if (!source)
        {
            displayError(`No source found`);
            process.exit(1);
        }

        source = resolvePath(source);
        if (!isFileExist(source))
        {
            displayError(`The source file "${source}" does not exist, is inaccessible or is invalid`);
            process.exit(1);
        }

        let filename = path.parse(source).base;

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

        let errorFounds = 0;
        let count = 0;
        const n = targets.length;
        for (let i = 0; i < n; ++i)
        {
            let target = targets[i];
            try
            {
                let alreadyExists = false;
                let isDirectory = false;
                target = normalisePath(targets[i]);

                if (target.endsWith("/"))
                {
                    target = resolvePath(path.join(target, filename));
                }

                if (fs.existsSync(target))
                {
                    alreadyExists = true;
                    isDirectory = (fs.lstatSync(target).isDirectory());
                    if (isDirectory)
                    {
                        target = resolvePath(path.join(target, filename));
                        alreadyExists = fs.existsSync(target);
                    }
                }

                if (alreadyExists && !argv.overwrite)
                {
                    displayLog(`The destination "${target}" already exists. Skipping`, {fg: "gray"});
                    continue;
                }

                if (resolvePath(source) === resolvePath(target))
                {
                    ++errorFounds;
                    displayError(`Cannot clone source into itself: ${target}`);
                    continue;
                }

                copyFile(source, target, argv.recursive);
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
                displayError(toAnsi.getTextFromColor(`No file copied`, {fg: "red"}));
                process.exit(1);
            }

            displayLog(`No file copied`, {fg: "gray"});
            process.exit(0);
        }

        const message = `${count} file${count === 1 ? "":"s"} cloned`;
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