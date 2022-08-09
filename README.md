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

#### Clone file into directory

```shell
$> clonefile license.txt my-dest-dir  
```

<br/>

#### Clone file to multiple locations

```shell
$> clonefile license.txt my-file-target-1 my-file-target-2 my-dest-dir-1/   
```

<br/>

## Options


| **Options** | **default** | **Expect**  | **Description**                          | 
|-------------|-------------|-------------|------------------------------------------|
| overwrite   | true        | boolean     | _Whether to overwrite destination_       |
| recursive   | false       | boolean     | _create target directories if necessary_ |
| silent      | false       | boolean     | _Whether to display messages_            |
| ~~verbose~~ | ~~true~~    | ~~boolean~~ | ~~_display errors + messages_~~          |



<br/>


