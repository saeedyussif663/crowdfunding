"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = uploadImage;
const node_appwrite_1 = require("node-appwrite");
const file_1 = require("node-appwrite/file");
const BUCKET_ID = process.env.BUCKET_ID;
const PROJECT_ID = process.env.PROJECT_ID;
function uploadImage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.files && "img" in req.files) {
            const imageFile = req.files["img"];
            const client = new node_appwrite_1.Client()
                .setEndpoint("https://cloud.appwrite.io/v1")
                .setProject(PROJECT_ID);
            const storage = new node_appwrite_1.Storage(client);
            const result = yield storage.createFile(BUCKET_ID, node_appwrite_1.ID.unique(), file_1.InputFile.fromBuffer(imageFile.data, imageFile.name));
            res.status(200).json({
                url: `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${result.$id}/preview?project=${PROJECT_ID}`,
            });
            return;
        }
        res.status(422).json({ message: "img is required" });
        return;
    });
}
