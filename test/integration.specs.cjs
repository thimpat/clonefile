const chai = require("chai");
const expect = chai.expect;

const chaiFiles = require("chai-files");
chai.use(chaiFiles);
const {file, dir} = chaiFiles;

const shell = require("shelljs");
const fs = require("fs");

const cloneFile = `../index.cjs`;

const packageJson = require("../package.json");

describe("CloneFile", function ()
{
    this.timeout(20000);

    before(async function ()
    {
        process.chdir("./test");
    });


    describe("simple command", () =>
    {
        it("should display the correct version", function ()
        {
            const {stdout} = shell.exec(`node ${cloneFile} -v`, {silent: false});
            expect(stdout)
                .to.contain(packageJson.version);
        });

        it("should ask to use ", function ()
        {
            const {stdout} = shell.exec(`node ${cloneFile} --verbose`, {silent: false});
            expect(stdout)
                .to.contain(`The option "--verbose" is deprecated. Use --silent instead`);
        });

        it("should ask to use force", function ()
        {
            const {stdout} = shell.exec(`node ${cloneFile} --overwrite`, {silent: false});
            expect(stdout)
                .to.contain(`The option "--overwrite" is deprecated. Use --force instead`);
        });


    });

    describe("on miscellaneous", () =>
    {
        beforeEach(async function ()
        {
            if (fs.existsSync("output"))
            {
                fs.rmSync("output", {recursive: true});
            }
        });

        it("should fail when no target is passed", function ()
        {
            const {stderr} = shell.exec(`node ${cloneFile} work/file-1.txt`, {silent: false});
            expect(stderr)
                .to.contain(`No targets given`);
        });

        it("should fail when only the --source option is given", function ()
        {
            const {stderr} = shell.exec(`node ${cloneFile} --source work/file-1.txt`, {silent: false});
            expect(stderr)
                .to.contain(`No targets given`);
        });

        it("should fail when no source is passed", function ()
        {
            const {stderr} = shell.exec(`node ${cloneFile} --target output`, {silent: false});
            expect(stderr)
                .to.contain("Error: No source detected in arguments");
        });

        it("should fail when the source does not exist", function ()
        {
            const {stderr} = shell.exec(`node ${cloneFile} ttt`, {silent: false});
            expect(stderr)
                .to.contain("Error: The source file \"ttt\" does not exist, is inaccessible or is invalid");
        });

        it("should fail when the source does not exist and the target exits", function ()
        {
            const {stderr} = shell.exec(`node ${cloneFile} ttt output/`, {silent: false});
            expect(stderr)
                .to.contain(`Error: The source file "ttt" does not exist, is inaccessible or is invalid`);
        });


    });

    describe("on files", () =>
    {
        beforeEach(async function ()
        {
            if (fs.existsSync("output"))
            {
                fs.rmSync("output", {recursive: true});
            }
        });

        it("should not clone a file into a non-existing directory", async function ()
        {
            const {stderr} = shell.exec(`node ${cloneFile} work/file-1.txt output/file-2.md`, {silent: false});

            expect(stderr)
                .to.contain("The folder")
                .to.contain("does not exist")
                .to.contain("Use --force or --recursive options to create it");
        });

        it("should clone into non-existing directory with the --force option", async function ()
        {
            const {stdout} = shell.exec(`node ${cloneFile} work/file-1.txt output/file-2.md --force`, {silent: false});

            expect(stdout)
                .to.contain("/work/file-1.txt")
                .to.contain("/output/file-2.md")
                .to.contain("1 item cloned");
        });

        it("should not clone a file when the target file already exists", async function ()
        {
            const {stderr} = shell.exec(`node ${cloneFile} work/file-1.txt output/file-2.md`, {silent: false});

            expect(stderr)
                .to.contain("Error: The folder")
                .to.contain("does not exist")
                .to.contain("Use --force or --recursive options to create it. Skipping");
        });

        it("should not clone a file when the target file already exists especially with the overwrite option" +
            " set to false", async function ()
        {
            const {stderr} = shell.exec(`node ${cloneFile} work/file-1.txt output/file-2.md --force false`, {silent: false});

            expect(stderr)
                .to.contain("Error: The folder")
                .to.contain("does not exist")
                .to.contain("Use --force or --recursive options to create it. Skipping");
        });


        it("should tell cloning has succeeded", async function ()
        {
            fs.mkdirSync("output");
            const {stdout} = shell.exec(`node ${cloneFile} work/file-1.txt output/file-3.md`, {silent: false});

            expect(stdout)
                .to.contain("work/file-1.txt")
                .to.contain("output/file-3.md")
                .to.contain("1 item cloned");
        });

        it("should clone a file", async function ()
        {
            fs.mkdirSync("output");
            shell.exec(`node ${cloneFile} work/file-1.txt output/file-3.md`, {silent: false});
            expect(file(`output/file-3.md`)).to.exist;
        });

    });

    describe("on directories", () =>
    {
        beforeEach(async function ()
        {
            if (fs.existsSync("output"))
            {
                fs.rmSync("output", {recursive: true});
            }
        });

        it("should fail to clone a directory into a non existing file", async function ()
        {
            const {stderr} = shell.exec(`node ${cloneFile} work/my-dir ./output.txt`, {silent: false});

            expect(stderr)
                .to.contain("Error: You cannot clone a directory")
                .to.contain("into a file")
                .to.contain("Use the --force option to override");
        });

        it("should confirm cloning a directory into another directory", async function ()
        {
            const {stdout} = shell.exec(`node ${cloneFile} work/my-dir ./output`, {silent: false});

            expect(stdout)
                .to.contain("/work/my-dir/ =>")
                .to.contain("/output/")
                .to.contain("1 item cloned");
        });

        it("should clone a directory into another directory and keep the structure", async function ()
        {
            shell.exec(`node ${cloneFile} work/my-dir ./output`, {silent: false});

            expect(dir("output")).to.exist;
            expect(dir("output/some")).to.exist;
            expect(dir("output/some/more")).to.exist;
            expect(dir("output/some/more/depth")).to.exist;
            expect(file("output/some/more/depth/file-1.txt")).to.exist;
            expect(file("output/some/more/depth/file-2.txt")).to.exist;
            expect(file("output/file-1.txt")).to.exist;
            expect(file("output/my-file1.txt")).to.exist;
        });

        it("should fail to clone a directory into a file", async function ()
        {
            fs.mkdirSync("output");
            fs.writeFileSync("output/file-2.md", "some data");
            const {stderr} = shell.exec(`node ${cloneFile} work/my-dir output/file-2.md`, {silent: false});

            expect(stderr)
                .to.contain("The destination")
                .to.contain("/output/file-2.md")
                .to.contain("already exists")
                .to.contain("Use --force option to overwrite");
        });


    });

    describe("multiple directories feature", function ()
    {
        beforeEach(async function ()
        {
            if (fs.existsSync("output"))
            {
                fs.rmSync("output", {recursive: true});
            }
        });

        it("should fail to clone a file into multiple directories", function ()
        {
            const {stderr} = shell.exec(`node ${cloneFile} work/file-1.txt ./output/somewhere1/ ./output/somewhere2/ ./output/somewhere3/`, {silent: false});

            expect(stderr)
                .to.contain("Error: The folder ")
                .to.contain("Use --force or --recursive options to create it. Skipping")
                .to.contain("/output/somewhere1/file-1.txt")
                .to.contain("/output/somewhere2/file-1.txt")
                .to.contain("/output/somewhere3/file-1.txt");
        });

        it("should clone a file into multiple directories with the recursive option", function ()
        {
            const {stdout} = shell.exec(`node ${cloneFile} work/file-1.txt ./output/somewhere1/ ./output/somewhere2/ ./output/somewhere3/ --recursive`, {silent: false});

            expect(stdout)
                .to.contain("/output/somewhere1/file-1.txt")
                .to.contain("/output/somewhere2/file-1.txt")
                .to.contain("/somewhere3/file-1.txt")
                .to.contain("3 items cloned");
        });

        it("should clone a file into multiple directories and multiple files", function ()
        {
            const {stdout} = shell.exec(`node ${cloneFile} work/file-1.txt ./output/file-01.txt ./output/file-02.txt ./output/somewhere1/ ./output/somewhere2/ --recursive`, {silent: false});

            expect(stdout)
                .to.contain("/output/file-01.txt")
                .to.contain("/output/file-02.txt")
                .to.contain("/output/somewhere1/file-1.txt")
                .to.contain("/output/somewhere2/file-1.txt")
                .to.contain("4 items cloned");
        });


    });

    describe("silent feature", function ()
    {
        beforeEach(async function ()
        {
            if (fs.existsSync("output"))
            {
                fs.rmSync("output", {recursive: true});
            }
        });

        it("should display errors despite the silent option", function ()
        {
            const {stderr} = shell.exec(`node ${cloneFile} work/file-1.txt ./output/somewhere1/ ./output/somewhere2/ ./output/somewhere3/ --silent`, {silent: false});

            expect(stderr)
                .to.contain("Error: The folder ")
                .to.contain("Use --force or --recursive options to create it. Skipping")
                .to.contain("/output/somewhere1/file-1.txt")
                .to.contain("/output/somewhere2/file-1.txt")
                .to.contain("/output/somewhere3/file-1.txt");
        });

        it("should clone a file into multiple directories with the recursive option", function ()
        {
            const {stdout} = shell.exec(`node ${cloneFile} work/file-1.txt ./output/somewhere1/ ./output/somewhere2/ ./output/somewhere3/ --recursive --silent`, {silent: false});

            expect(stdout)
                .to.be.empty;

            expect(dir("output")).to.exist;
            expect(dir("output/somewhere1")).to.exist;
            expect(dir("output/somewhere2")).to.exist;
            expect(dir("output/somewhere3")).to.exist;
            expect(file("output/somewhere1/file-1.txt")).to.exist;
            expect(file("output/somewhere2/file-1.txt")).to.exist;
            expect(file("output/somewhere3/file-1.txt")).to.exist;
        });

        it("should clone a file into multiple directories and multiple files", function ()
        {
            const {stdout} = shell.exec(`node ${cloneFile} work/file-1.txt ./output/file-01.txt ./output/file-02.txt ./output/somewhere1/ ./output/somewhere2/ --recursive --silent`, {silent: false});

            expect(stdout)
                .to.be.empty;

            expect(dir("output")).to.exist;
            expect(dir("output/somewhere1")).to.exist;
            expect(dir("output/somewhere2")).to.exist;
            expect(file("output/somewhere1/file-1.txt")).to.exist;
            expect(file("output/somewhere2/file-1.txt")).to.exist;
            expect(file("output/file-01.txt")).to.exist;
            expect(file("output/file-02.txt")).to.exist;

        });

        it("should clone a directory into another directory silently and keep the structure", async function ()
        {
            const {stdout} = shell.exec(`node ${cloneFile} work/my-dir ./output --silent`, {silent: false});

            expect(stdout)
                .to.be.empty;

            expect(dir("output")).to.exist;
            expect(dir("output/some")).to.exist;
            expect(dir("output/some/more")).to.exist;
            expect(dir("output/some/more/depth")).to.exist;
            expect(file("output/some/more/depth/file-1.txt")).to.exist;
            expect(file("output/some/more/depth/file-2.txt")).to.exist;
            expect(file("output/file-1.txt")).to.exist;
            expect(file("output/my-file1.txt")).to.exist;
        });

    });

    describe("masks on sources feature", function ()
    {
        beforeEach(async function ()
        {
            if (fs.existsSync("output"))
            {
                fs.rmSync("output", {recursive: true});
            }
        });

        it("should copy all txt in cool-1 to the output directory", function ()
        {
            const {stdout, stderr} = shell.exec(`node ${cloneFile} --sources *.txt output`, {silent: false});

            expect(stdout)
                .to.contain("The pattern \"*.txt\" does not match any file or directory");

            expect(stderr)
                .to.contain("Error: No source detected in arguments");
        });

        it("should fail to find some txt in the current directory", function ()
        {
            const {stdout, stderr} = shell.exec(`node ${cloneFile} --sources *.text output`, {silent: false});

            expect(stdout)
                .to.contain(`The pattern "*.text" does not match any file or directory`);

            expect(stderr)
                .to.contain("Error: No source detected in arguments");
        });

        it("should fail to copy all txt in the work directory to output", function ()
        {
            const {stderr} = shell.exec(`node ${cloneFile} --sources work/cool-1/*.txt output`, {silent: false});

            expect(stderr)
                .to.contain(`Use --force or --recursive options to create it. Skipping`);
        });

        it("should copy all txt in the cool-1 directory to the output directory", function ()
        {
            const {stdout} = shell.exec(`node ${cloneFile} --sources work/cool-1/*.txt output --recursive`, {silent: false});

            expect(stdout)
                .to.contain(`/output/aaa.txt`)
                .to.contain(`/output/bbb.txt`)
                .to.contain(`/output/ccc.txt`)
                .to.contain(`3 items cloned`);
        });

        it("should copy all txt in the cool-1 directory and sub-directories to the output directory", function ()
        {
            const {stdout} = shell.exec(`node ${cloneFile} --sources work/cool-1/**/*.txt output --recursive`, {silent: false});

            expect(stdout)
                .to.contain(`/output/work/cool-1/aaa.txt`)
                .to.contain(`/output/work/cool-1/bbb.txt`)
                .to.contain(`/output/work/cool-1/ccc.txt`)
                .to.contain(`/output/work/cool-1/stuff/ddd.txt`)
                .to.contain(`/output/work/cool-1/stuff/eee.txt`)
                .to.contain(`/output/work/cool-1/stuff/fff.txt`)
                .to.contain(`/output/work/cool-1/stuff/out/ggg.txt`)
                .to.contain(`/output/work/cool-1/stuff/out/hhh.txt`)
                .to.contain(`/output/work/cool-1/stuff/out/iii.txt`)
                .to.contain(`/output/work/cool-1/stuff/out/there/jjj.txt`)
                .to.contain(`/output/work/cool-1/stuff/out/there/kkk.txt`)
                .to.contain(`/output/work/cool-1/stuff/out/there/kkk.txt`)
                .to.contain(`12 items cloned`);
        });

        it("should copy all txt in all cool directories and sub-directories to the output directory", function ()
        {
            const {stdout} = shell.exec(`node ${cloneFile} --sources work/cool-1/**/*.txt --sources work/cool-2/**/*.txt --sources work/cool-3/**/*.txt output --recursive`, {silent: false});

            expect(stdout)
                .to.contain(`The pattern "work/cool-3/**/*.txt" does not match any file or directory`)
                .to.contain(`/output/work/cool-1/aaa.txt`)
                .to.contain(`/output/work/cool-1/bbb.txt`)
                .to.contain(`/output/work/cool-1/ccc.txt`)
                .to.contain(`/output/work/cool-1/stuff/ddd.txt`)
                .to.contain(`/output/work/cool-1/stuff/eee.txt`)
                .to.contain(`/output/work/cool-1/stuff/fff.txt`)
                .to.contain(`/output/work/cool-1/stuff/out/ggg.txt`)
                .to.contain(`/output/work/cool-1/stuff/out/hhh.txt`)
                .to.contain(`/output/work/cool-1/stuff/out/iii.txt`)
                .to.contain(`/output/work/cool-1/stuff/out/there/jjj.txt`)
                .to.contain(`/output/work/cool-1/stuff/out/there/kkk.txt`)
                .to.contain(`/output/work/cool-1/stuff/out/there/kkk.txt`)
                .to.contain(`24 items cloned`);


        });

    });


});


