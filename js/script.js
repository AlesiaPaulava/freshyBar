const API_URL = 'https://polyester-daffy-authorization.glitch.me/';

const getData = async () => {
  const response = await fetch(`${API_URL}api/goods`);
  const data = await response.json();
  return data;
};

const createCard = (item) => {
  const cocktail = document.createElement('article');
  cocktail.classList.add('cocktail');

  cocktail.innerHTML = `
    <img src="${API_URL}${item.image}" alt="Коктейль ${item.title}" class="cocktail__img">

    <div class="cocktail__content">
      <div class="cocktail__text">
        <h3 class="cocktail__title">${item.title}</h3>
        <p class="cocktail_price text-red">${item.price} ₽</p>
        <p class="cocktail__size">${item.size}</p>
      </div>

      <button class="btn cocktail__btn" data-id="${item.id}">Добавить</button>
    </div>
  `;
  return cocktail;
}

const scrollService = {
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
  }
}

//функция для открытия/закрытия модальных окон
const modalController = ({ modal, btnOpen, time = 300 }) => {
  const buttonElem = document.querySelector(btnOpen);
  const modalElem = document.querySelector(modal);

  modalElem.style.cssText = `
  display: flex;
  visibility: hidden;
  opacity: 0;
  transition: opacity ${time}ms ease-in-out;
  `;

  const closeModal = (event) => {
    const target = event.target; //чтобы окно не закрывалось при клике на него
    const code = event.code; //для закрытия окна по ESC

    if (target === modalElem || code === 'Escape') {
      modalElem.style.opacity = 0;
      
      setTimeout(() => { //Для плавности закрытия окна
        modalElem.style.visibility = 'hidden';
        scrollService.enabledScroll();
      }, time);

      window.removeEventListener('keydown', closeModal); //чтобы не писало в консоли нажатые кнопки
    };
  };

  const openModal = () => {
    modalElem.style.visibility = 'visible';
    modalElem.style.opacity = 1;
    window.addEventListener('keydown', closeModal); //закрытие на кнопку ESC 
    scrollService.disabledScroll();
  };

  buttonElem.addEventListener('click', openModal); //открыть модальное окно
  modalElem.addEventListener('click',closeModal);//закрыть модальное окно

  return { openModal, closeModal};
}

const init = async () => {
  modalController({
    modal: '.modal__order',
    btnOpen: '.header__btn-order'
  });

  modalController({ 
    modal: '.modal__make',
    btnOpen: '.cocktail__btn_make',
  });

  const goodsListElem = document.querySelector('.goods__list');
  const data = await getData();

  const cardsCocktail = data.map((item) => {
    const li = document.createElement('li');
    li.classList.add('goods__item');
    li.append(createCard(item));
    return li;
  });

  goodsListElem.append(...cardsCocktail);
};

init();