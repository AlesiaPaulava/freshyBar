//достаём данные из формы(модального окна Собери сам)
export const getFormData = (form) => {
  const formData = new FormData(form);//new FormData представляет данные из HTML-формы (form)
  const data = {}; //формируем массив из чекнутых ингридиентов

  for (const [name, value] of formData.entries()) { //проходимся по всем элементам в formData. Каждый элемент это пара ключ-значение
    if (data[name]) { //проверяем существует ли name в объекте data
      if (!Array.isArray(data[name])) { //проверяет массив это 
        data[name] = [data[name]] //если не массив, то делает его массивом
      }
      data[name].push(value) //добавляет значение
    } else {
      data[name] = value;//если name не существует, то создаем свойство с именем name в объекте data
    }
  }
  return data;
}