# Description
This document provides a detailed list of steps required to support manual bonds (i.e.: bonds that were deployed manually, without using either bond factory contracts) to the current Olympus Pro subgraph.

## Assumptions
This plan assumes that the manual bonds were based on either the bond V1 or V2 contracts which are deployed via the bond factory contracts. More specifically, the assumption is made that the event signatures are the same.

Moreover, this plan assumes that each manual bond's principal token is either a plain ERC20 token (including staked variants like `xSUSHI`) or an LP token **with exactly two tokens**. If this is not the case, then the data model would have to be changed, which significantly increases the complexity of the upgrade process as the existing subgraph would also have to be upgraded with breaking changes.

## Prerequisites
For each manual bond, gather the following information:
- Address
- Deployment block and timestamp
- Which bond contract they were based on (i.e.: V1 bond or V2 bond)
- Payout token address and type (e.g.: simple ERC20, Uniswap V2 LP token, Visor LP token...)
- Principal token address and type (e.g.: simple ERC20, Uniswap V2 LP token, Visor LP token...)
  - If principal token is an LP token, get the addresses of token0 and token1
- Address of treasury to which bonded assets are sent
- Address of initial bond owner

## Step 0: Decide on subgraph update vs different subgraph
The first step will be to decide on whether or not to create a new subgaph exclusively for manual bonds as opposed to upgrading the current subgraph. This is purely a DevOps decision, as in both cases, there will be limited need to write or update code. Nota that if the decision is made to have a separate subgraph for manual bonds, both GraphQL APIs will also be the same.

Pros of having a different subgraph for manual bonds:
- When new manual bonds are deployed, no need to reindex all the data, but only the subgraph indexing manual bonds (more efficient)

Cons of having a different subgraph for manual bonds:
- The data is divided into two APIs. Although both APIs are the same, this increases the client-side complexity slightly as both subgraphs have to be queried to get all the data.

If you choose to upgrade the existing subgraph, start from the existing subgraph's `main` branch. If creating a new subgraph, fork the existing subgraph's code and go from there. 

## Step 1: Add manual bond contracts to subgraph manifest
**For each manual bond**, add the following to the subgraph manifest (`subgraph.yaml`) under the `dataSources` field:
```yaml
  - name: BOND_NAME
    kind: ethereum/contract
    network: mainnet
    source:
      address: BOND_ADDRESS
      startBlock: BOND_DEPLOYMENT_BLOCK
      abi: BOND_ABI
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.6
      language: wasm/assemblyscript
      entities:
        - Bond
        - DailyBond
      abis:
        - name: BOND_ABI
          file: ./abis/BOND_ABI.json
        - name: ERC20
          file: ./abis/ERC20.json
        - name: UniswapV2Pair
          file: ./abis/UniswapV2Pair.json
        - name: UniswapRouter
          file: ./abis/UniswapRouter.json
        - name: OffchainOracle
          file: ./abis/OffchainOracle.json

        # Special cases
        - name: Hypervisor
          file: ./abis/Hypervisor.json
        - name: TAsset
          file: ./abis/TAsset.json
        - name: GUniPool
          file: ./abis/GUniPool.json
      eventHandlers:
        - event: BondCreated(uint256,uint256,uint256)
          handler: handleBondCreated
        - event: BondRedeemed(address,uint256,uint256)
          handler: handleBondRedeemed
      file: ./src/BOND_ABI.ts
```

The values to set for each bond are:
- `BOND_NAME`: The name of the bond (e.g.: `OHM_WETH_BOND`)
- `BOND_ADDRESS`: Bond address
- `BOND_DEPLOYMENT_BLOCK`: The block at which the bond contract was deployed
- `BOND_ABI`: Either `CustomBondV1` or `CustomBondV2` (depending on which bond contract the manual bond was based on)

Note: If creating a different subgraph for manual bonds, then you can delete all existing `dataSources` and `templates` in

## Step 2. Update mappings
Create a new file `src/utils/init.ts` with the following (imports left out for brevity):
```typescript
export function initManualBonds(): void {
  // REPEAT FOR EACH MANUAL BOND!!!!
  let bond = new Bond(BOND_ADDRESS)
  bond.createdAtTimestamp = BOND_CREATION_TIMESTAMP
  bond.fees = FEE_PERCENTAGE_PERCENT    // For a fee of 3.33%, write 3.33
  bond.treasury = BOND_TREASURY_ADDRESS
  bond.payoutToken = PAYOUT_TOKEN_ADDRESS
  bond.principalToken = PRINCIPAL_TOKEN_ADDRESS
  bond.owner = INITIAL_BOND_OWNER_ADDRESS

  // If principal token is ERC20
  bond.token0 = PRINCIPAL_TOKEN_ADDRESS
  bond.token1 = null
  bond.name = PRINCIPAL_TOKEN_SYMBOL
  bond.type = "ERC20"
  // If principal token is LP token
  bond.token0 = LP_TOKEN0_ADDRESS
  bond.token1 = LP_TOKEN1_ADDRESS
  bond.name = LP_TOKEN0_SYMBOL + "-" + LP_TOKEN1_SYMBOL
  bond.type = "LP"
  
  bond.save()  // <----------- IMPORTANT

  ...
}
```

In `src/CustomBondV1.ts` and `src/CustomBondV2.ts`, add the following to the `handleBondCreated`:
```typescript
export function handleBondCreated(event: BondCreated): void {
  let bond = Bond.load(event.address.toHexString()) as Bond

  // NEW CODE GOES HERE!!!!
  if (!bond) {
    initManualBonds()
    bond = Bond.load(event.address.toHexString()) as Bond
  }
  // NEW CODE STOPS HERE!!!

  log.debug("handleBondCreated: deposit = {}, payout = {}, expires = {}", [
    event.params.deposit.toString(),
    event.params.payout.toString(),
    event.params.expires.toString()
  ])
  ...
}
```

What the these two changes do is initialize the manual bonds' `Bond` entities. In the existing subgraph, the creation of the `Bond` entities are handled in the factory contracts' event handlers. However, since we are not using the factory contracts here, we have to invoke the `initBond` manually. The code above will create all the manual bonds' `Bond` entities when the first `BondCreated` event (of any manual bond) triggers the handler(s).

**IMPORTANT**: Make sure that the bonds created in the `initManualBonds` function match the manual bonds added as `dataSources` in the subgraph manifest. If a bond is omitted from the `initManualBonds` function, it will cause the subgraph to crash.

Note: If creating a different subgraph for manual bonds, the factory contract mappings (i.e.: `src/OPFactoryV1.ts` and `src/OPFactoryV2.ts`) can be deleted. 

## Step 3. Add missing price feeds
This is the hardest and most complicated part of the upgrade plan.

The existing subgraph contains a file `src/utils/Price.ts` which contains various functions used to fetch the market price of different kinds of tokens. The two important functions in this file are `getSwapPrice1Inch` and `getLPReserves`.

The `getSwapPrice1Inch` function is used to get the price of a token using the 1Inch aggregator contract. It also handles two special cases: 1) Tokemak tTokens; and 2) Staked SDT (i.e.: `xSDT`) which are not tradable through 1Inch. 

**IMPORTANT**: If a manual bond's principal or payout token is not tradedable on 1Inch, then a special case for it in `getSwapPrice1Inch` will have to be added.

Likewise, the `getLPReserves` function is used to get the reserves of tokens in a (two token) liquidity pool. These values are then used in the `getLPStablePrice` function to get the unit price of the LP token. `getLPReserves` currently handles Uniswap V2 LP tokens (along with Uniswap V2 forks like Sushiswap), Visor LP tokens and Sorbet finance LP tokens.

**IMPORTANT**: If a manual bond's principal or payout token is an LP token which does not fall under these categories, then an additional special case will have to be added to `getLPReserves`.

Tl;DR: If a manual bond's principal or payout token is not supported by the existing subgraph, then either `getSwapPrice1Inch` (in the case when it is not an LP token) or `getLPReserves` (in the case when it is an LP token) will have to be updated with the required special case. There is no formulaic way to go about this as each protocol is different.