REST API for retrieving data from Holonym smart contracts.

Built so that projects can integrate Holo with two lines of code.

## Supported chains

- Optimism Goerli

We plan to support more chains in the future. If you would like to use Holonym on a chain other than the ones currently supported, please reach out to us. You can find ways to contact us on [our website](https://holonym.id/).

## Endpoints

- **GET** `/merkle-tree/leaves`
- **GET** `/residence/country/us`
- **GET** `/sybil-resistance`
- **GET** `/snapshot-strategies/us-residency`
- **GET** `/snapshot-strategies/sybil-resistance`

### **GET** `/merkle-tree/leaves`

Get the leaves of the Holo Merkle tree (i.e., Anonymity Pool).

This endpoint can be called when generating Merkle proofs.

- Example

  ```JavaScript
  const resp = await fetch('https://api.holonym.io/merkle-tree/leaves');
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
  const resp = await fetch('https://api.holonym.io/residence/country/us?user=0x0000000000000000000000000000000000000000');
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

Get whether the user has registered for the given action-id.

When a user "registers", they are establishing that the given blockchain address is a unique person for the action ID. See the section [Sybil resistance](#sybil-resistance) for more information about how action IDs can be used.

See the following documentation [How to get user's proofs](https://holonym.gitbook.io/holonym-alpha/usage/how-to-stop-sybil-attacks-using-holonym#how-to-get-the-proof) for how to use action IDs.

- Parameters

  | name        | description               | type   | in    | required |
  | ----------- | ------------------------- | ------ | ----- | -------- |
  | `user`      | User's blockchain address | string | query | true     |
  | `action-id` | Action ID                 | string | query | true     |

- Example

  ```JavaScript
  const resp = await fetch('https://api.holonym.io/sybil-resistance?user=0x0000000000000000000000000000000000000000&action-id=12345678');
  const { result: isUnique } = await resp.json();
  ```

- Responses

  - 200

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

### **GET** `/snapshot-strategies/us-residency?network=<network>&snapshot=<snapshot>&addresses=<addresses>`

<!-- TODO: Add endpoint that returns 1 if user is *not* a US resident and 0 otherwise -->

Returns a list of scores indicating, for each address, whether the address has submitted a valid and unique proof of US residency.

Every score is either 1 or 0.

| score | description                           |
| ----- | ------------------------------------- |
| 1     | Address has proven US residency       |
| 0     | Address has _not_ proven US residency |

### Use with Snapshot

To use with the ["api"](https://github.com/snapshot-labs/snapshot-strategies/tree/master/src/strategies/api) Snapshot strategy, specify the strategy parameters using the following format.

    {
      "api": "https://api.holonym.io",
      "symbol": "",
      "decimals": 0,
      "strategy": "us-residency"
    }

### Use without Snapshot

- Parameters

  | name        | description                                    | type   | in    | required |
  | ----------- | ---------------------------------------------- | ------ | ----- | -------- |
  | `network`   | Chain ID                                       | string | query | true     |
  | `snapshot`  | Block height                                   | string | query | true     |
  | `addresses` | List of blockchain address separated by commas | string | query | true     |

- Example

  ```JavaScript
  const resp = await fetch('https://api.holonym.io/snapshot-strategies/us-residency?network=420&snapshot=9001&addresses=0x0000000000000000000000000000000000000000,0x0000000000000000000000000000000000000001');
  const data = await resp.json();
  ```

- Responses

  - 200

    ```JSON
    {
      "score" : [
          {
            "address" : "0x0000000000000000000000000000000000000000",
            "score" : 0
          },
          {
            "address" : "0x0000000000000000000000000000000000000001",
            "score" : 1
          }
      ]
    }
    ```

### **GET** `/snapshot-strategies/sybil-resistance?network=<network>&snapshot=<snapshot>&addresses=<addresses>&action-id=<action-id>`

Returns a list of scores indicating, for each address, whether the address has submitted a valid proof of uniqueness for the given action-id.

Every score is either 1 or 0.

| score | description                                       |
| ----- | ------------------------------------------------- |
| 1     | Address has proven uniqueness for action-id       |
| 0     | Address has _not_ proven uniqueness for action-id |

### Use with Snapshot

To use with the ["api"](https://github.com/snapshot-labs/snapshot-strategies/tree/master/src/strategies/api) Snapshot strategy, specify the strategy parameters using the following format. Replace `123` with your action-id.

    {
      "api": "https://api.holonym.io",
      "symbol": "",
      "decimals": 0,
      "strategy": "us-residency",
      "additionalParameters": "action-id=123"
    }

### Use without Snapshot

- Parameters

  | name        | description                                    | type   | in    | required |
  | ----------- | ---------------------------------------------- | ------ | ----- | -------- |
  | `network`   | Chain ID                                       | string | query | true     |
  | `snapshot`  | Block height                                   | string | query | true     |
  | `addresses` | List of blockchain address separated by commas | string | query | true     |

- Example

  ```JavaScript
  const resp = await fetch('https://api.holonym.io/snapshot-strategies/sybil-resistance?network=420&snapshot=9001&addresses=0x0000000000000000000000000000000000000000,0x0000000000000000000000000000000000000001&action-id=123');
  const data = await resp.json();
  ```

- Responses

  - 200

    ```JSON
    {
      "score" : [
          {
            "address" : "0x0000000000000000000000000000000000000000",
            "score" : 0
          },
          {
            "address" : "0x0000000000000000000000000000000000000001",
            "score" : 1
          }
      ]
    }
    ```

## Sybil resistance

The `sybil-resistance` endpoint uses blockchain-address + action-id pairings to establish uniqueness.

<!-- A user who has registered the blockchain-address + action-id pairing *x* has established that, for the action-id, no other blockchain address that has registered with this action-id is controlled by the person who controls the address in *x*. -->

You can use the action-id to designate something other than an action. You could create one action-id for one part of your action and another action-id for a different part. The purpose of this is to preserve user privacy. You could, for example, require that users register for the airdrop portion of your action (one action-id) and that they register separately for voting (another action-id); by doing this, you can perform Sybil-resistant airdrops and Sybil-resistant voting without creating links between the blockchain accounts that received airdrops and the accounts that voted.

<!-- TODO: Create a tree graph of variably global action ids, e.g.,...

    -- global_action_id
       |--- action-1
       |    |--- sub-action-1
       |    |--- sub-action-2
       |--- action-2 -->
