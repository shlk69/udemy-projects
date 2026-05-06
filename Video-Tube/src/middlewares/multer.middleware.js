import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null,'./public/temp')
    },
    filename: function (req, res, cb) {
        const uniqueSuffix = Date.now + '-' + Math.round(Math.random() * 1E9)
        cb(null,this.filename.filename + "-" + uniqueSuffix)
    }
})

export const upload = multer({storage})