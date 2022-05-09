const isMobile = {
  Android: function () {
    return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function () {
    return navigator.userAgent.match(/BlackBerry/i);
  },
  IOS: function () {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function () {
    return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function () {
    return navigator.userAgent.match(/IEMobile/i);
  },
  WebOS: function () {
    return navigator.userAgent.match(/webOS/i);
  },
  BB: function () {
    return navigator.userAgent.match(/BB/i);
  },
  PlayBook: function () {
    return navigator.userAgent.match(/PlayBook/i);
  },
  Kindle: function () {
    return navigator.userAgent.match(/Kindle/i);
  },
  Silk: function () {
    return navigator.userAgent.match(/Silke/i);
  },
  any: function () {
    return (
      isMobile.Android() ||
      isMobile.BlackBerry() ||
      isMobile.IOS() ||
      isMobile.Opera() ||
      isMobile.Windows() ||
      isMobile.WebOS() ||
      isMobile.BB() ||
      isMobile.PlayBook() ||
      isMobile.Kindle() ||
      isMobile.Silk());
  }
};

if (isMobile.any()) {
  document.body.classList.add('_touch');
} else {
  document.body.classList.add('_pc');

  let elements = document.querySelectorAll('.mobile');

  if (elements.length > 0) {
    for (let i = 0; i < elements.length; i++) {

    }
  }
}

