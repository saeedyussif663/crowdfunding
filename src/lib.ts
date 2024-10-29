import mongoose from "mongoose";

export function DBconnect() {
  mongoose
    .connect(process.env.CONNECTION_STRING as string)
    .then((res) => console.log("connected to database successfully"))
    .catch((err) => console.log({ err }));
}
