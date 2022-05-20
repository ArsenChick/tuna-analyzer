const toBase64 = file => new Promise((resolve) => {
  setTimeout(() => {
    resolve("haha base64");
  }, 100);
});

export { toBase64 };