import fs from "fs"

import { createGradesArt } from "./WABot/features/meme/grades"
import { config } from "dotenv"
import { getImageEditingServiceClient } from "grpc"
import { ImageEditorClient } from "ImageEditorService/protos/image_editor"
import { credentials } from "@grpc/grpc-js"

config()

async function main() {
  // const image = await createGradesArt("test", "test")

  // image.pipe(fs.createWriteStream("test.jpg"))
  const client = new ImageEditorClient("localhost:50051", credentials.createInsecure(),)

  client.grades({ text1: 'test', text2: '2' }, (err, res) => {
    console.log(err.message, res);
  })
}

main()