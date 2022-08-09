## Installation

```shell
npm install clonefile [-g]
```

<br/>

## Usage

### In a Terminal

```shell
$> clonefile source target
```

<br/>

## Example

<br/>

#### Clone file

```shell
$> clonefile license.txt license.md  
```

or

```shell
$> clonefile --source license.txt --target license.md  
```

<br/>

#### Clone a file into directory

```shell
# Copy license.txt into my-dest-dir
$> clonefile license.txt my-dest-dir/  
```

<br/>

#### Clone a file to multiple locations

```shell
# Copy license.txt into my-file-target-1 (file), my-file-target-2 (file) and within (my-dest-dir-1/) (directory)
$> clonefile license.txt my-file-target-1 my-file-target-2 my-dest-dir-1/   
```

<br/>

#### Clone a directory in multiple directories

```shell
$> clonefile --force license.txt my-dest-dir-1/ my-dest-dir-2/ my-dest-dir-3/  
```

---

> The --force option is required for cloning a directory

----

> To help **clonefile** knows whether you want to copy a file to a directory or another file, 
> always add a trailing slash **"/"** to folders.


<br/>


## Options


| **Options**   | **default** | **Expect**  | **Description**                          | 
|---------------|-------------|-------------|------------------------------------------|
| --overwrite   | true        | boolean     | _Whether to overwrite destination_       |
| --recursive   | false       | boolean     | _create target directories if necessary_ |
| --silent      | false       | boolean     | _Whether to display messages_            |
| ~~--verbose~~ | ~~true~~    | ~~boolean~~ | ~~_display errors + messages_~~          |
| --force       | false       | boolean     | _To allow cloning a directory_           |



<br/>


