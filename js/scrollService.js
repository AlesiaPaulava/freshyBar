
//блокировка/активация скролла при открытии/закрытии модалки
export const scrollService = {
  scrollPosition: 0,
  disabledScroll() {
    this.scrollPosition = window.scrollY; //определяет текущую позицию
    document.documentElement.style.scrollBehavior = 'auto'; //чтобы при закрытии небыло скочка страницы
    //добавляем к странице свойства для блокировки скролла
    // top: -${this.scrollPosition}px для того,что бы страница не прыгала вверх при открытии модалки
    //left height width - для того, чтобы страница не смещалась
    //padding-right: ${window.innerWidth - document.body.offsetWidth}px вычесляет размер скрола и 
    //страница не прыгает при открытии модалки
    document.body.style.cssText = `   
      overflow: hidden;
      position: fixed;
      top: -${this.scrollPosition}px;
      left: 0;
      height: 100vh;
      width: 100vw;
      padding-right: ${window.innerWidth - document.body.offsetWidth}px;
    `;
  },
  enabledScroll() {
    document.body.style.cssText = '';//удаляется всё, что было записано выше в cssText 39стр
    window.scroll({ top: this.scrollPosition }); //проскролить страницу при закрытии модалки на место с которого была открыта модалка
    document.documentElement.style.scrollBehavior = '';
  },
};