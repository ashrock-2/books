interface ValidationOptions {
  isbn?: string[];
  titles?: string[];
  output: string;
}

export function validateInputs(options: ValidationOptions): void {
  if (options.isbn) {
    options.isbn.forEach(validateISBN);
  }
  
  if (options.titles) {
    options.titles.forEach(validateTitle);
  }
}

export function validateISBN(isbn: string): void {
  const cleanISBN = isbn.replace(/[-\s]/g, '');
  if (!/^\d{10}(\d{3})?$/.test(cleanISBN)) {
    throw new Error(`Invalid ISBN format: ${isbn}`);
  }
}

export function validateTitle(title: string): void {
  if (!title.trim()) {
    throw new Error('Title cannot be empty');
  }
} 