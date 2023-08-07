import { API_URL } from "./config.js";

//получаем данные с сервера
export const getData = async () => {
  const response = await fetch(`${API_URL}api/goods`);
  const data = await response.json();
  return data;
};

//отправка данных на сервер
export const sentData = async (data) => {
  return await fetch(`${API_URL}api/order`, {
    method: "POST",
    body: JSON.stringify(data), //преобразуем данные в JSON
    headers: {
      "Content-Type": "application/json",
    },
  });
}; 