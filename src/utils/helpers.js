let { 
	readFile, 
	statSync, 
	stat,
	open, 
	write, 
	close,
	readdir
} = require('fs');
const path = require('path');
const { promisify } = require('util');

readdir = promisify(readdir);
stat = promisify(stat);
const filesDir = path.join(__dirname,'..','bucket','')
const sysFiles = [
	'$RECYCLE.BIN',
	'MSOCache',
	'Recovery',
	'Recycler',
	'System Volume Information',
	'Thumbs.db',
];
const ReadDir = async (dir = filesDir)=>{
	try{
		let DirContents = {
			error: null,
			location: dir,
			folders: [],
			files: []
		};

		let dirList = await readdir(dir);
		
		dirList = dirList.filter(x=>!sysFiles.includes(x));

		dirList.forEach( (file)=>{
			const FileInfo =  statSync(dir + '/'+ file);
			if (FileInfo.isDirectory()) {
				DirContents.folders.push({name: file, stat: FileInfo, loc: dir });
			}else{
				DirContents.files.push({ name: file, stat: FileInfo, loc: dir });
			}
		});
		
		return DirContents;
	}catch(err){
		let DirContents = {
			error: err,
			location: dir,
			folders: [],
			files: []
		};
		return DirContents;
	}
}

module.exports = {
 ReadDir,
 sysFiles
}