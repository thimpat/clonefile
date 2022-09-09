#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");

const minimist = require("minimist");
const glob = require("glob");

const toAnsi = require("to-ansi");
const {showHelp} = require("pageterm");
const {
    joinPath,
    calculateCommon,
    resolvePath,
    isConventionalFolder,
    normalisePath,
    normaliseRealPath
} = require("@thimpat/libutils");

const argv = minimist(process.argv.slice(2), {boolean: ["recursive", "silent", "force"]});

const method = fs.copyFileSync ? "new" : "stream";

const packageJson = require("./package.json");

const LIMIT_FILES = parseInt(process.env.CLONE_FILE_MAX_PATTERN) || 200;

let errorFounds = 0;
let count = 0;

const displayLog = (message, style = {fg: "yellow"}) =>
{
    if (argv.silent)
    {
        return;
    }
    console.log(toAnsi.getTextFromColor(message, style));
};

const displayHelpFile = async function ()
{
    const helpPath = joinPath(__dirname, "help.md");
    const content = fs.readFileSync(helpPath, "utf-8");
    await showHelp(content, {
        windowTitle    : `${packageJson.name} v${packageJson.version} - Help ❔`,
        topText        : "Press CTRL + C or Q to Quit | Page Down or Any key to scroll down",
        topTextBg      : "",
        topTextReversed: true,
        colorify       : true
    });
};

const displayError = (message, style = {fg: "red"}) =>
{
    if (message instanceof Error)
    {
        message = message.message || "Unexpected error";
    }
    console.error(toAnsi.getTextFromColor("Error: " + message, style));
};

const copyFile = (source, dest, isRecursive = true) =>
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
        displayError(e.message);
    }
};

const copyFolder = (source, dest) =>
{
    try
    {
        const err = fs.copySync(source, dest, {overwrite: true});
        if (err)
        {
            displayError(err.message);
            return;
        }

        displayLog(`${source} => ${dest}`, {fg: "green"});
    }
    catch (e)
    {
        displayError({lid: 1000}, e.message);
    }

};

/**
 * Tells whether the provided path exists on disk, is a directory or a file
 * @param filepath
 * @returns {{}|boolean}
 */
const getEntityStatus = (filepath) =>
{
    const res = {};

    if (fs.existsSync(filepath))
    {
        res.exists = true;
        const stats = fs.lstatSync(filepath);
        if (!stats.isFile() && !stats.isDirectory())
        {
            res.unhandledType = true;
            throw new Error(`Unknown entify type for ${filepath}`);
        }
        res.isFile = stats.isFile();
    }
    else
    {
        res.exists = false;
        if (isConventionalFolder(filepath))
        {
            res.isFile = false;
        }
        else
        {
            const filename = filepath.split("/").pop();

            // We are going to assume that a file with no dot character in it is a folder
            res.isFile = filename.indexOf(".") > -1;
        }
    }

    res.isDir = !res.isFile;

    if (res.isFile)
    {
        res.filePath = normalisePath(filepath);
        res.dirPath = path.parse(filepath).dir;
        res.dirPath = normalisePath(res.dirPath, {isFolder: true});
    }

    if (res.isDir)
    {
        res.filePath = normalisePath(filepath, {isFolder: true});
    }

    return res;
};

function getTargets()
{
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
        process.exitCode = process.exitCode || 1;
        return null;
    }
    return targets;
}

function cloneToTargets(targets, {source, commonSourceDir})
{
    const n = targets.length;

    let sourceStatus = getEntityStatus(source);

    for (let i = 0; i < n; ++i)
    {
        let target = targets[i];
        try
        {
            target = resolvePath(target);

            let targetStatus = getEntityStatus(target);
            if (targetStatus.isDir)
            {
                const dest = source.split(commonSourceDir)[1];
                if (dest)
                {
                    target = resolvePath(path.join(target, dest));
                }

                // If dest is a directory, we lose the forward slash, so we need to put it back
                if (sourceStatus.isDir)
                {
                    target = normalisePath(target, {isFolder: true});
                }

                targetStatus = getEntityStatus(target);
            }

            if (targetStatus.isFile)
            {
                // If the file exists already, we reject
                if (targetStatus.exists)
                {
                    if (!argv.force)
                    {
                        displayError(`The destination "${target}" already exists. Use --force option to overwrite. Skipping`, {fg: "red"});
                        continue;
                    }
                }

                // If the parent directory for this file does not exist, we reject it
                if (!fs.existsSync(targetStatus.dirPath))
                {
                    if (!(argv.force || argv.recursive))
                    {
                        displayError(`The folder "${targetStatus.dirPath}" for "${target}" does not exist. Use --force or --recursive options to create it. Skipping`, {fg: "red"});
                        continue;
                    }
                }
            }

            // Source and destination are the same
            if (resolvePath(source) === resolvePath(target))
            {
                ++errorFounds;
                displayError(`Cannot clone source into itself: ${target}`);
                continue;
            }

            if (sourceStatus.isFile)
            {
                copyFile(source, target, argv.force || argv.recursive );
            }
            else
            {
                if (targetStatus.isFile)
                {
                    if (targetStatus.exists)
                    {
                        displayError(`You cannot clone a directory [${source}] into an existing file [${target}].`);
                    }
                    else
                    {
                        displayError(`You cannot clone a directory [${source}] into a file [${target}].\n Use the --force option to override.`);
                    }
                    ++errorFounds;
                    continue;
                }

                 copyFolder(source, target);
            }
            ++count;
        }
        catch (e)
        {
            displayError(`Failed to clone "${target}": ${e.message}`);
        }
    }
    return {errorFounds, count};
}

const init = async () =>
{
    try
    {
        process.exitCode = 0;

        let sources = [], source = "";

        if (argv.hasOwnProperty("verbose"))
        {
            displayLog(`The option "--verbose" is deprecated. Use --silent instead`, {fg: "orange"});
        }

        if (argv.hasOwnProperty("overwrite"))
        {
            displayLog(`The option "--overwrite" is deprecated. Use --force instead`, {fg: "orange"});
            argv.force = argv.force || argv.overwrite;
        }

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

        let patterns = argv.sources;
        if (patterns)
        {
            if (!Array.isArray(patterns))
            {
                patterns = [patterns];
            }

            for (let i = 0; i < patterns.length; ++i)
            {
                const pattern = patterns[i] || "";
                if (!pattern)
                {
                    displayLog(`Empty pattern detected`);
                    continue;
                }

                const srcs = glob.sync(pattern, {
                    dot: true
                });

                if (!srcs.length)
                {
                    displayLog(`The pattern "${pattern}" does not match any file or directory`);
                    continue;
                }

                sources.push(...srcs);
            }

            sources = [...new Set(sources)];

            if (sources.length > LIMIT_FILES)
            {
                if (!argv.force)
                {
                    displayError(`More than ${LIMIT_FILES} files find in pattern. Use --force to allow the process`);
                    return;
                }
            }
        }

        if (argv.source)
        {
            source = argv.source;
            if (source)
            {
                sources.push(source);
            }
        }

        if (!argv.sources && !argv.sources)
        {
            if (argv._ && argv._.length)
            {
                source = argv._[0];
                sources.push(source);
                argv._ = argv._.slice(1);
            }
        }

        if (!sources.length)
        {
            displayError(`No source detected in arguments`);
            process.exitCode = 1;
            return;
        }

        const validSources = [];
        // Try to find early the real nature of every given source
        for (let i = 0; i < sources.length; ++i)
        {
            let source = sources[i] || "";
            source = source.trim();
            const checkSource = normaliseRealPath(source);
            if (!checkSource.success)
            {
                displayError(`The source file "${source}" does not exist, is inaccessible or is invalid`);
                continue;
            }

            source = checkSource.filepath;
            // Determine if the source does not have other issues
            const sourceStatus = getEntityStatus(source);
            if (sourceStatus.unhandledType)
            {
                displayError(`The source file "${source}" is not a file/directory`);
                process.exitCode = process.exitCode || 2;
                continue;
            }

            source = resolvePath(source);
            validSources.push(source);
        }

        if (!validSources.length)
        {
            process.exitCode = process.exitCode || 3;
            return;
        }

        let commonSourceDir = calculateCommon(validSources);
        commonSourceDir = resolvePath(commonSourceDir);

        for (let i = 0; i < validSources.length; ++i)
        {
            let source = validSources[i];

            // --------------------
            // Determine targets folders and files
            // --------------------
            let targets = getTargets();
            if (!targets)
            {
                continue;
            }

            // --------------------
            // Start cloning
            // --------------------
            let {errorFounds, count} = cloneToTargets(targets, {source, commonSourceDir});

            if (!count)
            {
                if (errorFounds)
                {
                    displayError(toAnsi.getTextFromColor(`${errorFounds} ${errorFounds === 1 ? "issue" : "issues"} detected`, {fg: "red"}));
                    process.exitCode = process.exitCode || 1;
                    return;
                }

                displayLog(`No file copied`, {fg: "gray"});
                process.exitCode = process.exitCode || 0;
                return;
            }
        }

        const message = `${count} ${count === 1 ? "item" : "items"} cloned`;
        displayLog(``.padEnd(message.length, "-"), {fg: "orange"});
        displayLog(message, {fg: "orange"});

        process.exitCode = process.exitCode || 0;
        return;

    }
    catch (e)
    {
        displayError(e.message);
    }

    process.exitCode = process.exitCode || 1;
};


init().then(() => true).catch(e => displayError(e));
