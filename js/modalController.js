import { scrollService } from "./scrollService.js";

//функция для открытия/закрытия модальных окон
export const modalController = ({
  modal,
  btnOpen,
  time = 300,
  open,
  close,
}) => {
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
    const code = event.code;    //для закрытия окна по ESC

    if (event === "close" || target === modalElem || code === "Escape") {//для закрытия модалки после отправки event  === 'close', это значит, что event может быть строкой и принудительно его закрываем 
      modalElem.style.opacity = 0;

      setTimeout(() => { //Для плавности закрытия окна
        modalElem.style.visibility = "hidden";
        scrollService.enabledScroll();

        if (close) { //проверяем есть функция close
          close(); // есть - тогда вызываем ее
        }
      }, time);

      window.removeEventListener("keydown", closeModal); //чтобы не писало в консоли нажатые кнопки
    }
  };

  const openModal = (e) => {
    if (open) { //проверяем есть функция open
      open({ btn: e.target }); //есть - тогда вызываем ее и передаем кнопку 
    }
    modalElem.style.visibility = "visible";
    modalElem.style.opacity = 1;
    window.addEventListener("keydown", closeModal); //закрытие на кнопку ESC 
    scrollService.disabledScroll();
  };

  buttonElems.forEach((buttonElem) => { //открыть модальные окна
    buttonElem.addEventListener("click", openModal);
  });

  modalElem.addEventListener("click", closeModal);//закрыть модальное окно


  modalElem.closeModal = closeModal; //добавляем метод closeModal
  modalElem.openModal = openModal;//добавляем метод openModal

  return { openModal, closeModal };
};