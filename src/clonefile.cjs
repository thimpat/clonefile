/**
 * @typedef SourceDetail
 * @property {string} filepath Relative path to file
 * @property {string} commonSourceDir Common directory to subtract from final calculation
 */


const fs = require("fs-extra");
const path = require("path");

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

const method = fs.copyFileSync ? "new" : "stream";

const packageJson = require("../package.json");

const LIMIT_FILES = parseInt(process.env.CLONE_FILE_MAX_PATTERN) || 5000;

let errorFounds = 0;

const displayLog = (message, {fg = "yellow", silent = false} = {}) =>
{
    if (silent)
    {
        return;
    }
    console.log(toAnsi.getTextFromColor(message, {fg}));
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
 * @param silent
 */
const copyFile = (source, dest, {isRecursive = true, silent = false} = {}) =>
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

        displayLog(`${source} => ${dest}`, {fg: "yellow", silent});
        return true;
    }
    catch (e)
    {
        displayError(e.message);
    }
    return false;
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
function determineTargets({targets = [], argvTarget = null, argvTargets = null} = {})
{
    if (argvTarget)
    {
        const targetList = Array.isArray(argvTarget) ? argvTarget : [argvTarget];
        targets.push(...targetList);
    }

    if (argvTargets)
    {
        const targetList = Array.isArray(argvTargets) ? argvTargets : [argvTargets];
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
 * @returns {{filepath: (string|*), commonSourceDir: (string|*)}|undefined}
 */
function getDetailedSource(src)
{
    try
    {
        const result = normaliseRealPath(src);
        if (!result.success)
        {
            displayError(`The source file "${src}" does not exist, is inaccessible or is invalid`);
            return;
        }

        return {
            filepath: result.filepath,
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
function determineSourcesFromGlobs(patterns, {commonDir = "", silent = false, force = false,} = {})
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
                let commonSourceDir = commonDir;
                const pattern = patterns[i] || "";
                if (!pattern)
                {
                    displayLog(`Empty pattern detected`, {silent});
                    continue;
                }

                let srcs = glob.sync(pattern, {
                    dot: true,
                });

                if (!srcs.length)
                {
                    displayLog(`The pattern "${pattern}" does not match any file or directory`, {silent});
                    continue;
                }

                if (srcs.length > LIMIT_FILES)
                {
                    if (!force)
                    {
                        displayError(`More than ${LIMIT_FILES} files find in glob patterns => ${pattern} . Use --force to allow the process`);
                        return [];
                    }
                }

                srcs = [...new Set(srcs)];

                commonSourceDir = commonSourceDir || calculateCommon(srcs);
                commonSourceDir = normaliseRealPath(commonSourceDir).filepath;

                srcs = srcs
                    .map(src =>
                    {
                        const res = getDetailedSource(src);
                        res.commonSourceDir = commonSourceDir;
                        return res;
                    })
                    // Remove undefined
                    .filter(element => !!element)
                    // Remove directory (Do not use nodir on
                    // glob as it would be too soon to calculate the common dir)
                    .filter(element =>
                    {
                        return fs.lstatSync(element.filepath).isFile();
                    });
                sources.push(...srcs);
            }

            if (sources.length > LIMIT_FILES)
            {
                if (!force)
                {
                    displayError(`More than ${LIMIT_FILES} files find in all glob patterns combined. Use --force to allow the process`);
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
 * @param silent
 * @returns {*[]}
 */
function determineSourcesFromArrays(sourceArray, {silent = false, force = false})
{
    const sources = [];
    try
    {
        if (sourceArray)
        {
            sourceArray = Array.isArray(sourceArray) ? sourceArray : [sourceArray];
            sourceArray = sourceArray.map(src =>
            {
                return getDetailedSource(src);
            }).filter(element => !!element);

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
                    let dir = path.parse(source).dir;
                    dir = normaliseRealPath(dir).filepath;
                    item.commonSourceDir = dir;
                    sources.push(item);
                    continue;
                }

                if (!stats.isDirectory())
                {
                    // Not a directory neither
                    displayError(`The source "${source}" is neither a file nor a directory. Skipping`, {fg: "red"});
                    continue;
                }

                let results = determineSourcesFromGlobs(source + "**", {commonDir: source, silent, force});
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
 * @returns {*[]}
 * @param argv_
 * @param argvSources
 * @param argvSource
 * @param silent
 */
function determineSources({argv_ = null, argvSources = null, argvSource = null, silent = false, force = false} = {})
{
    const sources = [];
    try
    {
        let results = determineSourcesFromGlobs(argvSources, {commondDir: "", silent, force});
        if (results.length)
        {
            sources.push(...results);
        }

        results = determineSourcesFromArrays(argvSource, {silent, force});
        if (results.length)
        {
            sources.push(...results);
        }

        if (!argvSources && !argvSource && !sources.length)
        {
            if (!argv_ || !argv_.length)
            {
                displayError(`No detected source in arguments (You can use --source, --sources or pass at least one argument)`);
                return [];
            }

            const source = argv_.shift();
            results = determineSourcesFromArrays(source, {silent, force});
            if (results.length)
            {
                sources.push(...results);
            }
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
function copyFileToFile(source, target, {force = false, silent = false} = {})
{
    try
    {
        if (!force)
        {
            if (fs.existsSync(target))
            {
                displayError(`The destination "${target}" for the file "${source}" already exists. Use --force option to overwrite. Skipping`, {fg: "red"});
                return false;
            }

            let dir = path.parse(target).dir;
            dir = normalisePath(dir, {isFolder: true});
            if (!fs.existsSync(dir))
            {
                displayError(`The folder "${dir}" does not exist. Use --force option to allow the action. Skipping`, {fg: "red"});
                return false;
            }

        }

        return copyFile(source, target, {silent});
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
 * @param targetFolder
 * @param commonSourceDir
 * @param force
 * @param silent
 * @returns {boolean}
 */
function copyFileToFolder(source, targetFolder, commonSourceDir, {force = false, silent = false} = {})
{
    try
    {
        const destinationFile = source.split(commonSourceDir)[1];
        const dest = joinPath(targetFolder, destinationFile);
        const destinationPath = resolvePath(dest);

        return copyFileToFile(source, destinationPath, {force, silent});
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
 * @param targetStatus
 * @returns {boolean}
 */
function copySourceToTarget(source, target, commonSourceDir, {force = false, targetStatus = null, silent = false} = {})
{
    try
    {
        targetStatus = targetStatus || getEntityStatus(target);
        if (resolvePath(source) === resolvePath(target))
        {
            ++errorFounds;
            displayError(`Cannot clone source into itself: ${target}`);
            return false;
        }

        // Copying a file to a directory
        if (targetStatus.isFile)
        {
            return copyFileToFile(source, target, {force, silent});
        }
        else if (targetStatus.isDir)
        {
            return copyFileToFolder(source, target, commonSourceDir, {force, silent});
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
 * @param left
 * @param silent
 * @returns {{count: number, errorFounds: number}}
 */
function copyDetailedSourceToTargets(targets, {source, commonSourceDir, force, left = 0, silent = false})
{
    let count = 0;
    const n = targets.length;

    for (let i = 0; i < n; ++i)
    {
        let target = targets[i];
        try
        {
            target = resolvePath(target);
            let targetStatus = getEntityStatus(target);

            if (!copySourceToTarget(source, target, commonSourceDir, {force, silent, targetStatus}))
            {
                continue;
            }

            if (targetStatus.isFile && left > 0)
            {
                if (force)
                {
                    displayLog(`${target} is a single file with ${left} more source(s) to copy over this same file`, {
                        fg: "#da2828",
                        silent
                    });
                }
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

function cloneSources(sources, targets, {force = false, silent = false} = {})
{
    let errorFounds = 0, count = 0;
    try
    {
        for (let i = 0; i < sources.length; ++i)
        {
            let item = sources[i];
            let counted = 0;

            ({errorFounds, count: counted} = copyDetailedSourceToTargets(targets, {
                    source         : item.filepath,
                    commonSourceDir: item.commonSourceDir,
                    force,
                    left           : sources.length - i - 1,
                    silent
                })
            );

            count += counted;
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

    return {count};
}

const cloneFromCLI = (argv) =>
{
    try
    {
        const force = argv.force;

        // --------------------
        // Determine source folders and files
        // --------------------
        const sources = determineSources({
            argv_      : argv._,
            argvSources: argv.sources,
            argvSource : argv.source,
            force,
            silent     : argv.silent
        });
        if (!sources || !sources.length)
        {
            process.exitCode = process.exitCode || 1;
            return;
        }

        // --------------------
        // Determine targets folders and files
        // --------------------
        const targets = determineTargets({targets: argv._, argvTarget: argv.target, argvTargets: argv.targets});
        if (!targets.length)
        {
            process.exitCode = process.exitCode || 2;
            return;
        }

        // --------------------
        // Start cloning
        // --------------------
        const {count} = cloneSources(sources, targets, {force, silent: argv.silent});

        return {count};
    }
    catch (e)
    {
        console.error({lid: 4321}, e.message);
    }

    return false;
};

const cloneGlobs = (sources, targets, {silent = false, force = true} = {}) =>
{
    try
    {
        const argCli = {sources, targets, silent, force};
        return cloneFromCLI(argCli);
    }
    catch (e)
    {
        console.error({lid: 4321}, e.message);
    }

    return false;
};

const clone = (source, targets, {silent = false, force = true} = {}) =>
{
    try
    {
        const argCli = {source, targets, silent, force};
        return cloneFromCLI(argCli);
    }
    catch (e)
    {
        console.error({lid: 4321}, e.message);
    }

    return false;
};

module.exports.determineSources = determineSources;
module.exports.determineTargets = determineTargets;

module.exports.displayLog = displayLog;
module.exports.displayHelpFile = displayHelpFile;
module.exports.displayHelpFile = displayHelpFile;
module.exports.displayError = displayError;
module.exports.copyFile = copyFile;
module.exports.copyFileToFile = copyFileToFile;
module.exports.copyFileToFolder = copyFileToFolder;
module.exports.copySourceToTarget = copySourceToTarget;
module.exports.copyDetailedSourceToTargets = copyDetailedSourceToTargets;
module.exports.cloneSources = cloneSources;

module.exports.cloneFromCLI = cloneFromCLI;

module.exports.cloneGlobs = cloneGlobs;
module.exports.clone = clone;
