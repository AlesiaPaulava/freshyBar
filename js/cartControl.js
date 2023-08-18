import { sentData } from "./apiService.js";
import { API_URL } from "./config.js";
import { getFormData } from "./getFormData.js";

const modalOrder = document.querySelector('.modal__order');
const orderCount = modalOrder.querySelector('.order__count');
const orderList = modalOrder.querySelector('.order__list');
const orderTotalPrice = modalOrder.querySelector('.order__total-price');
const orderForm = modalOrder.querySelector('.order__form');

//объект с методами
export const cartDataControl = {
  //получить данные из корзины
  get() {
    return JSON.parse(localStorage.getItem('freshyBarCart') || '[]');// если в localStorage пусто, то возвращаем '[]' чтобы JSON.parse распарсил массив (обязательно в ковычках)
  },
  //добавить в корзину
  add(item) {
    const cartData = this.get();
    item.idls = Math.random().toString(36).substring(2, 8); //айдишник придумываем сами
    cartData.push(item);
    localStorage.setItem("freshyBarCart", JSON.stringify(cartData)); //отправляем в localStorage данные, приведенные в формат JSON
    renderCountCart(cartData.length);
  },
  //удалить из корзины 
  remove(idls) {
    const cartData = this.get(); //получаем данные
    const index = cartData.findIndex((item) => item.idls === idls); //findIndex находит элемент с id и возвращает
    if (index !== -1) { //если не находит index, то возвращает -1
      cartData.splice(index, 1);
    }
    localStorage.setItem("freshyBarCart", JSON.stringify(cartData));
    renderCountCart(cartData.length);
  },
  //очистить
  clear() {
    localStorage.removeItem("freshyBarCart"); //очистка при отправке
    renderCountCart(0);
  },
};

//отображения количества товаров в корзине 
const renderCountCart = (count) => {
  const headerBtnOrder = document.querySelector(".header__btn-order");
  // Если count не передан (или равен null, undefined, 0 или false), то значение атрибута data-count будет установлено равным количеству товаров в корзине
  headerBtnOrder.dataset.count = count || cartDataControl.get().length;
};
renderCountCart();

//создаем элементы списка в корзине в который будут помещаться карточки c заказом
const createCartItem = (item, data) => {
  const img = data.find((cocktail) => cocktail.title === item.title)?.image;
  const li = document.createElement('li');
  li.classList.add('order__item');
  li.innerHTML = `
    <img class="order__img" src="${img ? `${API_URL}${img}` : "img/make-your-own.jpg"
    }"
    alt="${item.title}">

  <div class="order__info">
    <h3 class="order__name">${item.title}</h3>

    <ul class="order__topping-list">
      <li class="order__topping-item">${item.size}</li>
      <li class="order__topping-item">${item.cup}</li>
      ${item.topping
      ? Array.isArray(item.topping) //если item.topping есть проверяем массив ли он
        ? item.topping
          .map(
            (topping) =>
              `<li class="order__topping-item">${topping}</li>`, //если массив, то получаем каждый item
          )
          .toString()
          .replace(",", "")
        : `<li class="order__topping-item">${item.topping}</li>`
      : ""
    }
      </ul>
    </div>

    <button class="order__item-delete" data-idls="${item.idls}"
    aria-label="Удалить коктейл из корзины"></button>

  <p class="order__item-price">${item.price}&nbsp;₽</p>
 `;

  return li;
};

//отрисовка карточек в корзине
const renderCartList = (data) => {
  const orderListData = cartDataControl.get(); //получаем данные из localStorage

  orderList.textContent = ''; //очищаем список
  orderCount.textContent = `(${orderListData.length})`; //будет указана длинна списка

  //определяем каждую карточку из localStorage и вставляем их в список 
  orderListData.forEach((item) => {
    orderList.append(createCartItem(item, data));
  });

  orderTotalPrice.textContent = `${orderListData.reduce(
    (acc, item) => acc + +item.price,
    0,
  )} ₽`;
};

//функция обрабатывает событие отправки формы
const handlerSubmit = async (e) => {
  const orderListData = cartDataControl.get(); //получаем данные из localStorage

  e.preventDefault();
  if (!orderListData.length) { //если корзина пустая
    console.log("Корзина пустая");
    orderForm.reset(); //очищаем корзину
    modalOrder.closeModal("close"); //закрываем модалку с корзиной
    return;
  }

  const data = getFormData(orderForm); //получаем данные из формы
  const response = await sentData({ //отправляем данные на сервер
    ...data, // Отправляемые данные включают данные из формы phone name
    products: orderListData, //и данные о товарах в корзине 
  });

  const { message } = await response.json(); // получаем с сервера и вытаскиваем из json
  alert(message);
  cartDataControl.clear();//очищаем localStorage
  orderForm.reset(); //очищаем корзину
  modalOrder.closeModal('close'); //закрываем модалку с корзиной
};

// установить обработчики событий отправка формы и удаление из корзины коктейля
export const renderCart = (data) => {
  renderCartList(data); // Вызывает функцию renderCartList(data) для отображения списка товаров в корзине.
  orderForm.addEventListener("submit", handlerSubmit); // Добавляет обработчик события "submit" для формы orderForm, который вызывает функцию handlerSubmit при отправке формы.
  orderList.addEventListener("click", (e) => { // Добавляет обработчик события "click" для элемента orderList.
    if (e.target.classList.contains("order__item-delete")) { // Проверяет, если кликнутый элемент содержит класс "order__item-delete".
      cartDataControl.remove(e.target.dataset.idls); // Удаляет товар из корзины по его ID, полученного из атрибута data-idls кликнутого элемента.
      renderCartList(data); // Перерисовывает список товаров в корзине после удаления товара.
    }
  });
};
