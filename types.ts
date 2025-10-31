// --- ТИПЫ ДАННЫХ ---

// Перечисления (Enums) для категорий и статусов книг
export enum BookCategory {
  READING = 'Читаю',
  READ = 'Прочитано',
  WANT_TO_READ = 'Хочу прочитать',
}

export enum PhysicalStatus {
  OWNED = 'В коллекции',
  WANT_TO_BUY = 'Хочу купить',
}

// Интерфейс для книги в библиотеке
export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  publisher: string;
  series: string;
  category: BookCategory;
  physicalStatus?: PhysicalStatus;
}

// "Сырой" тип книги, получаемый из поиска (без категорий)
export type RawBook = Omit<Book, 'category' | 'physicalStatus'>;

// Тип для рекомендованной книги от ИИ
export interface RecommendedBook {
    title: string;
    author: string;
    reason: string;
}

// Тип для рекомендованной книги с состоянием добавления
export type RecommendedBookWithStatus = RecommendedBook & { isAddedToWantToRead?: boolean };

// Перечисление для навигации по экранам
export enum View {
  LIBRARY,
  SEARCH,
  RECOMMENDATIONS,
  WISHLIST,
  COLLECTION,
}

// Тип для опции в универсальном компоненте Select
export interface SelectOption {
  value: string;
  label: string;
}
