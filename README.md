[![Test workflow](https://github.com/thimpat/clonefile/actions/workflows/test.yml/badge.svg)](https://github.com/thimpat/clonefile/actions/workflows/test.yml)
[![nycrc Coverage](https://img.shields.io/nycrc/thimpat/clonefile?preferredThreshold=lines)](https://github.com/thimpat/clonefile/blob/main/README.md)
[![npm version](https://badge.fury.io/js/clonefile.svg)](https://www.npmjs.com/package/clonefile)

## Installation

```shell
npm install clonefile [-g]
```

<br/>

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

## Example

<br/>

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


| **Options**   | **default** | **Expect**  | **Description**                          | 
|---------------|-------------|-------------|------------------------------------------|
| --overwrite   | true        | boolean     | _Whether to overwrite destination_       |
| --recursive   | false       | boolean     | _create target directories if necessary_ |
| --silent      | false       | boolean     | _Whether to display messages_            |
| --force       | false       | boolean     | _To allow cloning a directory_           |
| --sources     | ""          | string      | _Glob Pattern to select files to copy_   |
| --source      | ""          | string      | _File or directory to copy_              |
| --target      | ""          | string      | _Destination files or folders_           |



<br/>


