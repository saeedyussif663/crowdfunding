// @ts-nocheck
import { Request, Response } from "express";
import sdk, { ID, Client, Storage } from "node-appwrite";
import { UploadedFile } from "express-fileupload";
import { InputFile } from "node-appwrite/file";

const BUCKET_ID = process.env.BUCKET_ID;
const PROJECT_ID = process.env.PROJECT_ID;

export default async function uploadImage(req: Request, res: Response) {
  if (req.files && "img" in req.files) {
    const imageFile = req.files["img"] as UploadedFile;

    const client = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1")
      .setProject(PROJECT_ID);

    const storage = new Storage(client);

    const result = await storage.createFile(
      BUCKET_ID,
      ID.unique(),
      InputFile.fromBuffer(imageFile.data, imageFile.name)
    );

    res.status(200).json({
      url: `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${result.$id}/preview?project=${PROJECT_ID}`,
    });
    return;
  }

  res.status(422).json({ message: "img is required" });
  return;
}
