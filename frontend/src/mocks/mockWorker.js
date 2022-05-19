import vars from "../variables";

class Worker {
  constructor(url, options) {
    this.url = url;
    this.onmessage = () => {};
    this.terminate = () => {};
  }

  postMessage(data) {
    setTimeout(() => {
      switch (this.url) {
        case (vars.keyBPMWorkerPath):
          this.onmessage({
            data: {
              keyData: { key: "C#", scale: "minor" },
              bpm: 120
            }
          });
          break;
        case (vars.extractorWorkerPath):
          this.onmessage({
            data: { features: "fake features" }
          });
          break;
        case (vars.moodWorkerPath):
          this.onmessage({
            data: { predictions: 0.5 }
          });
          break;
        default:
          this.onmessage({ data: "hello" });
      }
    }, 2000);
  }
}

export default Worker;