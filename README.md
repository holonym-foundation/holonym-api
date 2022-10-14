## Endpoints

For the `/residence/country/<country-code>` endpoints, `<country-code>` will be a 2-letter country code following the [ISO 3166 standard](https://www.iso.org/iso-3166-country-codes.html). Holonym currently only supports queries for US residency.

- **GET** `/residence/country/us`
- **GET** `/sybil-resistance`

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

### **GET** `/sybil-resistance?user=<user-address>&action-id=<action-id>`

Get whether the user has performed the given action.

If the user has not proven that they have performed the action or if the user has performed the action multiple times, then this endpoint will return false.

See the following documentation for how to use action IDs: [How to get user's proofs](https://holonym.gitbook.io/holonym-alpha/usage/how-to-stop-sybil-attacks-using-holonym#how-to-get-the-proof).

- Parameters

  | name        | description               | type   | in    | required |
  | ----------- | ------------------------- | ------ | ----- | -------- |
  | `user`      | User's blockchain address | string | query | true     |
  | `action-id` | Action ID                 | string | query | true     |

- Example

  ```bash
  curl -X GET 'http://localhost:3010/sybil-resistance?user=0x0000000000000000000000000000000000000000&action-id=12345678'
  ```

- Responses

  - 200

        Result if user has proven they have performed the action exactly once.

    ```JSON

      {
          "result": true,
      }

    ```

  - 200

        Result if user has not submitted a valid proof.

    ```JSON

      {
          "result": false,
      }

    ```
