const API_URL = 'https://polyester-daffy-authorization.glitch.me/';

const price = {
  Клубника: 60,
  Банан: 50,
  Манго: 70,
  Киви: 55,
  Маракуйя: 90,
  Яблоко: 45,
  Мята: 50,
  Лед: 10,
  Биоразлагаемый: 20,
  Пластиковый: 0,
};

//объект с методами
const cardDataControl = {
  //получить данные из корзины
  get() {
    return JSON.parse(localStorage.getItem('freshyBarCard') || '[]');// если в localStorage пусто, то возвращаем '[]' чтобы JSON.parse распарсил массив (обязательно в ковычках)
  },
  //добавить в корзину
  add(item) {
    const cardData = this.get();
    item.idls = Math.random().toString(36).substring(2, 8); //айдишник придумываем сами
    cardData.push(item);
    localStorage.setItem('freshyBarCard', JSON.stringify(cardData)); //отправляем в localStorage данные, приведенные в формат JSON
  },
  //удалить из корзины 
  remove(idls) {
    const cardData = this.get(); //получаем данные
    const index = card.findIndex((item) => item.idls === idls); //findIndex находит элемент с id и возвращает
    if (index !== -1) { //если не находит index, то возвращает -1
      cardData.splice(index, 1)
    }
    localStorage.setItem('freshyBarCard', JSON.stringify(cardData));
  },
  //очистить
  clear() {
    localStorage.removeItem('freshyBarCard'); //очистка при отправке
  },
};

//получаем данные с сервера
const getData = async () => {
  const response = await fetch(`${API_URL}api/goods`);
  const data = await response.json();
  return data;
};

//создаем карточку товара
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

      <button class="btn cocktail__btn cocktail__btn_add" data-id="${item.id}">Добавить</button>
    </div>
  `;
  return cocktail;
}

//блокировка/активация скролла при открытии/закрытии модалки
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
const modalController = ({ modal, btnOpen, time = 300, open, close }) => {
  const buttonElems = document.querySelectorAll(btnOpen);
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

    if (event === 'close' || target === modalElem || code === 'Escape') { //для закрытия модалки после отправки event  === 'close', это значит, что event может быть строкой и принудительно его закрываем 
      modalElem.style.opacity = 0;

      setTimeout(() => { //Для плавности закрытия окна
        modalElem.style.visibility = 'hidden';
        scrollService.enabledScroll();

        if (close) { //проверяем есть функция close
          close(); // есть - тогда вызываем ее
        }
      }, time);

      window.removeEventListener('keydown', closeModal); //чтобы не писало в консоли нажатые кнопки
    };
  };

  const openModal = (e) => {
    if (open) { //проверяем есть функция open
      open({ btn: e.target }); //есть - тогда вызываем ее и передаем кнопку 
    }
    modalElem.style.visibility = 'visible';
    modalElem.style.opacity = 1;
    window.addEventListener('keydown', closeModal); //закрытие на кнопку ESC 
    scrollService.disabledScroll();
  };

  buttonElems.forEach((buttonElem) => { //открыть модальные окна
    buttonElem.addEventListener('click', openModal);
  });

  modalElem.addEventListener('click', closeModal);//закрыть модальное окно


  modalElem.closeModal = closeModal; //добавляем метод closeModal
  modalElem.openModal = openModal;//добавляем метод openModal

  return { openModal, closeModal };
};

//достаём данные из формы(модального окна Собери сам)
const getFormData = (form) => {
  const formData = new FormData(form);
  const data = {}; //формируем массив из чекнутых ингридиентов

  for (const [name, value] of formData.entries()) {
    if (data[name]) {
      if (!Array.isArray(data[name])) { //проверяет массив это 
        data[name] = [data[name]] //если не массив, то делает его массивом
      }
      data[name].push(value) //добавляет значение
    } else {
      data[name] = value;
    }
  }
  return data;
}

//считает конечную стоимость в модалке Собери сам
const calculateTotalPrice = (form, startPrice) => {
  let totalPrice = startPrice;

  const data = getFormData(form); //данные чекнутые в модалке Собери сам

  if (Array.isArray(data.ingredients)) { //проверяем массив ли
    data.ingredients.forEach(item => { //если массив, то перебираем его
      totalPrice += price[item] || 0; //найти в price например Клубника, её стоимость и добавь  в totalPrice
    })
  } else { //если не массив
    totalPrice += price[data.ingredients] || 0; //делаем тоже что и с массивом, но поиск в data.ingredients
  };

  //с чекбоксами проверка и добавление в  totalPrice
  if (Array.isArray(data.topping)) { //проверяем массив ли
    data.topping.forEach(item => { //если массив, то перебираем его
      totalPrice += price[item] || 0; //найти в price например Клубника, её стоимость и добавь  в totalPrice
    })
  } else { //если не массив
    totalPrice += price[data.topping] || 0; //делаем тоже что и с массивом, но поиск в data.ingredients
  };

  totalPrice += price[data.cup] || 0; //поиск в радиокнопке

  return totalPrice;
};

//для добавление в localStorage
const formControl = (form, cb) => {
  form.addEventListener('submit', (e) => { //oтправка формы
    e.preventDefault(); //чтобы не перезагружалась страница

    const data = getFormData(form);//данные из getData
    cardDataControl.add(data); //добавляем данные в корзину

    if (cb) { //проверяем есть ли колбэк-функция
      cb(); //если есть, то вызываем ее
    }
  })
}

//функция для расчета коктейля Составь сам
const calculatMakeYourOwn = () => {
  const modalMakeOwn = document.querySelector('.modal__make-your-own');
  const formMakeOwn = modalMakeOwn.querySelector('.make__form_make-your-own');
  const makeInputTitle = modalMakeOwn.querySelector('.make__input-title');
  const makeInputPrice = modalMakeOwn.querySelector('.make__input_price');
  const makeTotalPrice = modalMakeOwn.querySelector('.make__total_price');
  const makeAddBtn = modalMakeOwn.querySelector('.make__add-btn');

  //когда меняется в окне отметки(чекбоксы), функция срабатывает
  const hendlerChange = () => {
    const totalPrice = calculateTotalPrice(formMakeOwn, 150);
    //для изменения заголовка
    const data = getFormData(formMakeOwn); //получаем данные
    if (data.ingredients) { //если в данных есть ингридиенты,то 
      const ingredients = Array.isArray(data.ingredients) //получаем в виде строки ингридиенты, если там массив
        ? data.ingredients.join(', ')//то раскладываем через запятую
        : data.ingredients; //если нет, то просто вернем ингридиент

      makeInputTitle.value = `Конструктор: ${ingredients}`; //в инпут записываем
      makeAddBtn.disabled = false;//кнопка активна
    } else {
      makeAddBtn.disabled = true;//кнопка не активна
    }

    makeInputPrice.value = totalPrice;
    makeTotalPrice.textContent = `${totalPrice} ₽`;
  };

  formMakeOwn.addEventListener('change', hendlerChange);
  formControl(formMakeOwn, () => {
    modalMakeOwn.closeModal('close'); //close добавили, так как на строке 116 event === 'close'
  }); //для добавление в localStorage + cb колбек-функция для закрытия модалки
  hendlerChange();

  //очистка формы после отпраки
  const resetForm = () => {
    makeTotalPrice.textContent = '';
    makeAddBtn.disabled = true;
    formMakeOwn.reset();
  }
  return { resetForm };
};

//калькулятор формы при выборе напитка, возвращает функции
const calculateAdd = () => {
  const modalAdd = document.querySelector('.modal_add');
  const formAdd = document.querySelector('.make__form_add');
  const makeTitle = modalAdd.querySelector('.make__title');
  const makeInputTitle = modalAdd.querySelector('.make__input-title');
  const makeTotalPrice = modalAdd.querySelector('.make__total-price');
  const makeInputStartPrice = modalAdd.querySelector('.make__input-start-price');
  const makeInputPrice = modalAdd.querySelector('.make__input-price');
  const makeTotalSize = modalAdd.querySelector('.make__total-size');
  const makeInputSize = modalAdd.querySelector('.make__input-size');

  const handlerChange = () => {
    const totalPrice = calculateTotalPrice(formAdd, +makeInputStartPrice.value);
    makeInputPrice.value = totalPrice;
    makeTotalPrice.textContent = `${totalPrice} ₽`;
  }

  formAdd.addEventListener('change', handlerChange);
  formControl(formAdd, () => {
    modalAdd.closeModal('close');
  })

  //заполнение формы модалки при выборе коктейля
  const fillInForm = data => {
    makeTitle.textContent = data.title;
    makeInputTitle.value = data.title;
    makeTotalPrice.textContent = `${data.price} ₽`;
    makeInputStartPrice.value = data.price;
    makeInputPrice.value = data.price;
    makeTotalSize.textContent = data.size;
    makeInputSize.value = data.size;
    handlerChange();
  };

  //сброс формы
  const resetForm = () => {
    makeTitle.textContent = '';
    makeTotalPrice.textContent = '';
    makeTotalSize.textContent = '';

    formAdd.reset();
  }
  return { fillInForm, resetForm } //fillInForm-функция заполняет формы, resetForm-функция очищает формы
}

//создаем элементы списка в корзине в который будут помещаться карточки c заказом
const createCartItem = (item) => {
  const li = document.createElement('li');
  li.classList.add('order__item');
  li.innerHTML = `
    <img class="order__img" src="img/make_your_own.jpg" alt="${item.title}">
    <div class="order__info">
      <h3 class="order__name">${item.title}</h3>

      <ul class="order__topping-list">
        <li class="order__topping-item">${item.size}</li>
        <li class="order__topping-item">${item.cup}</li>
        ${item.topping
      ? Array.isArray(item.topping) //если item.topping есть проверяем массив ли он
        ? item.topping.map(
          (topping) =>
            `<li class="order__topping-item">${topping}</li>`)//если массив, то получаем каждый item
        : `<li class="order__topping-item">${item.topping}</li>`
      : ''
        }
      </ul>
    </div>

    <button class="order__item-delet" data-idls="${item.idls}"
      aria-label="Удалить коктейль из корзины"></button>

    <p class="order__item-price">${item.price}&nbsp;₽</p>
  `;
  return li;
}

//отрисовка карточек в корзине
const renderCart = () => {
  const modalOrder = document.querySelector('.modal__order');

  const orderCount = modalOrder.querySelector('.order__count');
  const orderList = modalOrder.querySelector('.order__list');
  const orderTotalPrice = modalOrder.querySelector('.order__total-price');
  const orderForm = modalOrder.querySelector('.order__form');

  const orderListData = cardDataControl.get(); //получаем данные из localStorage

  orderList.textContent = ''; //очищаем список
  orderCount.textContent = `(${orderListData.length})`; //будет указана длинна списка

  //определяем каждую карточку из localStorage и вставляем их в список 
  orderListData.forEach(item => {
    orderList.append(createCartItem(item));
  });

  orderTotalPrice.textContent =
    `${orderListData.reduce((acc, item) => acc + +item.price, 0,)} ₽`;

  //событие отправки на сервер корзины
  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault(); //чтобы не перезагружалась страница при отправке
    if (!orderListData.length) { //если корзина пустая
      return alert ('Корзина пустая!');
    }

    const data = getFormData(orderForm); //
    //отправняем на сервер
    const response = await fetch (`${API_URL}api/order`, {
      method: 'POST',
      body: JSON.stringify({ //отправка в формате JSON
        ...data, //отправляем всё, что является data - это name phone
        products: orderListData,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const {message} = await response.json();// получаем с сервера и вытаскиваем из json
    alert(message);
    cardDataControl.clear();//очищаем localStorage
    orderForm.reset();//очищаем корзину
    modalOrder.closeModal('close');//закрываем модалку с корзиной
    
  });

};

const init = async () => {
  //определяем кнопку и модальное окно для его отрытия закрытия
  modalController({
    modal: '.modal__order',
    btnOpen: '.header__btn-order',
    open: renderCart, //функция срабатывает перед открытием корзины
  });

  const { resetForm: resetFormMakeYourOwn } = calculatMakeYourOwn(); //функция для расчета коктейля Составь сам, resetFormMakeYourOwn добавлено,т.к. название resetForm уже существует

  //определяем кнопку и модальное окно для его отрытия закрытия
  modalController({
    modal: '.modal__make-your-own',
    btnOpen: '.cocktail__btn_make',
    close: resetFormMakeYourOwn,//закрытие после отправки формы в корзину
  });

  //находим спиисок для размещения в нем карточек
  const goodsListElem = document.querySelector('.goods__list');
  const data = await getData(); //получаем данные с сервера

  //создание элемента списка для карточки
  const cardsCocktail = data.map((item) => {
    const li = document.createElement('li');
    li.classList.add('goods__item');
    li.append(createCard(item));
    return li;
  });

  goodsListElem.append(...cardsCocktail); //помецаем карточки в список
  const { fillInForm: fillInFormAdd, resetForm: resetFormAdd } = calculateAdd(); //вызываем функцию, fillInForm: fillInFormAdd - это переименование функции

  modalController({
    modal: '.modal_add',
    btnOpen: '.cocktail__btn_add',
    open({ btn }) { //перед открытием модалки 
      const id = btn.dataset.id; //dataset.id хранится карточке товара как data-id="${item.id}"
      const item = data.find((item) => item.id.toString() === id); //ищем товар item в объекте data- это данные из сервера
      fillInFormAdd(item); //товар item передаем в форму
    },
    close: resetFormAdd, //после закрытия модалки
  });
};

init();