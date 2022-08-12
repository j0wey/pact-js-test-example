import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatchersV3, PactV3 } from '@pact-foundation/pact';
import { firstValueFrom } from 'rxjs';
import { ProductService } from './product.service';

const { like } = MatchersV3;

describe('Product Service', () => {
  let service: ProductService;
  let provider: PactV3;

  beforeAll(() => {
    provider = new PactV3({
      consumer: 'GUI',
      dir: 'pact/pacts',
      logLevel: 'debug',
      port: 4000,
      provider: 'Product Service',
    });
  })

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ],
      providers: [
        HttpClient,
        ProductService,
      ]
    });

    service = TestBed.inject(ProductService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('Given there are already some products in the database', () => {

    const expectedProduct = { idProduct: 1, name: 'My Product' };
    const requestBody = { "query":"{ product { data { idProduct name } } }", "variables": null }
    const expectedResponse = { data: { product: { data: [ expectedProduct ] } } };


    it('should get a list of existing products', async () => {
      // since version 3 new GraphQLInteraction() / .given() and .withQuery seem not to work anymore
      provider
        .given('there are already some products in the database')
        .uponReceiving('a request to load a list of existing products')
        .withRequest({
          method: 'POST',
          path: `/product/graphql`,
          headers: {
            'Content-Type': 'application/json',
            Accept: "application/json",
          },

          /*
           * Adding a body to the request fails with:
           * `Http failure response for http://127.0.0.1:4000/product/graphql: 500 Internal Server Error`
           *
           * The goal is to have the request body in the created Pact, because without it, it is
           * quite useless.
           */
          // body: requestBody,                                     // fails
          // body: MatchersV3.like(requestBody),                    // fails
          // body: MatchersV3.string(JSON.stringify(requestBody)),  // fails
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: MatchersV3.like({ data: { product: { data: [ { idProduct: 1, name: 'My Product' } ] } } })
        });

      await provider.executeTest(async (mockService: any) => {
        service.baseUrl = mockService.url + '/product';
        console.log("___ Base URL for dummy request to the mockserver", service.baseUrl);

        const products  = await firstValueFrom(service.getProducts());
        console.log("___ Response when test is passing without the body", products);

        expect(products).toEqual(expectedResponse);
      });
    });
  });

});  // end describe Product Service

