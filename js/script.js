import { getData } from "./apiService.js";
import { renderCart } from "./cartControl.js";
import { calculateAdd, calculatMakeYourOwn } from "./formControl.js";
import { renderCardList } from "./goodsService.js";
import { modalController } from "./modalController.js";


const init = async () => {

  const data = await getData(); //получаем данные с сервера
  renderCardList(document.querySelector('.goods__list'), data);

  //определяем кнопку и модальное окно для его отрытия закрытия
  modalController({
    modal: '.modal__order',
    btnOpen: '.header__btn-order',
    open() {
      renderCart(data); //функция срабатывает перед открытием корзины
    },
  });

  const { resetForm: resetFormMakeYourOwn } = calculatMakeYourOwn(); //функция для расчета коктейля Составь сам, resetFormMakeYourOwn добавлено,т.к. название resetForm уже существует

  //определяем кнопку и модальное окно для его отрытия закрытия
  modalController({
    modal: '.modal__make-your-own',
    btnOpen: '.cocktail__btn_make',
    close: resetFormMakeYourOwn,//закрытие после отправки формы в корзину
  });

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