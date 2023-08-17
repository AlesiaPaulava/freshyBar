import { cartDataControl } from "./cartControl.js";
import { price } from "./config.js";
import { getFormData } from "./getFormData.js";


//для добавление в localStorage
export const formSubmit = (form, cb) => {
  form.addEventListener("submit", (e) => { //oтправка формы
    e.preventDefault(); //чтобы не перезагружалась страница

    const data = getFormData(form);//данные из getData
    cartDataControl.add(data); //добавляем данные в корзину

    if (cb) { //проверяем есть ли колбэк-функция
      cb(); //если есть, то вызываем ее
    }
  });
};

//считает конечную стоимость в модалке Собери сам
export const calculateTotalPrice = (form, startPrice) => {
  let totalPrice = startPrice;

  const data = getFormData(form); //данные чекнутые в модалке Собери сам

  if (Array.isArray(data.ingredients)) { //проверяем массив ли
    data.ingredients.forEach((item) => { //если массив, то перебираем его
      totalPrice += price[item] || 0; //найти в price например Клубника, её стоимость и добавь  в totalPrice
    });
  } else { //если не массив
    totalPrice += price[data.ingredients] || 0; //делаем тоже что и с массивом, но поиск в data.ingredients
  }

  //с чекбоксами проверка и добавление в  totalPrice
  if (Array.isArray(data.topping)) { //проверяем массив ли
    data.topping.forEach((item) => { //если массив, то перебираем его
      totalPrice += price[item] || 0; //найти в price например Клубника, её стоимость и добавь  в totalPrice
    });
  } else { //если не массив
    totalPrice += price[data.topping] || 0; //делаем тоже что и с массивом, но поиск в data.ingredients
  }

  totalPrice += price[data.cup] || 0; //поиск в радиокнопке

  return totalPrice;
};


//функция для расчета коктейля Составь сам
export const calculateMakeYourOwn = () => {
  const modalMakeOwn = document.querySelector('.modal__make-your-own');
  const formMakeOwn = modalMakeOwn.querySelector('.make__form_make-your-own');
  const makeInputTitle = modalMakeOwn.querySelector('.make__input-title');
  const makeInputPrice = modalMakeOwn.querySelector('.make__input_price');
  const makeTotalPrice = modalMakeOwn.querySelector('.make__total_price');
  const makeAddBtn = modalMakeOwn.querySelector('.make__add-btn');

  //когда меняется в окне отметки(чекбоксы), функция срабатывает
  const handlerChange = () => {
    const totalPrice = calculateTotalPrice(formMakeOwn, 150);
    //для изменения заголовка
    const data = getFormData(formMakeOwn); //получаем данные
    if (data.ingredients) { //если в данных есть ингридиенты,то 
      const ingredients = Array.isArray(data.ingredients) //получаем в виде строки ингридиенты, если там массив
        ? data.ingredients.join(", ")//то раскладываем через запятую
        : data.ingredients; //если нет, то просто вернем ингридиент

        makeInputTitle.value = `Конструктор: ${ingredients}`; //в инпут записываем
        makeAddBtn.disabled = false;//кнопка активна
    } else {
      makeAddBtn.disabled = true;//кнопка не активна
    }

    makeInputPrice.value = totalPrice;
    makeTotalPrice.textContent = `${totalPrice} ₽`;
  };

  formMakeOwn.addEventListener("change", handlerChange);
  formSubmit(formMakeOwn, () => {
    modalMakeOwn.closeModal('close'); //close добавили, так как на строке 116 event === 'close'
  }); //для добавление в localStorage + cb колбек-функция для закрытия модалки
  handlerChange();

  //очистка формы после отпраки
  const resetForm = () => {
    makeTotalPrice.textContent = '';
    makeAddBtn.disabled = true;
    formMakeOwn.reset();
  }
  return { resetForm };
};

//калькулятор формы при выборе напитка, возвращает функции
export const calculateAdd = () => {
  const modalAdd = document.querySelector('.modal_add');
  const formAdd = document.querySelector('.make__form_add');
  const makeTitle = modalAdd.querySelector('.make__title');
  const makeInputTitle = modalAdd.querySelector('.make__input-title');
  const makeTotalPrice = modalAdd.querySelector('.make__total_price');
  const makeInputStartPrice = modalAdd.querySelector('.make__input-start-price');
  const makeInputPrice = modalAdd.querySelector('.make__input_price');
  const makeTotalSize = modalAdd.querySelector('.make__total_size');
  const makeInputSize = modalAdd.querySelector('.make__input_size');

  const handlerChange = () => {
    const totalPrice = calculateTotalPrice(formAdd, +makeInputStartPrice.value);
    makeInputPrice.value = totalPrice;
    makeTotalPrice.textContent = `${totalPrice} ₽`;
  };

  formAdd.addEventListener('change', handlerChange);
  formSubmit(formAdd, () => {
    modalAdd.closeModal('close');
  });

  //заполнение формы модалки при выборе коктейля
  const fillInForm = (data) => {
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
  };
  return { fillInForm, resetForm }; //fillInForm-функция заполняет формы, resetForm-функция очищает формы
};