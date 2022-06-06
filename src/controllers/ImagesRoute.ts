import {Router} from "express";
import multer from "multer"
import sharp from "sharp"
import {JPEG, PNG} from "../constants/mimetypes";
import fs from "fs";
import ImagesService from "../services/Images.service";
import {ErrorHandler} from "../lib/errorHandler";

const outputFolderName = './uploads';

const route = Router()
const upload = multer({
    // limits: { fileSize: oneMegabyteInBytes * 2 },
    storage: multer.diskStorage({
        destination: outputFolderName,
        filename: (req, file, cb) => cb(null, file.originalname),
    }),
    fileFilter: (req, file, cb) => {
        const acceptFile: boolean = ['image/jpeg', 'image/png'].includes(file.mimetype);
        cb(null, acceptFile);
    },
});

route.get("/:id", async (req, res) => {
    const id = req.params.id
    let {width, quality} = req.query
    if (isNaN(Number(width))) width = null
    if (isNaN(Number(quality)) || Number(quality) > 100 || Number(quality) < 0) quality = "100"
    const result = await ImagesService.getImage(id)
    if (result) {
        try {
            const imageBuffer = fs.readFileSync(result.filepath);
            const sharped = sharp(imageBuffer)
                .resize({width: width ? parseInt(width as string) : null})
            if (result.mimetype === JPEG) {
                sharped.jpeg({
                    quality: Number(quality)
                })
            } else if (result.mimetype === PNG) {
                sharped.png({
                    quality: Number(quality)
                })
            }
            const buffer = await sharped.toBuffer()
            res.setHeader('Content-Type', result.mimetype);
            res.send(buffer);
        } catch (e) {
            console.log(e)
            res.status(500).json({error: 'Что-то пошло не так, попробуй еще раз или измени запрос'});
        }
    } else {
        res.status(400).json({error: "Изображение не найдено"});
    }
})

route.post("/", upload.single("upload"), async (req, res) => {
    const {filename, mimetype, path: filepath} = req.file;
    const sharped = sharp(filepath)
    if (mimetype === JPEG) {
        sharped.jpeg({
            quality: 85
        })
    } else if (mimetype === PNG) {
        sharped.png({
            quality: 85
        })
    }
    const buffer = await sharped.toBuffer()
    fs.writeFileSync(filepath, buffer)
    const result = await ImagesService.upload({filename, mimetype, size: Buffer.byteLength(buffer), filepath})
    if (result) {
        res.status(200).json({id: result.id});
    } else {
        throw new ErrorHandler(500, "Что-то пошло не так")
    }
})
export default route