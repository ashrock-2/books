import * as fs from 'fs';

interface Book {
  title: string;
  date: Date;
  hasImage(): boolean;
  getImagePath(): string;
}

interface BooksByDate {
  [key: string]: Book[];
}

const BOOK_ENTRY_LINE_COUNT = 2; // 책 한 권당 필요한 줄 수 (제목 + 날짜)

class BookImpl implements Book {
  constructor(
    public title: string,
    public date: Date
  ) {}

  hasImage(): boolean {
    return fs.existsSync(this.getImagePath());
  }

  getImagePath(): string {
    const fileName = `${this.title.replace(/\s+/g, '_')}.jpg`;
    return `images/${fileName}`;
  }
}

function parseBookList(input: string): Book[] {
  const lines = input.trim().split('\n');
  const books: Book[] = [];
  
  for (let i = 0; i < lines.length; i += BOOK_ENTRY_LINE_COUNT) {
    if (lines[i] && lines[i + 1]) {
      const title = lines[i];
      const date = lines[i + 1];
      books.push(new BookImpl(title, new Date(date)));
    }
  }
  
  return books;
}

function generateBookList(books: Book[]): string {
  const booksByDate: BooksByDate = {};
  books.forEach(book => {
    const year = book.date.getFullYear();
    const month = book.date.getMonth() + 1;
    const day = book.date.getDate();
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    if (!booksByDate[dateKey]) {
      booksByDate[dateKey] = [];
    }
    booksByDate[dateKey].push(book);
  });

  let bookList = '';
  Object.keys(booksByDate)
    .sort((a, b) => b.localeCompare(a))
    .forEach(date => {
      bookList += `\n        <h3>${date}</h3>\n        <ul>`;
      booksByDate[date].forEach(book => {
        bookList += '\n          <li>';
        if (book.hasImage()) {
          bookList += `<img src="${book.getImagePath()}" alt="${book.title}" /><br/>`;
        }
        bookList += `${book.title}</li>`;
      });
      bookList += '\n        </ul>';
    });

  return bookList;
}

function generateHTML(books: Book[]): string {
  const template = fs.readFileSync('templates/index.html', 'utf8');
  const bookList = generateBookList(books);
  return template.replace('<!-- BOOK_LIST -->', bookList);
}

// 메인 실행 부분
let input = '';

process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk: string) => {
  input += chunk;
});

process.stdin.on('end', () => {
  const books = parseBookList(input);
  const html = generateHTML(books);

  fs.writeFile('index.html', html, (err) => {
    if (err) {
      console.error('파일을 쓰는 중 오류가 발생했습니다:', err);
      return;
    }
    console.log('index.html이 성공적으로 생성되었습니다.');
  });
}); 