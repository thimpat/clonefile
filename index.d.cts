export const SKIP_MESSAGE: "skip-message";
export const LIMIT_FILES: number;

export type SourceDetail = {
    /**
     * Relative path to file
     */
    filepath: string;
    /**
     * Common directory to subtract from final calculation
     */
    commonSourceDir: string;
};
/**
 * Retrieve sources from command line
 * @returns {*[]}
 * @param argv_
 * @param argvSources
 * @param argvSource
 * @param silent
 * @param force
 * @param noLimit
 */
export function determineSources({ argv_, argvSources, argvSource, silent, force, noLimit }?: {
    argv_?: any;
    argvSources?: any;
    argvSource?: any;
    silent?: boolean;
    force?: boolean;
    noLimit?: boolean;
}): any[];
/**
 * Retrieve targets from command line
 * @param argv
 * @returns {*|*[]}
 */
export function determineTargets({ targets, argvTarget, argvTargets }?: {
    targets?: any[];
    argvTarget?: any;
    argvTargets?: any;
}): any | any[];
export function displayLog(message: any, { fg, silent }?: {
    fg?: string;
    silent?: boolean;
}): void;
export function displayHelpFile(): Promise<void>;
export function displayError(message: any, style?: {
    fg: string;
}): void;
/**
 * Copy a file
 * @param source
 * @param dest
 * @param isRecursive
 * @param silent
 * @param progressBar
 * @param dry
 * @returns {{success: boolean}|{success: boolean, dest}|boolean}
 */
export function copyFile(source: any, dest: any, { isRecursive, silent, progressBar, dry, }?: {
    isRecursive?: boolean;
    silent?: boolean;
    progressBar?: any;
    dry?: boolean;
}): {
    success: boolean;
} | {
    success: boolean;
    dest;
} | boolean;
/**
 * Copy a file to a folder
 * @param source
 * @param target
 * @param commonSourceDir
 * @param force
 * @param silent
 * @param progressBar
 * @param dry
 * @returns {{success: boolean}|{success: boolean, dest}}
 */
export function copyFileToFile(source: any, target: any, { force, silent, hideOverwriteError, progressBar, dry, }?: {
    force?: boolean;
    silent?: boolean;
    hideOverwriteError?: boolean;
    progressBar?: any;
    dry?: boolean;
}): {
    success: boolean;
} | {
    success: boolean;
    dest;
};
/**
 * Copy a file to a folder
 * @param source
 * @param targetFolder
 * @param commonSourceDir
 * @param force
 * @param silent
 * @param progressBar
 * @param dry
 * @returns {{success: boolean}|{success: boolean, dest}}
 */
export function copyFileToFolder(source: any, targetFolder: any, commonSourceDir: any, { force, silent, hideOverwriteError, progressBar, dry, }?: {
    force?: boolean;
    silent?: boolean;
    hideOverwriteError?: boolean;
    progressBar?: any;
    dry?: boolean;
}): {
    success: boolean;
} | {
    success: boolean;
    dest;
};
/**
 * Copy a file or a directory to a target directory
 * @param source
 * @param target
 * @param commonSourceDir
 * @param force
 * @param {*} targetStatus
 * @param silent
 * @param dry
 * @param {*} progressBar
 * @returns {{success: boolean}|{success: boolean}|{success: boolean, dest}}
 */
export function copySourceToTarget(source: any, target: any, commonSourceDir: any, { force, targetStatus, silent, hideOverwriteError, dry, progressBar }?: {
    force?: boolean;
    targetStatus?: any;
    silent?: boolean;
    hideOverwriteError?: boolean;
    dry?: boolean;
    progressBar?: any;
}): {
    success: boolean;
} | {
    success: boolean;
} | {
    success: boolean;
    dest;
};
/**
 * Copy a file or a directory to all the specified targets
 * @param targets
 * @param source
 * @param commonSourceDir
 * @param {boolean} force
 * @param left
 * @param silent
 * @param dry
 * @param progressBar
 * @param report
 * @returns {{count: number, errorFounds: number}}
 */
export function copyDetailedSourceToTargets(targets: any, { source, commonSourceDir, force, left, silent, dry, hideOverwriteError, progressBar, report }: {
    source: any;
    commonSourceDir: any;
    force: any;
    left?: number;
    silent?: boolean;
    dry?: boolean;
    hideOverwriteError?: boolean;
    progressBar?: any;
    report?: any[];
}): {
    count: number;
    errorFounds: number;
};
export function cloneSources(sources: any, targets: any, { force, progress, silent, clearProgress, dry, hideOverwriteError, report }?: {
    force?: boolean;
    progress?: boolean;
    silent?: boolean;
    clearProgress?: boolean;
    dry?: boolean;
    hideOverwriteError?: boolean;
    report?: any[];
}): {
    count: number;
};
export function cloneFromCLI(argv: any): {
    count: number;
    success: boolean;
    message: "skip-message";
    list: any[];
    report?: undefined;
} | {
    count: number;
    success: boolean;
    list: any[];
    message?: undefined;
    report?: undefined;
} | {
    count: number;
    success: boolean;
    list: any[];
    report: any[];
    message?: undefined;
} | {
    count: number;
    success: boolean;
    message?: undefined;
    list?: undefined;
    report?: undefined;
};
export function cloneGlobs(sources: any, targets: any, { silent, force, progress, clearProgress, list, listOnly, noLimit, dry }?: {
    silent?: boolean;
    force?: boolean;
    progress?: boolean;
    clearProgress?: boolean;
    list?: boolean;
    listOnly?: boolean;
    noLimit?: boolean;
    dry?: boolean;
}): false | {
    count: number;
    success: boolean;
    message: "skip-message";
    list: any[];
    report?: undefined;
} | {
    count: number;
    success: boolean;
    list: any[];
    message?: undefined;
    report?: undefined;
} | {
    count: number;
    success: boolean;
    list: any[];
    report: any[];
    message?: undefined;
} | {
    count: number;
    success: boolean;
    message?: undefined;
    list?: undefined;
    report?: undefined;
};
export function cloneFile(source: any, targets: any, { silent, force, progress, clearProgress, list, listOnly, noLimit, dry, hideOverwriteError }?: {
    silent?: boolean;
    force?: boolean;
    progress?: boolean;
    clearProgress?: boolean;
    list?: boolean;
    listOnly?: boolean;
    noLimit?: boolean;
    dry?: boolean;
    hideOverwriteError?: boolean;
}): false | {
    count: number;
    success: boolean;
    message: "skip-message";
    list: any[];
    report?: undefined;
} | {
    count: number;
    success: boolean;
    list: any[];
    message?: undefined;
    report?: undefined;
} | {
    count: number;
    success: boolean;
    list: any[];
    report: any[];
    message?: undefined;
} | {
    count: number;
    success: boolean;
    message?: undefined;
    list?: undefined;
    report?: undefined;
};
export function clonefile(...args: any[]): false | {
    count: number;
    success: boolean;
    message: "skip-message";
    list: any[];
    report?: undefined;
} | {
    count: number;
    success: boolean;
    list: any[];
    message?: undefined;
    report?: undefined;
} | {
    count: number;
    success: boolean;
    list: any[];
    report: any[];
    message?: undefined;
} | {
    count: number;
    success: boolean;
    message?: undefined;
    list?: undefined;
    report?: undefined;
};
export function clone(...args: any[]): false | {
    count: number;
    success: boolean;
    message: "skip-message";
    list: any[];
    report?: undefined;
} | {
    count: number;
    success: boolean;
    list: any[];
    message?: undefined;
    report?: undefined;
} | {
    count: number;
    success: boolean;
    list: any[];
    report: any[];
    message?: undefined;
} | {
    count: number;
    success: boolean;
    message?: undefined;
    list?: undefined;
    report?: undefined;
};
declare let errorFounds: number;
export {};
