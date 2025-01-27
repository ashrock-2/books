#!/usr/bin/env node

import { Command } from 'commander';
import { downloadBookImages } from './bookService';
import { validateInputs } from './validator';
import * as readline from 'readline';

const program = new Command();

// stdin이 TTY인지 확인하는 함수 (파이프라인 입력 여부 확인)
const isInputFromPipe = () => !process.stdin.isTTY;

program
  .name('book-image-downloader')
  .description('CLI to download book cover images using Google Books API')
  .version('1.0.0');

program
  .option('-i, --isbn <numbers...>', 'ISBN numbers')
  .option('-t, --titles <titles...>', 'Book titles')
  .option('-o, --output <path>', 'Output directory path', './downloads')
  .action(async (options) => {
    try {
      // 파이프라인 입력 감지
      if (isInputFromPipe()) {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
          terminal: false
        });

        const inputs: string[] = [];
        
        for await (const line of rl) {
          if (line.trim()) {
            inputs.push(line.trim());
          }
        }

        if (inputs.length === 0) {
          throw new Error('입력이 없습니다');
        }

        // ISBN 형식인지 확인하여 적절한 옵션으로 설정
        const isISBN = inputs.every(input => /^\d[-\d]*$/.test(input));
        const modifiedOptions = {
          ...options,
          [isISBN ? 'isbn' : 'titles']: inputs,
        };

        validateInputs(modifiedOptions);
        await downloadBookImages(modifiedOptions);
        return;
      }

      // 커맨드라인 인자 처리
      if (!options.isbn && !options.titles) {
        throw new Error('ISBN 또는 책 제목을 입력해주세요');
      }

      validateInputs(options);
      await downloadBookImages(options);
    } catch (error) {
      console.error('오류:', error.message);
      process.exit(1);
    }
  });

program.parse(); 