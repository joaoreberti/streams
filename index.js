// import {createReadStream, createWriteStream} from 'fs';
import LineByLine from "n-readlines";
import {
  ReadableStream,
  WritableStream,
  TransformStream,
} from "node:stream/web";
import { appendFileSync } from "fs";
const readStream = new ReadableStream({
  start(controller) {
    this.lineReader = new LineByLine("./MOCK_DATA.txt");
  },
  pull(controller) {
    let chunk;
    while ((chunk = this.lineReader.next())) {
      controller.enqueue(chunk.toString());
    }
    controller.close();
  },
});

const transformStream = new TransformStream({
  async transform(chunk, controller) {
    let [id, name, lastName, email, gender] = chunk.split(",");
    gender = "trans";

    await fetch("http://google.com");

    controller.enqueue(`${id},${name},${lastName},${email}, ${gender}`);
  },
});

const JSONTransformStream = new TransformStream({
  start(controller) {
    this.isFirst = true;
    controller.enqueue("[");
  },
  transform(chunk, controller) {
    const [id, name, lastName, email, gender] = chunk.split(",");
    const record = {
      id,
      name,
      lastName,
      email,
      gender,
    };
    controller.enqueue(`${this.isFirst ? "" : ","}${JSON.stringify(record)}`);
    this.isFirst = false;
  },
  flush(controller) {
    controller.enqueue("]");
  },
});

const writeStream = new WritableStream({
  write(chunk) {
    appendFileSync("./output.json", chunk);
  },
});

readStream
  .pipeThrough(transformStream)
  .pipeThrough(JSONTransformStream)
  .pipeTo(writeStream);
