const { model, Schema } = require("mongoose");

const schemaOptions = {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
};

// Bucket file
const bucket_file = model("bucket_files",new Schema({
    name:{
        type:String,
        required:true
    },
    original_name:{
        type:String,
        required:true,
    },
    file_size:{
        type:Number,
        required:true
    },
    file_type:{
        type:String,
        required:true
    },
    file_destination:{
        type:String,
        required:true
    },
    isPrivate:{
        type:String,
        required:true,
        default:false,
    },
    public_slug:{
        type:String,
        required:true
    },
    thumbnail_url:{
        type:String, 
    },
    accessKey:{
        type:String
    },
    owner:{
        type:String,
        // required:true
    },

},schemaOptions),'bucket_files')



module.exports = {
    bucket_file,
}