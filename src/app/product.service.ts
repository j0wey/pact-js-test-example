import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Product {
  idProduct: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  public baseUrl: string = 'url-to-api.tld/product';

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Expected response
   * ```
   * { "data": {
   *     "product": {
   *       "data": [
   *         {"idProduct":1,"name":"Some-Product"},
   *         {"idProduct":2,"name":"Best-Product"},
   *       ]
   *     }
   *   }
   * }
   * ```
   */
  public getProducts(): Observable<{ data: { product: { data: Product[] } } }> {
    return this.http.post<{ data: { product: { data: Product[] } } }>(
      `${ this.baseUrl }/graphql`,
      {"query":"{ product { data { idProduct name } } }", "variables": null, "operationName": "product" }
    );
  }
}
