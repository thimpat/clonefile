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

>> **NOTE:** The source and the target arguments can be omitted

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

#### Clone multiple files from the current directory to multiple directories with the --sources options (mandatory)

```shell
$> clonefile --force --sources *.txt my-dest-dir-1/ my-dest-dir-2/ my-dest-dir-3/  
```

**_Result_**

>> C:/projects/clonefile/somefile1.txt => C:/projects/clonefile/my-dir-1/somefile1.txt
> C:/projects/clonefile/somefile1.txt => C:/projects/clonefile/my-dir-2/somefile1.txt
> C:/projects/clonefile/somefile1.txt => C:/projects/clonefile/my-dir-3/somefile1.txt
>> --------------
>> 3 items cloned
> 
>> C:/projects/clonefile/somefile2.txt => C:/projects/clonefile/my-dir-1/somefile2.txt
> C:/projects/clonefile/somefile2.txt => C:/projects/clonefile/my-dir-2/somefile2.txt
> C:/projects/clonefile/somefile2.txt => C:/projects/clonefile/my-dir-3/somefile2.txt
> >--------------
> >3 items cloned
> 
> >C:/projects/clonefile/somefile3.txt => C:/projects/clonefile/my-dir-1/somefile3.txt
> C:/projects/clonefile/somefile3.txt => C:/projects/clonefile/my-dir-2/somefile3.txt
> C:/projects/clonefile/somefile3.txt => C:/projects/clonefile/my-dir-3/somefile3.txt
> >--------------
> >3 items cloned

<br/>

---

> The --force option is required for cloning a directory

----

> To help **clonefile** knows whether you want to copy a file to a directory or another file, 
> always add a trailing slash **"/"** to folders.


<br/>

---

## Options


| **Options**   | **default** | **Expect**  | **Description**                          | 
|---------------|-------------|-------------|------------------------------------------|
| --overwrite   | true        | boolean     | _Whether to overwrite destination_       |
| --recursive   | false       | boolean     | _create target directories if necessary_ |
| --silent      | false       | boolean     | _Whether to display messages_            |
| ~~--verbose~~ | ~~true~~    | ~~boolean~~ | ~~_display errors + messages_~~          |
| --force       | false       | boolean     | _To allow cloning a directory_           |



<br/>


