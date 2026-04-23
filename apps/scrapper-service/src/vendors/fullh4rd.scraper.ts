import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedProduct } from '../../../../libs/common/interfaces/scraped-product.interface';

export class FullH4rdScraper {
  async scrape(url: string): Promise<ScrapedProduct> {
    try {
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      const $ = cheerio.load(data);

      const name = $('h1').text().trim();
      const priceRaw = $('.price-list-container').first().text().trim();
      const price = this.parsePrice(priceRaw);
      const imageRelative = $('#mainpic').attr('src');

      return {
        name,
        price,
        currency: 'ARS',
        storeName: 'FullH4rd',
        storeUrl: url,
        image: imageRelative ? `https://fullh4rd.com.ar${imageRelative}` : undefined
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error scraping FullH4rd: ${error.message}`);
      } else {
        console.error('Error desconocido durante el scraping');
      }
      throw error;
    }
  }

  private parsePrice(priceStr: string): number {
    if (!priceStr) return 0;
    const match = priceStr.match(/[\d\.]+(,\d{2})?/);
    
    if (!match) return 0;

    let cleanPrice = match[0];
    if (cleanPrice.includes(',') && cleanPrice.includes('.')) {
      cleanPrice = cleanPrice.replace(/\./g, '').replace(',', '.');
    } 
    else if (cleanPrice.includes(',')) {
      cleanPrice = cleanPrice.replace(',', '.');
    }

    const finalPrice = parseFloat(cleanPrice);

    return isNaN(finalPrice) ? 0 : Math.floor(finalPrice);
  }
}