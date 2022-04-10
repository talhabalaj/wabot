import { ImageEditorClient } from "ImageEditorService/protos/image_editor";
import { credentials } from "@grpc/grpc-js"

let client: ImageEditorClient

export const getImageEditingServiceClient = () => client || (client = new ImageEditorClient(process.env.IMAGE_EDIT_SERVER_ADDRESS, credentials.createInsecure(),))