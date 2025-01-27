import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';

interface BookSearchOptions {
  isbn?: string[];
  titles?: string[];
  output: string;
}

export async function downloadBookImages(options: BookSearchOptions): Promise<void> {
  const { isbn, titles, output } = options;
  
  // 출력 디렉토리 생성
  await fs.mkdir(output, { recursive: true });

  if (isbn) {
    for (const isbnNumber of isbn) {
      await downloadBookByISBN(isbnNumber, output);
    }
  }

  if (titles) {
    for (const title of titles) {
      await downloadBookByTitle(title, output);
    }
  }
}

async function downloadBookByISBN(isbn: string, outputDir: string): Promise<void> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
  await downloadBookImage(url, isbn, outputDir);
}

async function downloadBookByTitle(title: string, outputDir: string): Promise<void> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}`;
  await downloadBookImage(url, title, outputDir);
}

async function downloadBookImage(url: string, identifier: string, outputDir: string): Promise<void> {
  try {
    const response = await axios.get(url);
    if (!response.data.items || response.data.items.length === 0) {
      console.warn(`검색 결과를 찾을 수 없습니다: ${identifier}`);
      return;
    }

    const imageLinks = response.data.items[0].volumeInfo.imageLinks;
    // large(700-800px)를 우선 선택하고, 없으면 차례로 작은 크기 선택
    const imageLink = imageLinks?.large || 
                     imageLinks?.medium || 
                     imageLinks?.small || 
                     imageLinks?.thumbnail;

    if (!imageLink) {
      console.warn(`이미지를 찾을 수 없습니다: ${identifier}`);
      return;
    }

    // HTTP URL을 HTTPS로 변환하고 이미지 품질 파라미터 추가
    const secureImageUrl = imageLink
      .replace('http://', 'https://')
      .replace('zoom=1', 'zoom=2')
      .replace('edge=curl', 'edge=flat');

    const imageResponse = await axios.get(secureImageUrl, { responseType: 'arraybuffer' });
    
    // 파일명 처리 로직 수정
    const fileName = `${identifier.replace(/\s+/g, '_')}.jpg`;
    const filePath = path.join(outputDir, fileName);
    
    await fs.writeFile(filePath, imageResponse.data);
    console.log(`성공적으로 이미지를 다운로드했습니다: ${identifier}`);
  } catch (error) {
    console.error(`이미지 다운로드 실패: ${identifier}`, error.message);
  }
} 