import { getImageEditingServiceClient } from "grpc";
import { GradesResponse } from "ImageEditorService/protos/image_editor";
import { Readable } from "stream"

export async function createGradesArt(text1: string, text2: string) {
  const response = await new Promise<GradesResponse>((res, rej) => getImageEditingServiceClient().grades({ text1, text2 }, (err, response) => {
    if (err) rej(err);
    res(response)
  }))

  return Readable.from(response.image)
}
