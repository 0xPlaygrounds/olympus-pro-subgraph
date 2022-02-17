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

export class BondCreated extends ethereum.Event {
  get params(): BondCreated__Params {
    return new BondCreated__Params(this);
  }
}

export class BondCreated__Params {
  _event: BondCreated;

  constructor(event: BondCreated) {
    this._event = event;
  }

  get deposit(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get payout(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get expires(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class BondPriceChanged extends ethereum.Event {
  get params(): BondPriceChanged__Params {
    return new BondPriceChanged__Params(this);
  }
}

export class BondPriceChanged__Params {
  _event: BondPriceChanged;

  constructor(event: BondPriceChanged) {
    this._event = event;
  }

  get internalPrice(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get debtRatio(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class BondRedeemed extends ethereum.Event {
  get params(): BondRedeemed__Params {
    return new BondRedeemed__Params(this);
  }
}

export class BondRedeemed__Params {
  _event: BondRedeemed;

  constructor(event: BondRedeemed) {
    this._event = event;
  }

  get recipient(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get payout(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get remaining(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class ControlVariableAdjustment extends ethereum.Event {
  get params(): ControlVariableAdjustment__Params {
    return new ControlVariableAdjustment__Params(this);
  }
}

export class ControlVariableAdjustment__Params {
  _event: ControlVariableAdjustment;

  constructor(event: ControlVariableAdjustment) {
    this._event = event;
  }

  get initialBCV(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get newBCV(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get adjustment(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get addition(): boolean {
    return this._event.parameters[3].value.toBoolean();
  }
}

export class CustomBondV2__adjustmentResult {
  value0: boolean;
  value1: BigInt;
  value2: BigInt;
  value3: BigInt;
  value4: BigInt;

  constructor(
    value0: boolean,
    value1: BigInt,
    value2: BigInt,
    value3: BigInt,
    value4: BigInt
  ) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
    this.value4 = value4;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromBoolean(this.value0));
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    map.set("value2", ethereum.Value.fromUnsignedBigInt(this.value2));
    map.set("value3", ethereum.Value.fromUnsignedBigInt(this.value3));
    map.set("value4", ethereum.Value.fromUnsignedBigInt(this.value4));
    return map;
  }
}

export class CustomBondV2__bondInfoResult {
  value0: BigInt;
  value1: BigInt;
  value2: BigInt;
  value3: BigInt;

  constructor(value0: BigInt, value1: BigInt, value2: BigInt, value3: BigInt) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    map.set("value2", ethereum.Value.fromUnsignedBigInt(this.value2));
    map.set("value3", ethereum.Value.fromUnsignedBigInt(this.value3));
    return map;
  }
}

export class CustomBondV2__payoutForResult {
  value0: BigInt;
  value1: BigInt;

  constructor(value0: BigInt, value1: BigInt) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    return map;
  }
}

export class CustomBondV2__termsResult {
  value0: BigInt;
  value1: BigInt;
  value2: BigInt;
  value3: BigInt;
  value4: BigInt;

  constructor(
    value0: BigInt,
    value1: BigInt,
    value2: BigInt,
    value3: BigInt,
    value4: BigInt
  ) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
    this.value4 = value4;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    map.set("value2", ethereum.Value.fromUnsignedBigInt(this.value2));
    map.set("value3", ethereum.Value.fromUnsignedBigInt(this.value3));
    map.set("value4", ethereum.Value.fromUnsignedBigInt(this.value4));
    return map;
  }
}

export class CustomBondV2 extends ethereum.SmartContract {
  static bind(address: Address): CustomBondV2 {
    return new CustomBondV2("CustomBondV2", address);
  }

  adjustment(): CustomBondV2__adjustmentResult {
    let result = super.call(
      "adjustment",
      "adjustment():(bool,uint256,uint256,uint256,uint256)",
      []
    );

    return new CustomBondV2__adjustmentResult(
      result[0].toBoolean(),
      result[1].toBigInt(),
      result[2].toBigInt(),
      result[3].toBigInt(),
      result[4].toBigInt()
    );
  }

  try_adjustment(): ethereum.CallResult<CustomBondV2__adjustmentResult> {
    let result = super.tryCall(
      "adjustment",
      "adjustment():(bool,uint256,uint256,uint256,uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new CustomBondV2__adjustmentResult(
        value[0].toBoolean(),
        value[1].toBigInt(),
        value[2].toBigInt(),
        value[3].toBigInt(),
        value[4].toBigInt()
      )
    );
  }

  bondInfo(param0: Address): CustomBondV2__bondInfoResult {
    let result = super.call(
      "bondInfo",
      "bondInfo(address):(uint256,uint256,uint256,uint256)",
      [ethereum.Value.fromAddress(param0)]
    );

    return new CustomBondV2__bondInfoResult(
      result[0].toBigInt(),
      result[1].toBigInt(),
      result[2].toBigInt(),
      result[3].toBigInt()
    );
  }

  try_bondInfo(
    param0: Address
  ): ethereum.CallResult<CustomBondV2__bondInfoResult> {
    let result = super.tryCall(
      "bondInfo",
      "bondInfo(address):(uint256,uint256,uint256,uint256)",
      [ethereum.Value.fromAddress(param0)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new CustomBondV2__bondInfoResult(
        value[0].toBigInt(),
        value[1].toBigInt(),
        value[2].toBigInt(),
        value[3].toBigInt()
      )
    );
  }

  bondPrice(): BigInt {
    let result = super.call("bondPrice", "bondPrice():(uint256)", []);

    return result[0].toBigInt();
  }

  try_bondPrice(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("bondPrice", "bondPrice():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  currentDebt(): BigInt {
    let result = super.call("currentDebt", "currentDebt():(uint256)", []);

    return result[0].toBigInt();
  }

  try_currentDebt(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("currentDebt", "currentDebt():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  currentOlympusFee(): BigInt {
    let result = super.call(
      "currentOlympusFee",
      "currentOlympusFee():(uint256)",
      []
    );

    return result[0].toBigInt();
  }

  try_currentOlympusFee(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "currentOlympusFee",
      "currentOlympusFee():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  debtDecay(): BigInt {
    let result = super.call("debtDecay", "debtDecay():(uint256)", []);

    return result[0].toBigInt();
  }

  try_debtDecay(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("debtDecay", "debtDecay():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  debtRatio(): BigInt {
    let result = super.call("debtRatio", "debtRatio():(uint256)", []);

    return result[0].toBigInt();
  }

  try_debtRatio(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("debtRatio", "debtRatio():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  deposit(_amount: BigInt, _maxPrice: BigInt, _depositor: Address): BigInt {
    let result = super.call(
      "deposit",
      "deposit(uint256,uint256,address):(uint256)",
      [
        ethereum.Value.fromUnsignedBigInt(_amount),
        ethereum.Value.fromUnsignedBigInt(_maxPrice),
        ethereum.Value.fromAddress(_depositor)
      ]
    );

    return result[0].toBigInt();
  }

  try_deposit(
    _amount: BigInt,
    _maxPrice: BigInt,
    _depositor: Address
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "deposit",
      "deposit(uint256,uint256,address):(uint256)",
      [
        ethereum.Value.fromUnsignedBigInt(_amount),
        ethereum.Value.fromUnsignedBigInt(_maxPrice),
        ethereum.Value.fromAddress(_depositor)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  lastDecay(): BigInt {
    let result = super.call("lastDecay", "lastDecay():(uint256)", []);

    return result[0].toBigInt();
  }

  try_lastDecay(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("lastDecay", "lastDecay():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  maxPayout(): BigInt {
    let result = super.call("maxPayout", "maxPayout():(uint256)", []);

    return result[0].toBigInt();
  }

  try_maxPayout(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("maxPayout", "maxPayout():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  paySubsidy(): BigInt {
    let result = super.call("paySubsidy", "paySubsidy():(uint256)", []);

    return result[0].toBigInt();
  }

  try_paySubsidy(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("paySubsidy", "paySubsidy():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  payoutFor(_value: BigInt): CustomBondV2__payoutForResult {
    let result = super.call(
      "payoutFor",
      "payoutFor(uint256):(uint256,uint256)",
      [ethereum.Value.fromUnsignedBigInt(_value)]
    );

    return new CustomBondV2__payoutForResult(
      result[0].toBigInt(),
      result[1].toBigInt()
    );
  }

  try_payoutFor(
    _value: BigInt
  ): ethereum.CallResult<CustomBondV2__payoutForResult> {
    let result = super.tryCall(
      "payoutFor",
      "payoutFor(uint256):(uint256,uint256)",
      [ethereum.Value.fromUnsignedBigInt(_value)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new CustomBondV2__payoutForResult(
        value[0].toBigInt(),
        value[1].toBigInt()
      )
    );
  }

  pendingPayoutFor(_depositor: Address): BigInt {
    let result = super.call(
      "pendingPayoutFor",
      "pendingPayoutFor(address):(uint256)",
      [ethereum.Value.fromAddress(_depositor)]
    );

    return result[0].toBigInt();
  }

  try_pendingPayoutFor(_depositor: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "pendingPayoutFor",
      "pendingPayoutFor(address):(uint256)",
      [ethereum.Value.fromAddress(_depositor)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  percentVestedFor(_depositor: Address): BigInt {
    let result = super.call(
      "percentVestedFor",
      "percentVestedFor(address):(uint256)",
      [ethereum.Value.fromAddress(_depositor)]
    );

    return result[0].toBigInt();
  }

  try_percentVestedFor(_depositor: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "percentVestedFor",
      "percentVestedFor(address):(uint256)",
      [ethereum.Value.fromAddress(_depositor)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
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

  redeem(_depositor: Address): BigInt {
    let result = super.call("redeem", "redeem(address):(uint256)", [
      ethereum.Value.fromAddress(_depositor)
    ]);

    return result[0].toBigInt();
  }

  try_redeem(_depositor: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall("redeem", "redeem(address):(uint256)", [
      ethereum.Value.fromAddress(_depositor)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  terms(): CustomBondV2__termsResult {
    let result = super.call(
      "terms",
      "terms():(uint256,uint256,uint256,uint256,uint256)",
      []
    );

    return new CustomBondV2__termsResult(
      result[0].toBigInt(),
      result[1].toBigInt(),
      result[2].toBigInt(),
      result[3].toBigInt(),
      result[4].toBigInt()
    );
  }

  try_terms(): ethereum.CallResult<CustomBondV2__termsResult> {
    let result = super.tryCall(
      "terms",
      "terms():(uint256,uint256,uint256,uint256,uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new CustomBondV2__termsResult(
        value[0].toBigInt(),
        value[1].toBigInt(),
        value[2].toBigInt(),
        value[3].toBigInt(),
        value[4].toBigInt()
      )
    );
  }

  totalDebt(): BigInt {
    let result = super.call("totalDebt", "totalDebt():(uint256)", []);

    return result[0].toBigInt();
  }

  try_totalDebt(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("totalDebt", "totalDebt():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  totalPayoutGiven(): BigInt {
    let result = super.call(
      "totalPayoutGiven",
      "totalPayoutGiven():(uint256)",
      []
    );

    return result[0].toBigInt();
  }

  try_totalPayoutGiven(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "totalPayoutGiven",
      "totalPayoutGiven():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  totalPrincipalBonded(): BigInt {
    let result = super.call(
      "totalPrincipalBonded",
      "totalPrincipalBonded():(uint256)",
      []
    );

    return result[0].toBigInt();
  }

  try_totalPrincipalBonded(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "totalPrincipalBonded",
      "totalPrincipalBonded():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  trueBondPrice(): BigInt {
    let result = super.call("trueBondPrice", "trueBondPrice():(uint256)", []);

    return result[0].toBigInt();
  }

  try_trueBondPrice(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "trueBondPrice",
      "trueBondPrice():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
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

  get _customTreasury(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _principalToken(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _olympusTreasury(): Address {
    return this._call.inputValues[2].value.toAddress();
  }

  get _subsidyRouter(): Address {
    return this._call.inputValues[3].value.toAddress();
  }

  get _initialOwner(): Address {
    return this._call.inputValues[4].value.toAddress();
  }

  get _olympusDAO(): Address {
    return this._call.inputValues[5].value.toAddress();
  }

  get _tierCeilings(): Array<BigInt> {
    return this._call.inputValues[6].value.toBigIntArray();
  }

  get _fees(): Array<BigInt> {
    return this._call.inputValues[7].value.toBigIntArray();
  }

  get _feeInPayout(): boolean {
    return this._call.inputValues[8].value.toBoolean();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class ChangeOlympusTreasuryCall extends ethereum.Call {
  get inputs(): ChangeOlympusTreasuryCall__Inputs {
    return new ChangeOlympusTreasuryCall__Inputs(this);
  }

  get outputs(): ChangeOlympusTreasuryCall__Outputs {
    return new ChangeOlympusTreasuryCall__Outputs(this);
  }
}

export class ChangeOlympusTreasuryCall__Inputs {
  _call: ChangeOlympusTreasuryCall;

  constructor(call: ChangeOlympusTreasuryCall) {
    this._call = call;
  }

  get _olympusTreasury(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class ChangeOlympusTreasuryCall__Outputs {
  _call: ChangeOlympusTreasuryCall;

  constructor(call: ChangeOlympusTreasuryCall) {
    this._call = call;
  }
}

export class DepositCall extends ethereum.Call {
  get inputs(): DepositCall__Inputs {
    return new DepositCall__Inputs(this);
  }

  get outputs(): DepositCall__Outputs {
    return new DepositCall__Outputs(this);
  }
}

export class DepositCall__Inputs {
  _call: DepositCall;

  constructor(call: DepositCall) {
    this._call = call;
  }

  get _amount(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get _maxPrice(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get _depositor(): Address {
    return this._call.inputValues[2].value.toAddress();
  }
}

export class DepositCall__Outputs {
  _call: DepositCall;

  constructor(call: DepositCall) {
    this._call = call;
  }

  get value0(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }
}

export class InitializeBondCall extends ethereum.Call {
  get inputs(): InitializeBondCall__Inputs {
    return new InitializeBondCall__Inputs(this);
  }

  get outputs(): InitializeBondCall__Outputs {
    return new InitializeBondCall__Outputs(this);
  }
}

export class InitializeBondCall__Inputs {
  _call: InitializeBondCall;

  constructor(call: InitializeBondCall) {
    this._call = call;
  }

  get _controlVariable(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get _vestingTerm(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get _minimumPrice(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get _maxPayout(): BigInt {
    return this._call.inputValues[3].value.toBigInt();
  }

  get _maxDebt(): BigInt {
    return this._call.inputValues[4].value.toBigInt();
  }

  get _initialDebt(): BigInt {
    return this._call.inputValues[5].value.toBigInt();
  }
}

export class InitializeBondCall__Outputs {
  _call: InitializeBondCall;

  constructor(call: InitializeBondCall) {
    this._call = call;
  }
}

export class PaySubsidyCall extends ethereum.Call {
  get inputs(): PaySubsidyCall__Inputs {
    return new PaySubsidyCall__Inputs(this);
  }

  get outputs(): PaySubsidyCall__Outputs {
    return new PaySubsidyCall__Outputs(this);
  }
}

export class PaySubsidyCall__Inputs {
  _call: PaySubsidyCall;

  constructor(call: PaySubsidyCall) {
    this._call = call;
  }
}

export class PaySubsidyCall__Outputs {
  _call: PaySubsidyCall;

  constructor(call: PaySubsidyCall) {
    this._call = call;
  }

  get payoutSinceLastSubsidy_(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }
}

export class RedeemCall extends ethereum.Call {
  get inputs(): RedeemCall__Inputs {
    return new RedeemCall__Inputs(this);
  }

  get outputs(): RedeemCall__Outputs {
    return new RedeemCall__Outputs(this);
  }
}

export class RedeemCall__Inputs {
  _call: RedeemCall;

  constructor(call: RedeemCall) {
    this._call = call;
  }

  get _depositor(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class RedeemCall__Outputs {
  _call: RedeemCall;

  constructor(call: RedeemCall) {
    this._call = call;
  }

  get value0(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }
}

export class SetAdjustmentCall extends ethereum.Call {
  get inputs(): SetAdjustmentCall__Inputs {
    return new SetAdjustmentCall__Inputs(this);
  }

  get outputs(): SetAdjustmentCall__Outputs {
    return new SetAdjustmentCall__Outputs(this);
  }
}

export class SetAdjustmentCall__Inputs {
  _call: SetAdjustmentCall;

  constructor(call: SetAdjustmentCall) {
    this._call = call;
  }

  get _addition(): boolean {
    return this._call.inputValues[0].value.toBoolean();
  }

  get _increment(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get _target(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get _buffer(): BigInt {
    return this._call.inputValues[3].value.toBigInt();
  }
}

export class SetAdjustmentCall__Outputs {
  _call: SetAdjustmentCall;

  constructor(call: SetAdjustmentCall) {
    this._call = call;
  }
}

export class SetBondTermsCall extends ethereum.Call {
  get inputs(): SetBondTermsCall__Inputs {
    return new SetBondTermsCall__Inputs(this);
  }

  get outputs(): SetBondTermsCall__Outputs {
    return new SetBondTermsCall__Outputs(this);
  }
}

export class SetBondTermsCall__Inputs {
  _call: SetBondTermsCall;

  constructor(call: SetBondTermsCall) {
    this._call = call;
  }

  get _parameter(): i32 {
    return this._call.inputValues[0].value.toI32();
  }

  get _input(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class SetBondTermsCall__Outputs {
  _call: SetBondTermsCall;

  constructor(call: SetBondTermsCall) {
    this._call = call;
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
