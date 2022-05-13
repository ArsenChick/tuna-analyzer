export default class Worker {
  constructor(url, options) {
    this.url = url;
    this.onmessage = () => {};
  }

  postMessage(data) {
    this.onmessage({ data: "hello" });
  }
}