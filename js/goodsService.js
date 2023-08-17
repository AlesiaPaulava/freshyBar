import { API_URL } from "./config.js";

//создаем карточку товара
const createCard = (item) => {
  const cocktail = document.createElement("article");
  cocktail.classList.add("cocktail");

  cocktail.innerHTML = `
    <img 
      class="cocktail__img" 
      src="${API_URL}${item.image}"
      alt="Коктейл ${item.title}"
    >

    <div class="cocktail__content">
      <div class="cocktail__text">
        <h3 class="cocktail__title">${item.title}</h3>
        <p class="cocktail__price text-red">${item.price} ₽</p>
        <p class="cocktail__size">${item.size}</p>
      </div>

      <button class="btn cocktail__btn cocktail__btn_add" data-id="${item.id}">Добавить</button>
    </div>

  `;

  return cocktail;
};

//создание элемента списка для карточки
export const renderCardList = (goodsListElem, data) => { // Создаем массив карточек товаров из данных
  const cartsCocktail = data.map((item) => { //map преобразует каждый элемент массива data в список элементов (карточку товара)
    const li = document.createElement('li');// Создаем элемент списка для каждого товара
    li.classList.add('goods__item');
    li.append(createCard(item));//Создаем карточку товара с помощью функции createCard(item), где item используется элемент массива data, представляющий один товар
    return li;
  });

  goodsListElem.append(...cartsCocktail); //помецаем карточки в список
};
