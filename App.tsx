
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { initialBooks } from './db';
import { Book, BookCategory, PhysicalStatus, View, RawBook, RecommendedBook, RecommendedBookWithStatus } from './types';


// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

const Header: React.FC<{ title: string }> = ({ title }) => (
    <header className="sticky top-0 z-10 bg-white shadow-sm w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-16">
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            </div>
        </div>
    </header>
);

const BottomNav: React.FC<{
  activeView: View;
  setView: (view: View) => void;
}> = ({ activeView, setView }) => {
  const NavItem: React.FC<{
    emoji: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }> = ({ emoji, label, isActive, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center w-full pt-2 pb-1 text-sm transition-colors duration-200">
      <span className={`text-2xl mb-1 transition-transform duration-200 ${isActive ? 'scale-110' : 'opacity-70'}`}>{emoji}</span>
      <span className={`transition-opacity ${isActive ? 'text-blue-500 font-semibold' : 'text-gray-500'}`}>{label}</span>
    </button>
  );

  const navItems = [
    { view: View.LIBRARY, emoji: '📚', label: 'Библиотека' },
    { view: View.SEARCH, emoji: '🔍', label: 'Поиск' },
    { view: View.RECOMMENDATIONS, emoji: '✨', label: 'Для Вас' },
    { view: View.WISHLIST, emoji: '❤️', label: 'Желания' },
    { view: View.COLLECTION, emoji: '📋', label: 'Коллекция' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] flex justify-around z-20">
      {navItems.map((item) => (
        <NavItem
          key={item.view}
          emoji={item.emoji}
          label={item.label}
          isActive={activeView === item.view}
          onClick={() => setView(item.view)}
        />
      ))}
    </div>
  );
};

const BookCard: React.FC<{
  book: Book;
  onSelect: (book: Book) => void;
}> = ({ book, onSelect }) => (
  <div 
    className="bg-white rounded-lg shadow p-4 cursor-pointer transition-transform duration-200 hover:scale-105 flex flex-col justify-between"
    onClick={() => onSelect(book)}
  >
    <div>
      <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{book.title}</h3>
      <p className="text-sm text-gray-600 mt-1">{book.author}</p>
    </div>
    <div className="mt-4 flex items-center justify-between">
       <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{book.category}</span>
       {book.physicalStatus && (
         <span className={`text-xs px-2 py-1 rounded-full ${
            book.physicalStatus === PhysicalStatus.OWNED 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
         }`}>
            {book.physicalStatus}
         </span>
       )}
    </div>
  </div>
);

const RecommendationCard: React.FC<{
    book: RecommendedBookWithStatus;
    onAddToWantToRead: (book: RecommendedBook) => void;
}> = ({ book, onAddToWantToRead }) => (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col space-y-3">
        <div>
            <h3 className="font-bold text-lg text-gray-900">{book.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{book.author}</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-md flex items-start space-x-3">
            <span className="text-xl flex-shrink-0 mt-0.5">💡</span>
            <p className="text-sm text-blue-900">
                <span className="font-semibold">Почему это может вам понравиться:</span> {book.reason}
            </p>
        </div>
        <div className="pt-2">
            <button
                onClick={() => onAddToWantToRead(book)}
                disabled={book.isAddedToWantToRead}
                className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    book.isAddedToWantToRead
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
            >
                {book.isAddedToWantToRead ? 'В списке ✓' : 'Хочу прочитать'}
            </button>
        </div>
    </div>
);

const ManualAddBookModal: React.FC<{
    onClose: () => void;
    onAdd: (book: RawBook) => void;
}> = ({ onClose, onAdd }) => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [publisher, setPublisher] = useState('');
    const [series, setSeries] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!title.trim() || !author.trim()) {
            setError('Название и автор обязательны для заполнения.');
            return;
        }
        setError('');
        onAdd({
            id: `manual-${Date.now()}`,
            title: title.trim(),
            author: author.trim(),
            description: description.trim() || 'Описание отсутствует.',
            publisher: publisher.trim() || 'Издатель не указан',
            series: series.trim(),
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Добавить книгу вручную</h2>
                    <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{error}</p>}
                <div><label className="block text-sm font-medium text-gray-700">Название*</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"/></div>
                <div><label className="block text-sm font-medium text-gray-700">Автор*</label><input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"/></div>
                <div><label className="block text-sm font-medium text-gray-700">Описание</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"></textarea></div>
                <div><label className="block text-sm font-medium text-gray-700">Издатель</label><input type="text" value={publisher} onChange={(e) => setPublisher(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"/></div>
                <div><label className="block text-sm font-medium text-gray-700">Серия</label><input type="text" value={series} onChange={(e) => setSeries(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"/></div>
                <button onClick={handleSubmit} className="w-full bg-blue-500 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-600">Продолжить</button>
            </div>
        </div>
    );
};

const SearchResultCard: React.FC<{ book: RawBook, onAdd: (book: RawBook) => void }> = ({ book, onAdd }) => (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col">
        <div>
            <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{book.title}</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-1">{book.author}</p>
            <p className="text-xs text-gray-500 mt-2 line-clamp-3">{book.description}</p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
            <button onClick={() => onAdd(book)} className="w-full bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 flex items-center justify-center">
                <span className="mr-1 font-bold text-lg">+</span>Добавить
            </button>
        </div>
    </div>
);

const AddBookModal: React.FC<{ book: RawBook, onAddBook: (book: Book) => void, onClose: () => void }> = ({ book, onAddBook, onClose }) => {
    const [category, setCategory] = useState<BookCategory>(BookCategory.WANT_TO_READ);
    const [physicalStatus, setPhysicalStatus] = useState<PhysicalStatus | undefined>(undefined);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Добавить книгу</h2>
                    <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Категория</label><select value={category} onChange={(e) => setCategory(e.target.value as BookCategory)} className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900">{Object.values(BookCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">Физический статус</label><select value={physicalStatus || ''} onChange={(e) => setPhysicalStatus(e.target.value as PhysicalStatus || undefined)} className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"><option value="">Не выбрано</option>{Object.values(PhysicalStatus).map(stat => <option key={stat} value={stat}>{stat}</option>)}</select></div>
                <button onClick={() => onAddBook({ ...book, category, physicalStatus })} className="w-full bg-blue-500 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-600">Добавить в библиотеку</button>
            </div>
        </div>
    );
};

const BookDetailsModal: React.FC<{ book: Book | null, onClose: () => void, onUpdate: (updatedBook: Book) => void, onDelete: (bookId: string) => void }> = ({ book, onClose, onUpdate, onDelete }) => {
    if (!book) return null;

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => onUpdate({ ...book, category: e.target.value as BookCategory });
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => onUpdate({ ...book, physicalStatus: e.target.value as PhysicalStatus || undefined });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-end">
                        <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">{book.title}</h2>
                        <p className="text-lg text-gray-600 mt-1">{book.author}</p>
                        <p className="text-sm text-gray-500 mt-2">{book.publisher}{book.series && `, ${book.series}`}</p>
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                            <select value={book.category} onChange={handleCategoryChange} className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900">{Object.values(BookCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}</select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                            <select value={book.physicalStatus || ''} onChange={handleStatusChange} className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"><option value="">Не выбрано</option>{Object.values(PhysicalStatus).map(stat => <option key={stat} value={stat}>{stat}</option>)}</select>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-4">{book.description}</p>
                </div>
                <div className="px-6 py-4">
                    <button onClick={() => onDelete(book.id)} className="w-full bg-red-500 text-white py-2 px-4 rounded-md font-semibold hover:bg-red-600">Удалить из библиотеки</button>
                </div>
            </div>
        </div>
    );
};

// --- СЕРВИС ПОИСКА ---
const searchBooks = async (query: string, searchInAuthor: boolean): Promise<RawBook[]> => {
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


// --- ГЛАВНЫЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ ---
const App: React.FC = () => {
  // --- СОСТОЯНИЯ (STATES) ---
  const [activeView, setActiveView] = useState<View>(View.LIBRARY);
  const [activeTab, setActiveTab] = useState<BookCategory>(BookCategory.READING);
  
  // Состояние для всех книг, с логикой сохранения в localStorage
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const item = window.localStorage.getItem('books');
      if (item && item !== '[]') {
        return JSON.parse(item);
      }
      return initialBooks; // Загружаем из db.ts, если localStorage пуст
    } catch (error) {
      console.error("Ошибка чтения из localStorage, используем начальные данные:", error);
      return initialBooks;
    }
  });

  // Эффект для записи в localStorage при изменении списка книг
  useEffect(() => {
    try {
      window.localStorage.setItem('books', JSON.stringify(books));
    } catch (error) {
      console.error("Ошибка записи в localStorage:", error);
    }
  }, [books]);

  // Состояния для поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RawBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInAuthor, setSearchInAuthor] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Состояния для рекомендаций
  const [recommendations, setRecommendations] = useState<RecommendedBookWithStatus[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  
  // Состояния для модальных окон
  const [modalBook, setModalBook] = useState<RawBook | null>(null);
  const [detailsBook, setDetailsBook] = useState<Book | null>(null);
  const [isManualAddModalOpen, setIsManualAddModalOpen] = useState(false);


  // --- ФУНКЦИИ-ОБРАБОТЧИКИ ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setSearchResults([]);
    setSearchError(null);
    try {
        setSearchResults(await searchBooks(searchQuery, searchInAuthor));
    } catch (error) {
        setSearchError((error as Error).message);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleResetSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
    setSearchInAuthor(false);
  };

  const addBookToLibrary = (bookToAdd: Book) => {
    if (!books.some(b => b.id === bookToAdd.id)) {
      setBooks(prev => [...prev, bookToAdd]);
    }
    setModalBook(null);
  };

  const updateBookInLibrary = (updatedBook: Book) => {
    setBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
  };



  const deleteBookFromLibrary = (bookId: string) => {
    setBooks(prev => prev.filter(b => b.id !== bookId));
    setDetailsBook(null);
  };

  const handleManualAdd = (book: RawBook) => {
    setModalBook(book);
    setIsManualAddModalOpen(false);
  };

  const handleGetRecommendations = async () => {
    setIsLoadingRecommendations(true);
    setRecommendations([]);
    setRecommendationError(null);

    const booksForAnalysis = books.filter(
        (b) => b.category === BookCategory.READ || b.category === BookCategory.READING
    );

    if (booksForAnalysis.length < 1) {
        setRecommendationError("Добавьте хотя бы одну книгу в 'Читаю' или 'Прочитано' для получения рекомендаций.");
        setIsLoadingRecommendations(false);
        return;
    }

    const bookList = booksForAnalysis.map((b) => `${b.title} (${b.author})`).join(', ');
    const prompt = `На основе этих книг, которые я прочитал: ${bookList}. Порекомендуй 5 новых книг, которые могут мне понравиться. Для каждой книги укажи название, автора и краткое объяснение (одно предложение), почему она мне подходит. Твой ответ должен быть в формате JSON-массива объектов, где каждый объект имеет ключи "title", "author" и "reason".`;

    try {
        const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            author: { type: Type.STRING },
                            reason: { type: Type.STRING },
                        },
                        required: ["title", "author", "reason"],
                    },
                },
            },
        });
        
        const jsonText = response.text.trim();
        const recommendedBooks: RecommendedBook[] = JSON.parse(jsonText);
        setRecommendations(recommendedBooks);
    } catch (error) {
        console.error("Ошибка при получении рекомендаций:", error);
        setRecommendationError("Не удалось получить рекомендации. Попробуйте позже.");
    } finally {
        setIsLoadingRecommendations(false);
    }
  };
  
  const handleAddRecommendationToWantToRead = (rec: RecommendedBook) => {
    const bookId = `ai-${rec.title.replace(/\s/g, '')}`;
    const existingBook = books.find(b => b.id === bookId);

    if (!existingBook) {
      const newBook: Book = {
        id: bookId,
        title: rec.title,
        author: rec.author,
        description: rec.reason,
        publisher: 'Не указан',
        series: '',
        category: BookCategory.WANT_TO_READ,
      };
      addBookToLibrary(newBook);
    }
    
    setRecommendations(prev => 
        prev.map(r => r.title === rec.title ? { ...r, isAddedToWantToRead: true } : r)
    );
  };

  // --- ЛОГИКА ОТОБРАЖЕНИЯ ---
  const headerTitle = {
    [View.LIBRARY]: 'Моя библиотека',
    [View.SEARCH]: 'Поиск книг',
    [View.RECOMMENDATIONS]: 'Книги для Вас',
    [View.WISHLIST]: 'Список желаний',
    [View.COLLECTION]: 'Моя коллекция',
  }[activeView];

  const renderView = () => {
    switch (activeView) {
      case View.SEARCH:
        const showReset = searchQuery || searchResults.length > 0 || searchError;
        return (
          <div className="p-4 space-y-4">
            <form onSubmit={handleSearch}>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Название или автор..." className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900" />
              <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <input type="checkbox" id="author-search" checked={searchInAuthor} onChange={(e) => setSearchInAuthor(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <label htmlFor="author-search" className="ml-2 block text-sm text-gray-700">Искать только в авторах</label>
                  </div>
                  {showReset && <button type="button" onClick={handleResetSearch} className="text-sm text-blue-500 hover:underline">Сбросить</button>}
              </div>
            </form>
            {isLoading && <Spinner />}
            {searchError && <p className="text-center text-red-500 p-4 bg-red-50 rounded-lg">{searchError}</p>}
            <div className="space-y-4">{searchResults.map((book) => <SearchResultCard key={book.id} book={book} onAdd={setModalBook} />)}</div>
            {!isLoading && !searchError && searchResults.length === 0 && searchQuery && <p className="text-center text-gray-500">Ничего не найдено.</p>}
            <button onClick={() => setIsManualAddModalOpen(true)} className="fixed bottom-20 right-4 bg-blue-500 text-white rounded-full h-14 w-14 flex items-center justify-center shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" aria-label="Добавить книгу вручную">
              <span className="text-3xl font-light leading-none">+</span>
            </button>
          </div>
        );
      case View.RECOMMENDATIONS:
        return (
            <div className="p-4 space-y-4">
                {isLoadingRecommendations && <Spinner />}
                {recommendationError && <p className="text-center text-red-500 p-4 bg-red-50 rounded-lg">{recommendationError}</p>}

                {recommendations.length > 0 && (
                  <>
                    <div className="space-y-4">
                        {recommendations.map((rec, index) => (
                            <RecommendationCard 
                              key={`${rec.title}-${index}`} 
                              book={rec} 
                              onAddToWantToRead={handleAddRecommendationToWantToRead}
                            />
                        ))}
                    </div>
                     <div className="pt-4">
                        <button 
                            onClick={handleGetRecommendations}
                            disabled={isLoadingRecommendations}
                            className="w-full flex items-center justify-center bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                        >
                            <span className={`inline-block mr-2 ${isLoadingRecommendations ? 'animate-spin' : ''}`}>🔄</span>
                            {isLoadingRecommendations ? 'Ищем новые...' : 'Показать другие'}
                        </button>
                    </div>
                  </>
                )}
                
                {!isLoadingRecommendations && recommendations.length === 0 && !recommendationError && (
                    <div className="text-center p-8 flex flex-col items-center">
                        <span className="text-6xl mb-4">✨</span>
                        <h2 className="text-xl font-bold text-gray-800">Откройте для себя новые книги</h2>
                        <p className="text-gray-600 mt-2 max-w-sm">
                            Искусственный интеллект проанализирует вашу библиотеку и подберёт книги, которые вам точно понравятся.
                        </p>
                        <button 
                            onClick={handleGetRecommendations}
                            className="mt-6 bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-600 transition-transform transform hover:scale-105"
                        >
                            Найти книги для меня
                        </button>
                    </div>
                )}
            </div>
        );
      case View.WISHLIST:
        const wishlistBooks = books.filter(b => b.physicalStatus === PhysicalStatus.WANT_TO_BUY);
        return (
          <div className="p-4 grid grid-cols-2 gap-4">{wishlistBooks.length > 0 ? wishlistBooks.map(book => <BookCard key={book.id} book={book} onSelect={setDetailsBook}/>) : <p className="text-center text-gray-500 col-span-2">Ваш список желаний пуст.</p>}</div>
        );
      case View.COLLECTION:
        const collectionBooks = books.filter(b => b.physicalStatus === PhysicalStatus.OWNED);
        return (
          <div className="p-4 grid grid-cols-2 gap-4">{collectionBooks.length > 0 ? collectionBooks.map(book => <BookCard key={book.id} book={book} onSelect={setDetailsBook}/>) : <p className="text-center text-gray-500 col-span-2">Ваша коллекция пуста.</p>}</div>
        );
      default:
        const filteredBooks = books.filter(b => b.category === activeTab);
        return (
          <div>
            <div className="flex border-b border-gray-200">{Object.values(BookCategory).map(cat => <button key={cat} onClick={() => setActiveTab(cat)} className={`flex-1 py-3 text-sm font-medium ${activeTab === cat ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}>{cat}</button>)}</div>
            <div className="p-4 grid grid-cols-2 gap-4">{filteredBooks.length > 0 ? filteredBooks.map(book => <BookCard key={book.id} book={book} onSelect={setDetailsBook}/>) : <p className="text-center text-gray-500 pt-8 col-span-2">В этой категории пока нет книг.</p>}</div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-16">
      <Header title={headerTitle} />
      <main className="max-w-4xl mx-auto">{renderView()}</main>
      <BottomNav activeView={activeView} setView={setActiveView} />
      {isManualAddModalOpen && <ManualAddBookModal onClose={() => setIsManualAddModalOpen(false)} onAdd={handleManualAdd} />}
      {modalBook && <AddBookModal book={modalBook} onAddBook={addBookToLibrary} onClose={() => setModalBook(null)} />}
      {detailsBook && <BookDetailsModal book={detailsBook} onClose={() => setDetailsBook(null)} onUpdate={updateBookInLibrary} onDelete={deleteBookFromLibrary} />}
    </div>
  );
};

export default App;