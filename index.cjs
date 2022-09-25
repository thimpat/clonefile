#!/usr/bin/env node

/**
 * @typedef SourceDetail
 * @property {string} filepath Relative path to file
 * @property {string} commonSourceDir Common directory to subtract from final calculation
 */


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

const argv = minimist(process.argv.slice(2), {boolean: ["silent", "force"]});

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

/**
 * Copy a file
 * @param source
 * @param dest
 * @param isRecursive
 */
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
        return true;
    }
    catch (e)
    {
        displayError(e.message);
    }
    return false;
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

/**
 * Retrieve targets from command line
 * @param argv
 * @returns {*|*[]}
 */
function determineTargets(argv)
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
        displayError(`No detected targets in arguments (You can use --target to explicitely specifying some)`);
        return [];
    }

    return targets;
}

/**
 * Returns more detailed info source file related
 * @param src
 * @param commonSourceDir
 * @returns {{filepath: (string|*), commonSourceDir: (string|*)}|undefined}
 */
function getDetailedSource(src, commonSourceDir)
{
    try
    {
        const result = normaliseRealPath(src);
        if (!result.success)
        {
            displayError(`The source file "${result.filepath}" does not exist, is inaccessible or is invalid`);
            return;
        }

        commonSourceDir = normaliseRealPath(commonSourceDir).filepath;
        return {
            filepath       : result.filepath,
            commonSourceDir: commonSourceDir
        };
    }
    catch (e)
    {
        console.error({lid: 4281}, e.message);
    }

}

/**
 *
 * @returns {SourceDetail[]}
 */
function determineSourcesFromGlobs(patterns, commonSourceDir = "")
{
    const sources = [];

    try
    {
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

                let srcs = glob.sync(pattern, {
                    dot  : true,
                });

                if (!srcs.length)
                {
                    displayLog(`The pattern "${pattern}" does not match any file or directory`);
                    continue;
                }

                srcs = [...new Set(srcs)];

                commonSourceDir = commonSourceDir || calculateCommon(srcs);
                commonSourceDir = normaliseRealPath(commonSourceDir).filepath;

                srcs = srcs
                    .map(src => getDetailedSource(src, commonSourceDir))
                    // Remove undefined
                    .filter(element => !!element)
                    // Remove directory (Do not use nodir on
                    // glob as it would be too soon to calculate the common dir)
                    .filter(element => {
                        return fs.lstatSync(element.filepath).isFile();
                    });
                sources.push(...srcs);
            }

            if (sources.length > LIMIT_FILES)
            {
                if (!argv.force)
                {
                    displayError(`More than ${LIMIT_FILES} files find in pattern. Use --force to allow the process`);
                    return [];
                }
            }
        }
    }
    catch (e)
    {
        console.error({lid: 4113}, e.message);
    }

    return sources;
}

/**
 * Determine sources from the source argument that can be a single file
 * or an array
 * @param sourceArray
 * @returns {*[]}
 */
function determineSourcesFromArrays(sourceArray)
{
    const sources = [];
    try
    {
        if (sourceArray)
        {
            sourceArray = Array.isArray(sourceArray) ? sourceArray : [sourceArray];
            sourceArray = sourceArray.map(src => getDetailedSource(src, src)).filter(element => !!element);

            for (let i = 0; i < sourceArray.length; ++i)
            {
                const item = sourceArray[i];
                const source = item.filepath;
                if (!fs.existsSync(source))
                {
                    displayError(`Could not find ${source}`);
                    continue;
                }

                const stats = fs.lstatSync(source);
                if (stats.isFile())
                {
                    sources.push(item);
                    continue;
                }

                if (!stats.isDirectory())
                {
                    // Not a directory neither
                    displayError(`The source "${source}" is neither a file nor a directory. Skipping`, {fg: "red"});
                    continue;
                }

                let results = determineSourcesFromGlobs(source + "**", source);
                results.forEach(src =>
                {
                    src.commonSourceDir = source;
                });
                sources.push(...results);
            }

        }
    }
    catch (e)
    {
        console.error({lid: 4719}, e.message);
    }

    return sources;
}

/**
 * Retrieve sources from command line
 * @param argv
 * @returns {*[]}
 */
function determineSources(argv)
{
    const sources = [];
    try
    {
        let results = determineSourcesFromGlobs(argv.sources);
        if (results.length)
        {
            sources.push(...results);
        }

        results = determineSourcesFromArrays(argv.source);
        if (results.length)
        {
            sources.push(...results);
        }

        if (!sources.length)
        {
            if (argv._ && argv._.length)
            {
                displayError(`No detected source in arguments (You can use --source, --sources or pass at least one argument)`);
                return [];
            }

            const source = argv._.shift();
            sources.push(source);
        }

    }
    catch (e)
    {
        console.error({lid: 4573}, e.message);
    }

    return sources;
}

/**
 * Copy a file to a folder
 * @param source
 * @param target
 * @param commonSourceDir
 * @returns {boolean}
 */
function copyFileToFile(source, target, {force = false} = {})
{
    try
    {
        if (!force)
        {
            if (fs.existsSync(target))
            {
                displayError(`The destination "${target}" already exists. Use --force option to overwrite. Skipping`, {fg: "red"});
                return false;
            }
        }

        return copyFile(source, target);
    }
    catch (e)
    {
        console.error({lid: 4267}, e.message);
    }

    return false;
}

/**
 * Copy a file to a folder
 * @param source
 * @param target
 * @param commonSourceDir
 * @param force
 * @returns {boolean}
 */
function copyFileToFolder(source, target, commonSourceDir, {force = false} = {})
{
    try
    {
        const destinationFile = source.split(commonSourceDir)[1];
        const destinationPath = resolvePath(path.join(target, destinationFile));

        return copyFileToFile(source, destinationPath, {force});
    }
    catch (e)
    {
        console.error({lid: 4231}, e.message);
    }

    return false;
}

/**
 * Copy a file or a directory to a target directory
 * @param source
 * @param target
 * @param commonSourceDir
 * @param force
 * @returns {boolean}
 */
function copySourceToTarget(source, target, commonSourceDir, {force = false} = {})
{
    try
    {
        let targetStatus = getEntityStatus(target);

        if (resolvePath(source) === resolvePath(target))
        {
            ++errorFounds;
            displayError(`Cannot clone source into itself: ${target}`);
            return false;
        }

        // Copying a file to a directory
        if (targetStatus.isFile)
        {
            return copyFileToFile(source, target, {force});
        }
        else if (targetStatus.isDir)
        {
            return copyFileToFolder(source, target, commonSourceDir, {force});
        }

        displayError(`The source "${source}" is neither a file nor a directory. Skipping`, {fg: "red"});
    }
    catch (e)
    {
        console.error({lid: 4215}, e.message);
    }

    return false;
}

/**
 * Copy a file or a directory to all the specified targets
 * @param targets
 * @param source
 * @param commonSourceDir
 * @param force
 * @returns {{count: number, errorFounds: number}}
 */
function copyDetailedSourceToTargets(targets, {source, commonSourceDir, force})
{
    const n = targets.length;

    for (let i = 0; i < n; ++i)
    {
        let target = targets[i];
        try
        {
            target = resolvePath(target);

            if (!copySourceToTarget(source, target, commonSourceDir, {force}))
            {
                continue;
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

function cloneSources(sources, targets, {force = false} = {})
{
    let allCount = 0, errorFounds = 0, count = 0;
    try
    {
        for (let i = 0; i < sources.length; ++i)
        {
            let item = sources[i];

            ({errorFounds, count} = copyDetailedSourceToTargets(targets, {
                    source         : item.filepath,
                    commonSourceDir: item.commonSourceDir,
                    force
                })
            );

            allCount += count;
        }

        if (errorFounds)
        {
            displayError(toAnsi.getTextFromColor(`${errorFounds} ${errorFounds === 1 ? "issue" : "issues"} detected`, {fg: "red"}));
            process.exitCode = process.exitCode || 10;
        }

    }
    catch (e)
    {
        console.error({lid: 3451}, e.message);
    }

    return {count: allCount};
}

const init = async () =>
{
    try
    {
        if (argv.hasOwnProperty("verbose"))
        {
            displayLog(`The option "--verbose" is deprecated. Use --silent instead`, {fg: "orange"});
        }

        if (argv.hasOwnProperty("overwrite"))
        {
            displayLog(`The option "--overwrite" is deprecated. Use --force instead`, {fg: "orange"});
            argv.force = argv.force || argv.overwrite;
        }

        if (argv.hasOwnProperty("recursive"))
        {
            displayLog(`The option "--recursive" is deprecated. Use --force instead`, {fg: "orange"});
            argv.force = argv.force || argv.recursive;
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

        // --------------------
        // Determine source folders and files
        // --------------------
        const sources = determineSources(argv);
        if (!sources)
        {
            process.exitCode = process.exitCode || 1;
            return;
        }

        // --------------------
        // Determine targets folders and files
        // --------------------
        const targets = determineTargets(argv);
        if (!targets.length)
        {
            process.exitCode = process.exitCode || 2;
            return;
        }

        // --------------------
        // Start cloning
        // --------------------
        cloneSources(sources, targets, {force: argv.force});

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
