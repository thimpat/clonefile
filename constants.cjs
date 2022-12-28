const LIMIT_FILES = parseInt(process.env.CLONE_FILE_MAX_PATTERN) || 5000;

module.exports.LIMIT_FILES = LIMIT_FILES;
module.exports.SKIP_MESSAGE = "skip-message";