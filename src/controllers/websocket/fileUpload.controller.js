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




let File = {};


// ReadDir().then(x=>console.log(x));


module.exports = {
    handleStartUpload:async([payload,cb],{io,socket,event})=>{
        const {Name,Size,BufferSize} = payload;

        File = {  //Popuate file
            Name		: Name,
            FileSize 	: Size,
            Data	 	: "",
            Downloaded 	: 0
        }
        let Place = 0;
        try{
            // Check for existing file to resume
            let Stat = statSync(__dirname+'/'+Name);
            if (Stat.isFile()) {
                File.Downloaded = Stat.size;
                Place = Stat.size / BufferSize;
            }
        }catch(err){} 

        //It's a New File
        open(__dirname+"/"+Name, 'a', 0755, function(err, fd){
            if(err){
                console.log(err);
            } else {
                File['Handler'] = fd; //We store the file handler so we can write to it later
                socket.emit('MoreData', { 'Place' : Place, Percent : 0 });
            }
        });
    },
    handleUpload:async([payload,cb],{io,socket,even})=>{
        const {Name,Data,BufferSize} = payload;

		console.log(Name,'ane')

        File.Downloaded += Data.length;
			File.Data += Data;
			if (File.Downloaded == File.FileSize){ 

				//If File is Fully Uploaded
				write(File.Handler, File.Data, null, 'Binary', function(err, written){
					close(File.Handler, function(...args){
						socket.emit('DoneUpload', {'Name' : Name, 'Percent': 100});
					});
				});

			} else if (File.Data.length > 10485760){ 

				//If the Data Buffer reaches 10MB
				write(File.Handler, File.Data, null, 'Binary', function(err, written){
					File.Data = ""; //Reset The Buffer
					const Place = File.Downloaded / BufferSize;
					const Percent = Math.floor((File.Downloaded / File.FileSize) * 10000)/100;
					socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent});
				});

			} else {
                
				const Place = File.Downloaded / BufferSize;
				const Percent = Math.floor((File.Downloaded / File.FileSize) * 10000)/100;
				socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent});

			}
    }
}