const iconMenu = document.querySelector('.top-bar-icon');

if (iconMenu) {
  const menuBody = document.querySelector('.sections');
  iconMenu.addEventListener("click", function(e) {
    document.body.classList.toggle('_lock');
    iconMenu.classList.toggle('_active');
    menuBody.classList.toggle('_active');
  });
}