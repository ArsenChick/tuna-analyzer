const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    resolve(reader.result
      .replace('data:', '')
      .replace(/^.+,/, ''));
  }
  reader.onerror = error => reject(error);
});

export { toBase64 };