// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class OlympusProFactory__createBondResult {
  value0: Address;
  value1: Address;

  constructor(value0: Address, value1: Address) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromAddress(this.value0));
    map.set("value1", ethereum.Value.fromAddress(this.value1));
    return map;
  }
}

export class OlympusProFactory__createBondAndTreasuryResult {
  value0: Address;
  value1: Address;

  constructor(value0: Address, value1: Address) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromAddress(this.value0));
    map.set("value1", ethereum.Value.fromAddress(this.value1));
    return map;
  }
}

export class OlympusProFactory extends ethereum.SmartContract {
  static bind(address: Address): OlympusProFactory {
    return new OlympusProFactory("OlympusProFactory", address);
  }

  createBond(
    _payoutToken: Address,
    _principleToken: Address,
    _customTreasury: Address,
    _initialOwner: Address,
    _tierCeilings: Array<BigInt>,
    _fees: Array<BigInt>
  ): OlympusProFactory__createBondResult {
    let result = super.call(
      "createBond",
      "createBond(address,address,address,address,uint256[],uint256[]):(address,address)",
      [
        ethereum.Value.fromAddress(_payoutToken),
        ethereum.Value.fromAddress(_principleToken),
        ethereum.Value.fromAddress(_customTreasury),
        ethereum.Value.fromAddress(_initialOwner),
        ethereum.Value.fromUnsignedBigIntArray(_tierCeilings),
        ethereum.Value.fromUnsignedBigIntArray(_fees)
      ]
    );

    return new OlympusProFactory__createBondResult(
      result[0].toAddress(),
      result[1].toAddress()
    );
  }

  try_createBond(
    _payoutToken: Address,
    _principleToken: Address,
    _customTreasury: Address,
    _initialOwner: Address,
    _tierCeilings: Array<BigInt>,
    _fees: Array<BigInt>
  ): ethereum.CallResult<OlympusProFactory__createBondResult> {
    let result = super.tryCall(
      "createBond",
      "createBond(address,address,address,address,uint256[],uint256[]):(address,address)",
      [
        ethereum.Value.fromAddress(_payoutToken),
        ethereum.Value.fromAddress(_principleToken),
        ethereum.Value.fromAddress(_customTreasury),
        ethereum.Value.fromAddress(_initialOwner),
        ethereum.Value.fromUnsignedBigIntArray(_tierCeilings),
        ethereum.Value.fromUnsignedBigIntArray(_fees)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new OlympusProFactory__createBondResult(
        value[0].toAddress(),
        value[1].toAddress()
      )
    );
  }

  createBondAndTreasury(
    _payoutToken: Address,
    _principleToken: Address,
    _initialOwner: Address,
    _tierCeilings: Array<BigInt>,
    _fees: Array<BigInt>
  ): OlympusProFactory__createBondAndTreasuryResult {
    let result = super.call(
      "createBondAndTreasury",
      "createBondAndTreasury(address,address,address,uint256[],uint256[]):(address,address)",
      [
        ethereum.Value.fromAddress(_payoutToken),
        ethereum.Value.fromAddress(_principleToken),
        ethereum.Value.fromAddress(_initialOwner),
        ethereum.Value.fromUnsignedBigIntArray(_tierCeilings),
        ethereum.Value.fromUnsignedBigIntArray(_fees)
      ]
    );

    return new OlympusProFactory__createBondAndTreasuryResult(
      result[0].toAddress(),
      result[1].toAddress()
    );
  }

  try_createBondAndTreasury(
    _payoutToken: Address,
    _principleToken: Address,
    _initialOwner: Address,
    _tierCeilings: Array<BigInt>,
    _fees: Array<BigInt>
  ): ethereum.CallResult<OlympusProFactory__createBondAndTreasuryResult> {
    let result = super.tryCall(
      "createBondAndTreasury",
      "createBondAndTreasury(address,address,address,uint256[],uint256[]):(address,address)",
      [
        ethereum.Value.fromAddress(_payoutToken),
        ethereum.Value.fromAddress(_principleToken),
        ethereum.Value.fromAddress(_initialOwner),
        ethereum.Value.fromUnsignedBigIntArray(_tierCeilings),
        ethereum.Value.fromUnsignedBigIntArray(_fees)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new OlympusProFactory__createBondAndTreasuryResult(
        value[0].toAddress(),
        value[1].toAddress()
      )
    );
  }

  olumpusProSubsidyRouter(): Address {
    let result = super.call(
      "olumpusProSubsidyRouter",
      "olumpusProSubsidyRouter():(address)",
      []
    );

    return result[0].toAddress();
  }

  try_olumpusProSubsidyRouter(): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "olumpusProSubsidyRouter",
      "olumpusProSubsidyRouter():(address)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  olympusDAO(): Address {
    let result = super.call("olympusDAO", "olympusDAO():(address)", []);

    return result[0].toAddress();
  }

  try_olympusDAO(): ethereum.CallResult<Address> {
    let result = super.tryCall("olympusDAO", "olympusDAO():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  olympusProFactoryStorage(): Address {
    let result = super.call(
      "olympusProFactoryStorage",
      "olympusProFactoryStorage():(address)",
      []
    );

    return result[0].toAddress();
  }

  try_olympusProFactoryStorage(): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "olympusProFactoryStorage",
      "olympusProFactoryStorage():(address)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  olympusTreasury(): Address {
    let result = super.call(
      "olympusTreasury",
      "olympusTreasury():(address)",
      []
    );

    return result[0].toAddress();
  }

  try_olympusTreasury(): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "olympusTreasury",
      "olympusTreasury():(address)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  policy(): Address {
    let result = super.call("policy", "policy():(address)", []);

    return result[0].toAddress();
  }

  try_policy(): ethereum.CallResult<Address> {
    let result = super.tryCall("policy", "policy():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get _olympusTreasury(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _olympusProFactoryStorage(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _olumpusProSubsidyRouter(): Address {
    return this._call.inputValues[2].value.toAddress();
  }

  get _olympusDAO(): Address {
    return this._call.inputValues[3].value.toAddress();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class CreateBondCall extends ethereum.Call {
  get inputs(): CreateBondCall__Inputs {
    return new CreateBondCall__Inputs(this);
  }

  get outputs(): CreateBondCall__Outputs {
    return new CreateBondCall__Outputs(this);
  }
}

export class CreateBondCall__Inputs {
  _call: CreateBondCall;

  constructor(call: CreateBondCall) {
    this._call = call;
  }

  get _payoutToken(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _principleToken(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _customTreasury(): Address {
    return this._call.inputValues[2].value.toAddress();
  }

  get _initialOwner(): Address {
    return this._call.inputValues[3].value.toAddress();
  }

  get _tierCeilings(): Array<BigInt> {
    return this._call.inputValues[4].value.toBigIntArray();
  }

  get _fees(): Array<BigInt> {
    return this._call.inputValues[5].value.toBigIntArray();
  }
}

export class CreateBondCall__Outputs {
  _call: CreateBondCall;

  constructor(call: CreateBondCall) {
    this._call = call;
  }

  get _treasury(): Address {
    return this._call.outputValues[0].value.toAddress();
  }

  get _bond(): Address {
    return this._call.outputValues[1].value.toAddress();
  }
}

export class CreateBondAndTreasuryCall extends ethereum.Call {
  get inputs(): CreateBondAndTreasuryCall__Inputs {
    return new CreateBondAndTreasuryCall__Inputs(this);
  }

  get outputs(): CreateBondAndTreasuryCall__Outputs {
    return new CreateBondAndTreasuryCall__Outputs(this);
  }
}

export class CreateBondAndTreasuryCall__Inputs {
  _call: CreateBondAndTreasuryCall;

  constructor(call: CreateBondAndTreasuryCall) {
    this._call = call;
  }

  get _payoutToken(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _principleToken(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _initialOwner(): Address {
    return this._call.inputValues[2].value.toAddress();
  }

  get _tierCeilings(): Array<BigInt> {
    return this._call.inputValues[3].value.toBigIntArray();
  }

  get _fees(): Array<BigInt> {
    return this._call.inputValues[4].value.toBigIntArray();
  }
}

export class CreateBondAndTreasuryCall__Outputs {
  _call: CreateBondAndTreasuryCall;

  constructor(call: CreateBondAndTreasuryCall) {
    this._call = call;
  }

  get _treasury(): Address {
    return this._call.outputValues[0].value.toAddress();
  }

  get _bond(): Address {
    return this._call.outputValues[1].value.toAddress();
  }
}

export class TransferManagmentCall extends ethereum.Call {
  get inputs(): TransferManagmentCall__Inputs {
    return new TransferManagmentCall__Inputs(this);
  }

  get outputs(): TransferManagmentCall__Outputs {
    return new TransferManagmentCall__Outputs(this);
  }
}

export class TransferManagmentCall__Inputs {
  _call: TransferManagmentCall;

  constructor(call: TransferManagmentCall) {
    this._call = call;
  }

  get _newOwner(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class TransferManagmentCall__Outputs {
  _call: TransferManagmentCall;

  constructor(call: TransferManagmentCall) {
    this._call = call;
  }
}
