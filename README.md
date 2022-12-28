[![Test workflow](https://github.com/thimpat/clonefile/actions/workflows/test.yml/badge.svg)](https://github.com/thimpat/clonefile/actions/workflows/test.yml)
[![nycrc Coverage](https://img.shields.io/nycrc/thimpat/clonefile?preferredThreshold=lines)](https://github.com/thimpat/clonefile/blob/main/README.md)
[![npm version](https://badge.fury.io/js/clonefile.svg)](https://www.npmjs.com/package/clonefile)

## Installation

```shell
npm install clonefile [-g]
```

<br/>

---

## Usage

### In a Terminal

```shell
$> clonefile <source> <target> [options] 
```

```shell
$> clonefile [--source] <source> [--target] <target1> <target2>...<targetN>  [options] 
```

```shell
$> clonefile --sources <pattern> <target1> <target2>...<targetN>  [options] 
```


<br/>


### Programmatically

```javascript
const {clone} = require("clonefile");

// "Source" and "target" can be strings or arrays of strings
clone(source, target, {silent: true, force: true})
```

<br/>

---

## Examples

<br/>

#### Display file list in a directory without doing any copies 

```shell
$> clonefile my-dir/ --list-only
```

 💻  ↴
```json lines
[
   "./docs/images/img_1.png",
   "./docs/images/img_2.png",
   "./docs/images/img_3.png",
   "./docs/images/img_4.png",
   ...
]
```

<br/>

---

#### Clone a file

```shell
$> clonefile license.txt license.md  
```

or

```shell
$> clonefile --source license.txt --target license.md  
```

<br/>

> **NOTE:** The source and the target arguments can be omitted

<br/>

---

<br/>

#### Clone a file into directory

```shell
# Copy license.txt into my-dest-dir
$> clonefile license.txt my-dest-dir/  
```

<br/>


---

<br/>

#### Clone a file to multiple locations

```shell
# Copy license.txt into my-file-target-1 (file), my-file-target-2 (file) and within (my-dest-dir-1/) (directory)
$> clonefile license.txt my-file-target-1 my-file-target-2 my-dest-dir-1/   
```

<br/>

---

<br/>

#### Clone a directory in multiple directories

```shell
$> clonefile --force sourcedir/ my-dest-dir-1/ my-dest-dir-2/ my-dest-dir-3/  
```

<br/>

---

<br/>

#### Clone multiple files from a glob pattern to multiple directories with the --sources options (mandatory)

```shell
$> clonefile --force --sources *.txt my-dest-dir-1/ my-dest-dir-2/ my-dest-dir-3/  
```

**_Result_**

> >C:/projects/clonefile/somefile1.txt => C:/projects/clonefile/my-dir-1/somefile1.txt
> C:/projects/clonefile/somefile1.txt => C:/projects/clonefile/my-dir-2/somefile1.txt
> C:/projects/clonefile/somefile1.txt => C:/projects/clonefile/my-dir-3/somefile1.txt
> --------------
> 3 items cloned
> 
> >C:/projects/clonefile/somefile2.txt => C:/projects/clonefile/my-dir-1/somefile2.txt
> C:/projects/clonefile/somefile2.txt => C:/projects/clonefile/my-dir-2/somefile2.txt
> C:/projects/clonefile/somefile2.txt => C:/projects/clonefile/my-dir-3/somefile2.txt
> --------------
> 3 items cloned
> 
> >C:/projects/clonefile/somefile3.txt => C:/projects/clonefile/my-dir-1/somefile3.txt
> C:/projects/clonefile/somefile3.txt => C:/projects/clonefile/my-dir-2/somefile3.txt
> C:/projects/clonefile/somefile3.txt => C:/projects/clonefile/my-dir-3/somefile3.txt
> --------------
> 3 items cloned

<br/>

---

## Notes

<br/>

> NOTE: The --force option is required for cloning a directory

----

> To help **clonefile** knows whether you want to copy a file to a directory or another file, 
> always add a trailing slash **"/"** to folders.


<br/>


---
<br/>

#### Clone files using multiple glob patterns to multiple directories

```shell
$> clonefile --force --sources *.txt --sources ./sowehere/ --sources ../another-location/*.png my-dest-dir-1/ my-dest-dir-2/ my-dest-dir-3/  
```

<br/>

---

#### Clone multiple files and folders from multiple locations and files and folders from multiple glob patterns to multiple directories

```shell
$> clonefile --force --source my-file-1 --source path1/my-file-2 --source path1/my-dir/ --sources *.txt --sources /another-location/*.png my-dest-dir-1/ my-dest-dir-2/ my-dest-dir-3/  
```

> ###### "_my-file-1_" and "_path1/my-file-2_" are regular files and will be copied                       to "my-dest-dir-1/", "my-dest-dir-2/", "my-dest-dir-3/"
> 
> ---
> 
> ###### _"path1/my-dir/"_ is a directory that will be copied                                         to "my-dest-dir-1/", "my-dest-dir-2/", "my-dest-dir-3/" 
> 
> ---
> 
> ###### _"*.txt"_ will copy all .txt in the current directory                                        to "my-dest-dir-1/", "my-dest-dir-2/", "my-dest-dir-3/"
> 
> ---
> 
> ###### "_/another-location/*.png_" my-dest-dir-1/ will copy all .png in /another-location           to "my-dest-dir-1/", "my-dest-dir-2/", "my-dest-dir-3/"
> 
> ---

<br/>

---

## Options


| **Options**                | **default** | **Expect**  | **Description**                                                                              | 
|----------------------------|-------------|-------------|----------------------------------------------------------------------------------------------|
| --silent                   | false       | boolean     | _Whether to display messages_                                                                |
| --sources                  | ""          | string      | _Glob Pattern to determine files to copy_                                                    |
| --source                   | ""          | string      | _Regular file path for files or directories to copy_                                         |
| --target                   | ""          | string      | _Destination files or folders_                                                               |
| ~~--overwrite~~ (obsolete) | ~~true~~    | ~~boolean~~ | ~~_Whether to overwrite destination_~~                                                       |
| ~~--recursive~~ (obsolete) | ~~false~~   | ~~boolean~~ | ~~_create target directories if necessary_~~                                                 |
| --force    **              | false       | boolean     | _To allow cloning a directory_                                                               |
| --progress                 | false       | boolean     | _Display a progress bar during copy_                                                         |
| --clearProgress            | false       | boolean     | _Remove the progress bar when task complete_                                                 |
| --list                     | false       | boolean     | _Print out the file list to copy_                                                            |
| --list-only                | false       | boolean     | _Only display the file list to copy in an array formatted for Js. <br/>No copy will be done_ |
| --dry                      | false       | boolean     | _Print out all operations, but without making any copies_                                    |
| --no-limit                 | false       | boolean     | _Ignore the limit set on copies (10000 by default)._                                         |

<br/>

#### --progress

![--progress option example](https://raw.githubusercontent.com/thimpat/demos/main/clonefile/images/progress-during-copy.gif)

## Changelog

##### current:
*  Generate code for ESM with to-esm
*  Fix help command not working


##### 3.5.0:
*  Replace the --force option with --no-limit to allow unlimited copies
*  Increase the default limit for copying at once to 10000 (Use --no-limit to remove limitation)
*  Copy with no limit when cloning programmatically and add a --no-limit option (cli) to enforce unlimited copies
*  Add --list, --list-only and --dry options


##### 3.4.0:
*  Add the option --clearProgress


##### 3.3.0:
*  Add a --progress option to display a progress bar while copying


##### 3.2.6:
*  Copy symlinks


##### 3.2.5:
*  Fix --force option not working with cloneGlobs


##### 3.2.4:
*  Review file limits processing (5000 instead of 200)
   (To increase or reduce that limit, create an environment variable called CLONE_FILE_MAX_PATTERN and pass the 
   new limit)

##### 3.2.3:
*  Increase limit files to copy from 200 to 5000
*  Fix js error in cloneGlobs


##### 3.2.1:
*  Use clone and cloneGlobs for programmatic copies

##### 3.2.0:
*  Import the clone function to copy from code

##### 3.1.0:
*  Add various fixes
*  Deprecate the --recursive option with --force
*  Allow selecting multiple sources with the --source option

##### 2.1.1:
*  Do not stop at the first error

##### 1.1.3:
*  Make --force option automatically be --recursive and --overwrite

##### 1.1.0:
*  Allow cloning a directory
*  Replace the --verbose option with --silent
*  Fix cloning when options misplaced



---
