import prisma from "../lib/prisma";

class ImagesService {
    async upload({filename, filepath, mimetype, size}) {
        const candidate = await prisma.image.findUnique({
            where: {
                filename
            }
        })
        if (candidate) return candidate
        return await prisma.image.create({
            data: {
                filepath,
                filename,
                mimetype,
                size
            }
        }).catch(e => {
            console.error(e)
            return null
        })
    }

    async getImage(id) {
         return await prisma.image.findUnique({
             where: {id}
         })
    }
}

export default new ImagesService()