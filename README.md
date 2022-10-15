REST API for retrieving data from Holonym smart contracts.

Built so that projects can integrate Holo with two lines of code.

## Endpoints

- **GET** `/merkle-tree/leaves`
- **GET** `/residence/country/us`
- **GET** `/sybil-resistance`

### **GET** `/merkle-tree/leaves`

Get the leaves of the Holo Merkle tree (i.e., Anonymity Pool).

This endpoint can be called when generating Merkle proofs.

- Example

  ```JavaScript
  const resp = await fetch('http://localhost:3010/merkle-tree/leaves');
  const { result: leaves } = await resp.json();
  ```

- Responses

  - 200

  ```JSON
  {
      "result": [
        "0x1747b1561951392e2c515c7a58fade696c455b3ddec3a545a8cc928f71d104f8",
        "0x20ee87c5d3c27a081a23369dcb6f31bdd6f0dd7645aa5f349c4b46348250b62c",
        "0x108c187c81c01ee547689d4a646969d8956c66db20a8fbf5523e69e63418882b",
        ...
      ],
  }

  ```

### **GET** `/residence/country/us?user=<user-address>`

Get whether the user resides in the US.

For the `/residence/country/<country-code>` endpoints, `<country-code>` will be a 2-letter country code following the [ISO 3166 standard](https://www.iso.org/iso-3166-country-codes.html). Holonym currently only supports queries for US residency.

- Parameters

  | name   | description               | type   | in    | required |
  | ------ | ------------------------- | ------ | ----- | -------- |
  | `user` | User's blockchain address | string | query | true     |

- Example

  ```JavaScript
  const resp = await fetch('http://localhost:3010/residence/country/us?user=0x0000000000000000000000000000000000000000');
  const { result: isUSResident } = await resp.json();
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

See the following documentation [How to get user's proofs](https://holonym.gitbook.io/holonym-alpha/usage/how-to-stop-sybil-attacks-using-holonym#how-to-get-the-proof) for how to use action IDs.

- Parameters

  | name        | description               | type   | in    | required |
  | ----------- | ------------------------- | ------ | ----- | -------- |
  | `user`      | User's blockchain address | string | query | true     |
  | `action-id` | Action ID                 | string | query | true     |

- Example

  ```JavaScript
  const resp = await fetch('http://localhost:3010/sybil-resistance?user=0x0000000000000000000000000000000000000000&action-id=12345678');
  const { result: isUnique } = await resp.json();
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
