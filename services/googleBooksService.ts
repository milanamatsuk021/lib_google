
import { RawBook } from '../types';

export const searchBooks = async (query: string, searchInAuthor: boolean): Promise<RawBook[]> => {
  if (!query.trim()) return [];
  
  const q = searchInAuthor ? `inauthor:"${query}"` : query;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=10&lang=ru`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Сервис поиска временно недоступен. Попробуйте позже.');
    
    const data = await response.json();
    if (!data.items) return [];

    return data.items.map((item: any): RawBook | null => {
      if (!item.volumeInfo?.title || !item.id) return null;
      return {
        id: item.id,
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors?.join(', ') || 'Автор не указан',
        description: item.volumeInfo.description || 'Описание отсутствует.',
        publisher: item.volumeInfo.publisher || 'Издатель не указан',
        series: '', // Google Books API не предоставляет надежного поля для серии
      };
    }).filter((book): book is RawBook => book !== null);

  } catch (error) {
    console.error("Ошибка при поиске книг:", error);
    throw new Error('Не удалось выполнить поиск. Проверьте подключение к интернету.');
  }
};
