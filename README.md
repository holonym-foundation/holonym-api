## Endpoints

For the `/residence/country/<country-code>` endpoints, `<country-code>` will be a 2-letter country code following the [ISO 3166 standard](https://www.iso.org/iso-3166-country-codes.html). Holonym currently only supports queries for US residency.

- **GET** `/residence/country/us`

### **GET** `/residence/country/us?user=<user-address>`

Get whether the user resides in the US.

- Parameters

  | name   | description               | type   | in    | required |
  | ------ | ------------------------- | ------ | ----- | -------- |
  | `user` | User's blockchain address | string | query | true     |

- Example

  ```bash
  curl -X GET 'http://localhost:3010/residence/country/us?user=0x0000000000000000000000000000000000000000'
  ```

- Responses

  - 200

        Result if user resides in the US.

    ```JSON

      {
          "result": true,
      }

    ```

  - 200

        Result if user has not submitted a valid proof that they reside in the US.

    ```JSON

      {
          "result": false,
      }

    ```
